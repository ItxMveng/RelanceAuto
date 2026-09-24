import Link from 'next/link';
import type { Activity, DayPoint, Funnel, SourceRow } from '@/lib/stats';
import { fmtDate } from '@/lib/format';

export function FunnelChart({ f }: { f: Funnel }) {
  const rows = [
    { label: 'Contacts reçus', value: f.contacts, color: '#01696f' },
    { label: 'Réponse envoyée', value: f.contacted, color: '#2f8a8f' },
    { label: 'Relancés au moins une fois', value: f.relaunched, color: '#6fb1b3' },
    { label: 'Rendez-vous pris', value: f.booked, color: '#2d6a17' },
  ];
  const max = Math.max(1, f.contacts);
  return (
    <div className="funnel" role="img" aria-label="Entonnoir de conversion">
      {rows.map((r) => (
        <div className="funnel-row" key={r.label}>
          <div className="funnel-label"><span>{r.label}</span><strong>{r.value}</strong></div>
          <div className="funnel-track"><div className="funnel-bar" style={{ width: `${Math.max(2, Math.round((r.value / max) * 100))}%`, background: r.color }} /></div>
        </div>
      ))}
      {f.replied > 0 && <p className="tl-meta">{f.replied} contact(s) ont répondu par eux-mêmes : la séquence s’est arrêtée.</p>}
    </div>
  );
}

export function DailyChart({ points }: { points: DayPoint[] }) {
  const max = Math.max(3, ...points.map((p) => p.count));
  const w = 560;
  const h = 150;
  const bw = w / points.length;
  return (
    <svg viewBox={`0 0 ${w} ${h + 26}`} className="chart" role="img" aria-label="Messages envoyés par jour sur 14 jours">
      {[0.25, 0.5, 0.75, 1].map((t) => (
        <line key={t} x1="0" x2={w} y1={h - h * t} y2={h - h * t} stroke="rgba(40,37,29,.08)" />
      ))}
      {points.map((p, i) => {
        const bh = Math.round((p.count / max) * (h - 8));
        const x = i * bw + 6;
        return (
          <g key={p.day}>
            <rect x={x} y={h - bh} width={bw - 12} height={bh} rx="4" fill={p.count ? '#01696f' : 'rgba(40,37,29,.08)'} />
            {p.count > 0 && <text x={x + (bw - 12) / 2} y={h - bh - 5} textAnchor="middle" fontSize="11" fill="#28251d">{p.count}</text>}
            {(i % 2 === 0 || i === points.length - 1) && (
              <text x={x + (bw - 12) / 2} y={h + 18} textAnchor="middle" fontSize="10" fill="#65645f">{p.day.slice(8)}/{p.day.slice(5, 7)}</text>
            )}
          </g>
        );
      })}
    </svg>
  );
}

const SOURCE_LABEL: Record<string, string> = { manuel: 'Ajout manuel', formulaire: 'Formulaire public', import: 'Import de liste' };

export function SourceTable({ rows }: { rows: SourceRow[] }) {
  if (rows.length === 0) return <p className="tl-meta">Les sources apparaîtront avec vos premiers contacts.</p>;
  return (
    <table>
      <thead><tr><th>Source</th><th>Contacts</th><th>RDV</th><th>Taux</th></tr></thead>
      <tbody>
        {rows.map((r) => (
          <tr key={r.source}>
            <td>{SOURCE_LABEL[r.source] ?? r.source}</td>
            <td>{r.leads}</td>
            <td>{r.booked}</td>
            <td>{r.leads ? Math.round((r.booked / r.leads) * 100) : 0} %</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

const KIND: Record<Activity['kind'], { icon: string; cls: string }> = {
  sent: { icon: 'M22 2L11 13M22 2l-7 20-4-9-9-4z', cls: 'k-sent' },
  lead: { icon: 'M12 5v14M5 12h14', cls: 'k-lead' },
  booked: { icon: 'M20 6L9 17l-5-5', cls: 'k-booked' },
  replied: { icon: 'M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z', cls: 'k-replied' },
};

export function ActivityFeed({ items }: { items: Activity[] }) {
  if (items.length === 0) return <div className="empty">L’activité de votre compte apparaîtra ici : contacts reçus, messages envoyés, rendez-vous pris.</div>;
  return (
    <ul className="feed">
      {items.map((a, i) => (
        <li key={i}>
          <span className={`feed-ico ${KIND[a.kind].cls}`} aria-hidden="true">
            <svg viewBox="0 0 24 24"><path d={KIND[a.kind].icon} /></svg>
          </span>
          <div>
            <Link href={`/dashboard/leads/${a.leadId}`}><strong>{a.title}</strong></Link>
            <div className="tl-meta">{a.detail}</div>
          </div>
          <span className="tl-meta feed-time">{fmtDate(a.at)}</span>
        </li>
      ))}
    </ul>
  );
}

export function Checklist({ steps }: { steps: Array<{ done: boolean; title: string; text: string; href: string; cta: string }> }) {
  const done = steps.filter((s) => s.done).length;
  if (done === steps.length) return null;
  return (
    <div className="card checklist">
      <div className="checklist-head">
        <div>
          <h2>Bien démarrer</h2>
          <p className="sub">{done}/{steps.length} étapes : comptez 5 minutes pour être opérationnel.</p>
        </div>
        <div className="progress" aria-hidden="true"><div style={{ width: `${(done / steps.length) * 100}%` }} /></div>
      </div>
      <ol>
        {steps.map((s) => (
          <li key={s.title} className={s.done ? 'done' : ''}>
            <span className="check" aria-hidden="true">{s.done ? '✓' : ''}</span>
            <div><strong>{s.title}</strong><div className="tl-meta">{s.text}</div></div>
            {!s.done && <Link className="btn btn-ghost btn-sm" href={s.href}>{s.cta}</Link>}
          </li>
        ))}
      </ol>
    </div>
  );
}
