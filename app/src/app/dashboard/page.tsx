import Link from 'next/link';
import { requireCtx } from '@/lib/auth';
import { sql } from '@/lib/db';
import { TRIAL_LEAD_LIMIT, tickAccount, trialState } from '@/lib/engine';
import { fmtDate, STATUS_LABEL } from '@/lib/format';
import { LeadForm } from '@/components/LeadForm';
import { LeadActions } from '@/components/LeadActions';
import { TimeWarp } from '@/components/TimeWarp';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Contacts' };

export default async function Dashboard() {
  const { account } = await requireCtx();
  await tickAccount(account.id);

  const [stats] = await sql<{ leads: number; booked: number; active: number; sent: number; failed: number }>(
    `select
       (select count(*)::int from leads where account_id = $1) as leads,
       (select count(*)::int from leads where account_id = $1 and status = 'booked') as booked,
       (select count(*)::int from leads where account_id = $1 and status = 'active') as active,
       (select count(*)::int from messages where account_id = $1 and status = 'sent') as sent,
       (select count(*)::int from messages where account_id = $1 and status = 'failed') as failed`,
    [account.id],
  );
  const leads = await sql(
    `select l.id, l.name, l.email, l.status, l.source, l.created_at,
            (select count(*)::int from messages m where m.lead_id = l.id and m.status = 'sent') as sent_count,
            (select count(*)::int from messages m where m.lead_id = l.id) as total_count,
            (select min(m.scheduled_at) from messages m where m.lead_id = l.id and m.status = 'scheduled') as next_at
       from leads l where l.account_id = $1 order by l.created_at desc limit 100`,
    [account.id],
  );

  const trial = trialState(account);
  const simulation = account.send_mode === 'simulation';
  const offsetDays = Math.round((Number(account.sim_offset_minutes) || 0) / 1440);
  const rate = stats.leads > 0 ? Math.round((stats.booked / stats.leads) * 100) : 0;

  return (
    <>
      <div className="page-head">
        <div>
          <h1>Vos contacts</h1>
          <p>Chaque nouvelle demande reçoit une réponse immédiate, puis des relances jusqu’au rendez-vous.</p>
        </div>
        <span className={`chip ${simulation ? 'sim' : 'booked'}`}>{simulation ? 'Mode simulation — aucun email réel' : 'Envoi réel actif'}</span>
      </div>

      {!trial.isPro && trial.active && (
        <div className="banner trial">
          <span>
            <strong>Essai gratuit : {trial.daysLeft} jour{trial.daysLeft > 1 ? 's' : ''} restant{trial.daysLeft > 1 ? 's' : ''}</strong> · {stats.leads}/{TRIAL_LEAD_LIMIT} contacts
          </span>
          <a href={process.env.UPGRADE_URL || 'https://cal.com/victor-francis-itoua-mveng-feg0dn/15min'}>Passer en illimité (199 €, une seule fois)</a>
        </div>
      )}
      {!trial.active && (
        <div className="banner warn">
          <span><strong>Votre essai est terminé.</strong> Vos données sont conservées, mais les relances sont en pause.</span>
          <a className="btn btn-primary btn-sm" href={process.env.UPGRADE_URL || 'https://cal.com/victor-francis-itoua-mveng-feg0dn/15min'}>Réactiver — 199 €</a>
        </div>
      )}
      {simulation && !account.booking_link && (
        <div className="banner warn">
          <span>Ajoutez votre lien de réservation et votre prénom pour personnaliser les messages.</span>
          <Link className="btn btn-ghost btn-sm" href="/dashboard/settings">Ouvrir les réglages</Link>
        </div>
      )}

      <div className="grid stats" style={{ marginBottom: 18 }}>
        <div className="card stat"><div className="n">{stats.leads}</div><div className="l">Contacts</div></div>
        <div className="card stat"><div className="n">{stats.sent}</div><div className="l">Messages {simulation ? 'simulés' : 'envoyés'}</div></div>
        <div className="card stat"><div className="n">{stats.booked}</div><div className="l">Rendez-vous pris ({rate} %)</div></div>
        <div className="card stat"><div className="n">{stats.active}</div><div className="l">Relances en cours</div></div>
      </div>
      {stats.failed > 0 && <div className="msg err">{stats.failed} message(s) en échec : vérifiez vos réglages d’envoi.</div>}

      {simulation && trial.active && <TimeWarp offsetDays={offsetDays} />}

      <div className="grid two">
        <div className="card">
          <h2>Suivi</h2>
          <p className="sub">Cliquez sur un contact pour voir ses messages.</p>
          {leads.length === 0 ? (
            <div className="empty">Aucun contact pour l’instant. Ajoutez le premier à droite : le premier message part tout de suite.</div>
          ) : (
            <div className="table-wrap">
              <table>
                <thead><tr><th>Contact</th><th>Statut</th><th>Messages</th><th>Prochain envoi</th><th></th></tr></thead>
                <tbody>
                  {leads.map((l) => (
                    <tr key={l.id}>
                      <td><Link href={`/dashboard/leads/${l.id}`}><strong>{l.name}</strong></Link><div className="tl-meta">{l.email}</div></td>
                      <td><span className={`chip ${l.status}`}>{STATUS_LABEL[l.status] ?? l.status}</span></td>
                      <td>{l.sent_count}/{l.total_count}</td>
                      <td>{l.next_at ? fmtDate(l.next_at) : '—'}</td>
                      <td><LeadActions id={l.id} status={l.status} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
        <LeadForm />
      </div>
    </>
  );
}
