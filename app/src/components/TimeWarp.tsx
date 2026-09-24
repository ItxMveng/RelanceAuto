'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { call } from './api';

export function TimeWarp({ offsetDays }: { offsetDays: number }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');

  async function go(body: Record<string, unknown>) {
    setBusy(true);
    setErr('');
    const r = await call('/api/sim/advance', 'POST', body);
    setBusy(false);
    if (!r.ok) setErr(r.error ?? 'Erreur');
    router.refresh();
  }

  return (
    <div className="card" style={{ marginBottom: 18 }}>
      <h2>Voyage dans le temps</h2>
      <p className="sub">
        Mode simulation : avancez l’horloge pour voir partir les relances J+2 et J+5 sans attendre.
        {offsetDays > 0 && <> Horloge décalée de <strong>{offsetDays} jour{offsetDays > 1 ? 's' : ''}</strong>.</>}
      </p>
      {err && <div className="msg err">{err}</div>}
      <div className="timewarp">
        {[1, 2, 5].map((d) => (
          <button key={d} className="btn btn-primary btn-sm" disabled={busy} onClick={() => go({ days: d })}>+{d} jour{d > 1 ? 's' : ''}</button>
        ))}
        {offsetDays > 0 && <button className="btn btn-ghost btn-sm" disabled={busy} onClick={() => go({ reset: true })}>Revenir à aujourd’hui</button>}
      </div>
    </div>
  );
}
