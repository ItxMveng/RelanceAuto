import { notFound } from 'next/navigation';
import { requireCtx } from '@/lib/auth';
import { isAdmin } from '@/lib/admin';
import { sql } from '@/lib/db';
import { fmtDate } from '@/lib/format';
import { AdminActions } from '@/components/AdminActions';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Administration' };

export default async function Admin() {
  const ctx = await requireCtx();
  if (!isAdmin(ctx)) notFound();
  const rows = await sql(
    `select a.id, u.email, u.created_at, a.plan, a.trial_ends_at, a.send_mode,
            (select count(*)::int from leads l where l.account_id = a.id) as leads,
            (select count(*)::int from messages m where m.account_id = a.id and m.status = 'sent') as sent,
            (select count(*)::int from leads l where l.account_id = a.id and l.status = 'booked') as booked
       from accounts a join users u on u.id = a.user_id order by u.created_at desc limit 200`,
  );
  const pro = rows.filter((r) => r.plan === 'pro').length;
  const active = rows.filter((r) => r.leads > 0).length;
  return (
    <>
      <div className="page-head">
        <div><h1>Administration</h1><p>{rows.length} comptes · {pro} en illimité · {active} ont ajouté au moins un contact.</p></div>
      </div>
      <div className="card">
        <div className="table-wrap">
          <table>
            <thead><tr><th>Compte</th><th>Offre</th><th>Contacts</th><th>Envoyés</th><th>RDV</th><th>Envoi</th><th></th></tr></thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id}>
                  <td><strong>{r.email}</strong><div className="tl-meta">Inscrit le {fmtDate(r.created_at)}</div></td>
                  <td><span className={`chip ${r.plan === 'pro' ? 'booked' : 'scheduled'}`}>{r.plan === 'pro' ? 'Illimité' : `Essai → ${fmtDate(r.trial_ends_at)}`}</span></td>
                  <td>{r.leads}</td><td>{r.sent}</td><td>{r.booked}</td>
                  <td>{r.send_mode === 'smtp' ? 'Réel' : 'Simulation'}</td>
                  <td><AdminActions accountId={r.id} plan={r.plan} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
