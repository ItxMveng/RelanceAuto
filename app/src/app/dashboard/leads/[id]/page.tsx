import Link from 'next/link';
import { notFound } from 'next/navigation';
import { requireCtx } from '@/lib/auth';
import { sql } from '@/lib/db';
import { tickAccount } from '@/lib/engine';
import { fmtDate, MSG_LABEL, STATUS_LABEL } from '@/lib/format';
import { LeadActions } from '@/components/LeadActions';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Contact' };

export default async function LeadPage({ params }: { params: { id: string } }) {
  const { account } = await requireCtx();
  if (!/^[0-9a-f-]{36}$/i.test(params.id)) notFound();
  await tickAccount(account.id);
  const leads = await sql('select * from leads where id = $1 and account_id = $2', [params.id, account.id]);
  const lead = leads[0];
  if (!lead) notFound();
  const messages = await sql('select * from messages where lead_id = $1 order by step_index asc', [lead.id]);

  return (
    <>
      <p style={{ marginBottom: 10 }}><Link href="/dashboard">← Tous les contacts</Link></p>
      <div className="page-head">
        <div>
          <h1>{lead.name}</h1>
          <p>{lead.email} · ajouté le {fmtDate(lead.created_at)} · source : {lead.source}</p>
        </div>
        <span className={`chip ${lead.status}`}>{STATUS_LABEL[lead.status] ?? lead.status}</span>
      </div>
      {lead.message && <div className="card" style={{ marginBottom: 16 }}><strong>Son message</strong><p style={{ marginTop: 6, whiteSpace: 'pre-line' }}>{lead.message}</p></div>}
      <div className="card" style={{ marginBottom: 16 }}>
        <h2>Séquence</h2>
        <p className="sub">Les messages sont figés à l’ajout du contact : modifier la séquence n’affecte que les prochains contacts.</p>
        <div className="timeline">
          {messages.map((m) => (
            <div className="tl-item" key={m.id}>
              <div className="tl-head">
                <strong>Étape {m.step_index + 1} · {m.subject}</strong>
                <span>
                  {m.delivery === 'simulation' && <span className="chip sim" style={{ marginRight: 6 }}>simulé</span>}
                  <span className={`chip ${m.status}`}>{MSG_LABEL[m.status] ?? m.status}</span>
                </span>
              </div>
              <div className="tl-body">{m.body}</div>
              <div className="tl-head" style={{ borderTop: '1px solid var(--border)', borderBottom: 0 }}>
                <span className="tl-meta">
                  {m.sent_at ? `Envoyé le ${fmtDate(m.sent_at)}` : m.status === 'scheduled' ? `Prévu le ${fmtDate(m.scheduled_at)}` : `Prévu le ${fmtDate(m.scheduled_at)}`}
                </span>
                {m.error && <span className="tl-meta" style={{ color: 'var(--bad)' }}>{m.error}</span>}
              </div>
            </div>
          ))}
        </div>
      </div>
      <LeadActions id={lead.id} status={lead.status} redirectAfterDelete />
    </>
  );
}
