import Link from 'next/link';
import { requireCtx } from '@/lib/auth';
import { tickAccount } from '@/lib/engine';
import { getOutbox } from '@/lib/stats';
import { fmtDate, MSG_LABEL } from '@/lib/format';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Boîte d’envoi' };

const FILTERS = [
  { key: '', label: 'Tous' },
  { key: 'sent', label: 'Envoyés' },
  { key: 'scheduled', label: 'Planifiés' },
  { key: 'failed', label: 'En échec' },
  { key: 'skipped', label: 'Annulés' },
];

export default async function Outbox({ searchParams }: { searchParams: { statut?: string } }) {
  const { account } = await requireCtx();
  await tickAccount(account.id);
  const filter = searchParams.statut ?? '';
  const rows = await getOutbox(account.id, filter);
  const simulation = account.send_mode === 'simulation';

  return (
    <>
      <div className="page-head">
        <div>
          <h1>Boîte d’envoi</h1>
          <p>Chaque message, ce qu’il contient et où il en est. {simulation ? 'En simulation, rien n’est réellement envoyé.' : 'Les messages envoyés partent de votre adresse.'}</p>
        </div>
      </div>
      <div className="seg" role="tablist" aria-label="Filtrer">
        {FILTERS.map((f) => (
          <Link key={f.key} href={f.key ? `/dashboard/outbox?statut=${f.key}` : '/dashboard/outbox'} className={filter === f.key ? 'on' : ''} role="tab" aria-selected={filter === f.key}>{f.label}</Link>
        ))}
      </div>
      {rows.length === 0 ? (
        <div className="card"><div className="empty">Aucun message pour ce filtre. Ajoutez un contact pour lancer une séquence.</div></div>
      ) : (
        <div className="timeline">
          {rows.map((m) => (
            <details className="tl-item" key={m.id}>
              <summary className="tl-head">
                <span>
                  <strong>{m.subject}</strong>
                  <span className="tl-meta"> · {m.name} &lt;{m.email}&gt; · étape {m.step_index + 1}</span>
                </span>
                <span>
                  {m.delivery === 'simulation' && <span className="chip sim" style={{ marginRight: 6 }}>simulé</span>}
                  <span className={`chip ${m.status}`}>{MSG_LABEL[m.status] ?? m.status}</span>
                </span>
              </summary>
              <div className="tl-body">{m.body}</div>
              <div className="tl-head" style={{ borderTop: '1px solid var(--border)', borderBottom: 0 }}>
                <span className="tl-meta">{m.sent_at ? `Envoyé le ${fmtDate(m.sent_at)}` : `Prévu le ${fmtDate(m.scheduled_at)}`}</span>
                {m.error && <span className="tl-meta" style={{ color: 'var(--bad)' }}>{m.error}</span>}
                <Link className="tl-meta" href={`/dashboard/leads/${m.lead_id}`}>Voir le contact</Link>
              </div>
            </details>
          ))}
        </div>
      )}
    </>
  );
}
