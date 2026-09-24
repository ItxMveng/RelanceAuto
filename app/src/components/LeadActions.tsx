'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { call } from './api';

export function LeadActions({ id, status, redirectAfterDelete }: { id: string; status: string; redirectAfterDelete?: boolean }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const open = status === 'active' || status === 'completed';

  async function act(action: 'booked' | 'stopped' | 'replied') {
    setBusy(true);
    await call(`/api/leads/${id}`, 'PATCH', { action });
    setBusy(false);
    router.refresh();
  }
  async function remove() {
    if (!window.confirm('Supprimer ce contact et son historique ?')) return;
    setBusy(true);
    await call(`/api/leads/${id}`, 'DELETE');
    setBusy(false);
    if (redirectAfterDelete) router.push('/dashboard/contacts');
    else router.refresh();
  }
  return (
    <div className="actions">
      {open && <button className="btn btn-ghost btn-sm" disabled={busy} onClick={() => act('booked')}>RDV pris</button>}
      {status === 'active' && <button className="btn btn-ghost btn-sm" disabled={busy} onClick={() => act('replied')}>A répondu</button>}
      {status === 'active' && <button className="btn btn-ghost btn-sm" disabled={busy} onClick={() => act('stopped')}>Arrêter</button>}
      <button className="btn btn-danger btn-sm" disabled={busy} onClick={remove}>Supprimer</button>
    </div>
  );
}
