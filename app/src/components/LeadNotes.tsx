'use client';
import { useState } from 'react';
import { call } from './api';

export function LeadNotes({ id, initial }: { id: string; initial: string }) {
  const [v, setV] = useState(initial);
  const [state, setState] = useState<'idle' | 'saving' | 'saved' | 'err'>('idle');
  async function save() {
    setState('saving');
    const r = await call(`/api/leads/${id}`, 'PATCH', { notes: v });
    setState(r.ok ? 'saved' : 'err');
    if (r.ok) setTimeout(() => setState('idle'), 1500);
  }
  return (
    <div className="card" style={{ marginBottom: 16 }}>
      <h2>Notes privées</h2>
      <p className="sub">Visibles uniquement par vous : contexte, besoin, rendez-vous prévu…</p>
      <textarea className="textarea" style={{ minHeight: 90 }} value={v} maxLength={4000} onChange={(e) => setV(e.target.value)} aria-label="Notes" />
      <div className="actions" style={{ marginTop: 8 }}>
        <button className="btn btn-ghost btn-sm" onClick={save} disabled={state === 'saving' || v === initial}>{state === 'saving' ? 'Enregistrement…' : state === 'saved' ? 'Enregistré ✓' : 'Enregistrer'}</button>
        {state === 'err' && <span className="tl-meta" style={{ color: 'var(--bad)' }}>Échec de l’enregistrement</span>}
      </div>
    </div>
  );
}
