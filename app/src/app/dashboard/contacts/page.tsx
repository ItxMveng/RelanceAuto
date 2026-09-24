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

const COLUMNS = [
  { key: 'active', title: 'Relance en cours', statuses: ['active'] },
  { key: 'booked', title: 'Rendez-vous pris', statuses: ['booked'] },
  { key: 'replied', title: 'Ont répondu', statuses: ['replied'] },
  { key: 'done', title: 'Terminé / arrêté', statuses: ['completed', 'stopped', 'unsubscribed'] },
];

export default async function Contacts({ searchParams }: { searchParams: { vue?: string; statut?: string; q?: string } }) {
  const { account } = await requireCtx();
  await tickAccount(account.id);
  const board = searchParams.vue === 'tableau';
  const status = ['active', 'booked', 'replied', 'completed', 'stopped', 'unsubscribed'].includes(searchParams.statut ?? '') ? searchParams.statut! : '';
  const q = (searchParams.q ?? '').trim().slice(0, 80);

  const leads = await sql(
    `select l.id, l.name, l.email, l.status, l.source, l.created_at,
            (select count(*)::int from messages m where m.lead_id = l.id and m.status = 'sent') as sent_count,
            (select count(*)::int from messages m where m.lead_id = l.id) as total_count,
            (select min(m.scheduled_at) from messages m where m.lead_id = l.id and m.status = 'scheduled') as next_at
       from leads l
      where l.account_id = $1
        and ($2 = '' or l.status = $2)
        and ($3 = '' or l.name ilike '%' || $3 || '%' or l.email ilike '%' || $3 || '%')
      order by l.created_at desc limit 200`,
    [account.id, status, q],
  );

  const trial = trialState(account);
  const simulation = account.send_mode === 'simulation';
  const offsetDays = Math.round((Number(account.sim_offset_minutes) || 0) / 1440);
  const [{ total }] = await sql<{ total: number }>('select count(*)::int as total from leads where account_id = $1', [account.id]);

  return (
    <>
      <div className="page-head">
        <div>
          <h1>Contacts</h1>
          <p>{total} contact{total > 1 ? 's' : ''}{!trial.isPro ? ` sur ${TRIAL_LEAD_LIMIT} pendant l’essai` : ''}.</p>
        </div>
        <div className="actions">
          <a className="btn btn-ghost btn-sm" href="/api/leads/export">Exporter en CSV</a>
        </div>
      </div>

      {!trial.active && (
        <div className="banner warn">
          <span><strong>Votre essai est terminé.</strong> Vos données sont conservées, mais les relances sont en pause.</span>
          <Link className="btn btn-primary btn-sm" href="/dashboard/upgrade">Réactiver</Link>
        </div>
      )}
      {simulation && trial.active && <TimeWarp offsetDays={offsetDays} />}

      <div className="grid two">
        <div className="card">
          <form className="toolbar" method="get">
            <input className="input" name="q" defaultValue={q} placeholder="Rechercher un nom ou un email" aria-label="Rechercher" />
            <select className="select" name="statut" defaultValue={status} aria-label="Filtrer par statut">
              <option value="">Tous les statuts</option>
              {Object.entries(STATUS_LABEL).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </select>
            <input type="hidden" name="vue" value={board ? 'tableau' : ''} />
            <button className="btn btn-ghost btn-sm">Filtrer</button>
          </form>
          <div className="seg" role="tablist" aria-label="Affichage">
            <Link href="/dashboard/contacts" role="tab" aria-selected={!board} className={!board ? 'on' : ''}>Liste</Link>
            <Link href="/dashboard/contacts?vue=tableau" role="tab" aria-selected={board} className={board ? 'on' : ''}>Tableau</Link>
          </div>

          {leads.length === 0 ? (
            <div className="empty">
              {total === 0 ? 'Aucun contact pour l’instant. Ajoutez le premier à droite : le premier message part tout de suite.' : 'Aucun contact ne correspond à ce filtre.'}
            </div>
          ) : board ? (
            <div className="board">
              {COLUMNS.map((c) => {
                const items = leads.filter((l) => c.statuses.includes(l.status));
                return (
                  <div className="col" key={c.key}>
                    <div className="col-head"><strong>{c.title}</strong><span className="count">{items.length}</span></div>
                    {items.map((l) => (
                      <Link key={l.id} href={`/dashboard/leads/${l.id}`} className="kcard">
                        <strong>{l.name}</strong>
                        <span className="tl-meta">{l.email}</span>
                        <span className="dots" aria-label={`${l.sent_count} message(s) sur ${l.total_count}`}>
                          {Array.from({ length: l.total_count }).map((_, i) => <i key={i} className={i < l.sent_count ? 'on' : ''} />)}
                        </span>
                        {l.next_at && l.status === 'active' && <span className="tl-meta">Prochain : {fmtDate(l.next_at)}</span>}
                      </Link>
                    ))}
                  </div>
                );
              })}
            </div>
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
                      <td>{l.next_at && l.status === 'active' ? fmtDate(l.next_at) : '—'}</td>
                      <td><LeadActions id={l.id} status={l.status} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
        <LeadForm simulation={simulation} />
      </div>
    </>
  );
}
