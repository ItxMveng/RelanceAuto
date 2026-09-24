import { sql, Row } from './db';
import { sendMail, smtpConfigured } from './mailer';
import { humanizeSmtpError } from './providers';
import { defaultSteps, firstName, render, Step, Tone, Vars } from './templates';

export const TRIAL_LEAD_LIMIT = 10;
export const TRIAL_REAL_EMAIL_LIMIT = 30;
const DAY_MIN = 1440;

export function appUrl(): string {
  return (process.env.APP_URL || 'http://localhost:3200').replace(/\/$/, '');
}

export function trialState(account: Row) {
  const isPro = account.plan === 'pro';
  const endsAt = new Date(account.trial_ends_at).getTime();
  const msLeft = endsAt - Date.now();
  return {
    isPro,
    active: isPro || msLeft > 0,
    daysLeft: Math.max(0, Math.ceil(msLeft / 86_400_000)),
    endsAt: new Date(endsAt),
  };
}

/** En simulation, « maintenant » avance avec le décalage choisi ; en envoi réel, jamais. */
export function effectiveNow(account: Row): Date {
  const offset = account.send_mode === 'simulation' ? Number(account.sim_offset_minutes) || 0 : 0;
  return new Date(Date.now() + offset * 60_000);
}

/** Fenêtre d'envoi (heure de Paris) : hors plage, les messages attendent la prochaine ouverture. */
export function inSendWindow(now: Date, fromHour: number, toHour: number): boolean {
  const part = new Intl.DateTimeFormat('en-GB', { hour: '2-digit', hourCycle: 'h23', timeZone: 'Europe/Paris' }).formatToParts(now).find((p) => p.type === 'hour');
  const hour = Number(part?.value);
  if (!Number.isFinite(hour) || !Number.isFinite(fromHour) || !Number.isFinite(toHour)) return true;
  return hour >= fromHour && hour < toHour;
}

export function stepsOf(account: Row): Step[] {
  const s = account.steps as Step[] | null;
  return Array.isArray(s) && s.length > 0 ? s : defaultSteps((account.tone as Tone) || 'warm');
}

function varsFor(account: Row, leadName: string): Vars {
  return {
    prenom: firstName(leadName),
    mon_prenom: account.my_name || '',
    activite: account.activity || '',
    lien: account.booking_link || '[votre lien de réservation]',
  };
}

export type CreateResult = { ok: true; leadId: string } | { ok: false; error: string };

export async function createLead(
  account: Row,
  input: { name: string; email: string; message?: string; source: 'manuel' | 'formulaire' | 'import' },
): Promise<CreateResult> {
  const trial = trialState(account);
  if (!trial.active) return { ok: false, error: 'Votre essai gratuit est terminé.' };
  if (!trial.isPro) {
    const [{ n }] = await sql<{ n: number }>('select count(*)::int as n from leads where account_id = $1', [account.id]);
    if (n >= TRIAL_LEAD_LIMIT) return { ok: false, error: `Limite de ${TRIAL_LEAD_LIMIT} contacts atteinte pendant l’essai.` };
  }
  const name = input.name.trim().slice(0, 120);
  const email = input.email.trim().toLowerCase().slice(0, 200);
  if (!name || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return { ok: false, error: 'Nom ou email invalide.' };

  const inserted = await sql<{ id: string }>(
    `insert into leads (account_id, name, email, message, source) values ($1,$2,$3,$4,$5)
     on conflict (account_id, lower(email)) do nothing returning id`,
    [account.id, name, email, (input.message ?? '').slice(0, 2000), input.source],
  );
  if (!inserted[0]) return { ok: false, error: 'Ce contact existe déjà.' };
  const leadId = inserted[0].id;

  const base = effectiveNow(account);
  const vars = varsFor(account, name);
  const steps = stepsOf(account);
  for (let i = 0; i < steps.length; i++) {
    const when = new Date(base.getTime() + steps[i].delayDays * DAY_MIN * 60_000);
    await sql(
      `insert into messages (lead_id, account_id, step_index, subject, body, scheduled_at) values ($1,$2,$3,$4,$5,$6)`,
      [leadId, account.id, i, render(steps[i].subject, vars), render(steps[i].body, vars), when.toISOString()],
    );
  }
  await tickAccount(account.id);
  return { ok: true, leadId };
}

async function finishLeadIfDone(leadId: string) {
  const [{ n }] = await sql<{ n: number }>(
    `select count(*)::int as n from messages where lead_id = $1 and status in ('scheduled','sending')`,
    [leadId],
  );
  if (n === 0) await sql(`update leads set status = 'completed' where id = $1 and status = 'active'`, [leadId]);
}

export async function setLeadStatus(accountId: string, leadId: string, status: 'booked' | 'stopped' | 'unsubscribed' | 'replied') {
  const rows = await sql(
    `update leads set status = $3, booked_at = case when $3 = 'booked' then now() else booked_at end
     where id = $2 and account_id = $1 and status in ('active','completed') returning id`,
    [accountId, leadId, status],
  );
  if (rows[0]) {
    await sql(`update messages set status = 'skipped' where lead_id = $1 and status = 'scheduled'`, [leadId]);
  }
  return Boolean(rows[0]);
}

export async function markBookedByEmail(accountId: string, email: string): Promise<number> {
  const rows = await sql<{ id: string }>(
    `select id from leads where account_id = $1 and lower(email) = lower($2) and status in ('active','completed')`,
    [accountId, email],
  );
  for (const r of rows) await setLeadStatus(accountId, r.id, 'booked');
  return rows.length;
}

export async function unsubscribeByToken(token: string): Promise<boolean> {
  const rows = await sql<{ id: string; account_id: string }>('select id, account_id from leads where unsub_token = $1', [token]);
  if (!rows[0]) return false;
  await sql(`update leads set status = 'unsubscribed' where id = $1`, [rows[0].id]);
  await sql(`update messages set status = 'skipped' where lead_id = $1 and status = 'scheduled'`, [rows[0].id]);
  return true;
}

export async function advanceTime(account: Row, days: number): Promise<boolean> {
  if (account.send_mode !== 'simulation') return false;
  await sql('update accounts set sim_offset_minutes = sim_offset_minutes + $2 where id = $1', [account.id, Math.round(days * DAY_MIN)]);
  await tickAccount(account.id);
  return true;
}

export async function resetTime(account: Row) {
  await sql('update accounts set sim_offset_minutes = 0 where id = $1', [account.id]);
}

/** Envoie (ou simule) les messages arrivés à échéance pour un compte. */
export async function tickAccount(accountId: string, limit = 50): Promise<{ sent: number; failed: number }> {
  const accRows = await sql('select * from accounts where id = $1', [accountId]);
  const account = accRows[0];
  if (!account || !trialState(account).active) return { sent: 0, failed: 0 };
  const now = effectiveNow(account);

  if (account.send_mode === 'smtp' && !inSendWindow(now, Number(account.send_from_hour), Number(account.send_to_hour))) {
    return { sent: 0, failed: 0 };
  }

  const due = await sql(
    `select m.id, m.lead_id, m.subject, m.body, l.email, l.unsub_token, l.status as lead_status
       from messages m join leads l on l.id = m.lead_id
      where m.account_id = $1 and m.status = 'scheduled' and m.scheduled_at <= $2
      order by m.scheduled_at asc limit $3`,
    [accountId, now.toISOString(), limit],
  );

  let sent = 0;
  let failed = 0;
  for (const m of due) {
    const claimed = await sql(`update messages set status = 'sending' where id = $1 and status = 'scheduled' returning id`, [m.id]);
    if (!claimed[0]) continue;

    if (m.lead_status !== 'active') {
      await sql(`update messages set status = 'skipped' where id = $1`, [m.id]);
      continue;
    }

    if (account.send_mode === 'smtp' && smtpConfigured(account)) {
      try {
        if (!trialState(account).isPro) {
          const [{ n }] = await sql<{ n: number }>(
            `select count(*)::int as n from messages where account_id = $1 and delivery = 'smtp' and status = 'sent'`,
            [accountId],
          );
          if (n >= TRIAL_REAL_EMAIL_LIMIT) throw new Error(`Limite de ${TRIAL_REAL_EMAIL_LIMIT} emails réels atteinte pendant l’essai`);
        }
        const unsubscribeUrl = `${appUrl()}/u/${m.unsub_token}`;
        await sendMail(account, {
          to: m.email,
          subject: m.subject,
          text: `${m.body}\n\n—\nSi vous ne souhaitez plus recevoir de messages : ${unsubscribeUrl}`,
          unsubscribeUrl,
        });
        await sql(`update messages set status = 'sent', delivery = 'smtp', sent_at = now() where id = $1`, [m.id]);
        sent++;
      } catch (e) {
        await sql(`update messages set status = 'failed', error = $2 where id = $1`, [m.id, humanizeSmtpError(e).slice(0, 300)]);
        failed++;
      }
    } else {
      await sql(`update messages set status = 'sent', delivery = 'simulation', sent_at = now() where id = $1`, [m.id]);
      sent++;
    }
    await finishLeadIfDone(m.lead_id);
  }
  return { sent, failed };
}

/** Passe planifiée (cron) : tous les comptes ayant des messages échus. */
export async function tickAll(): Promise<{ accounts: number; sent: number; failed: number }> {
  const accounts = await sql<{ id: string }>(
    `select distinct a.id from messages m join accounts a on a.id = m.account_id
      where m.status = 'scheduled'
        and m.scheduled_at <= now() + (case when a.send_mode = 'simulation' then a.sim_offset_minutes else 0 end) * interval '1 minute'
      limit 25`,
  );
  let sent = 0;
  let failed = 0;
  for (const a of accounts) {
    const r = await tickAccount(a.id);
    sent += r.sent;
    failed += r.failed;
  }
  return { accounts: accounts.length, sent, failed };
}
