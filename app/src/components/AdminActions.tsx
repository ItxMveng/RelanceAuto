'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { call } from './api';

export function AdminActions({ accountId, plan }: { accountId: string; plan: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  async function act(action: 'pro' | 'trial' | 'extend') {
    setBusy(true);
    await call('/api/admin/users', 'POST', { accountId, action });
    setBusy(false);
    router.refresh();
  }
  return (
    <div className="actions">
      {plan !== 'pro' ? <button className="btn btn-primary btn-sm" disabled={busy} onClick={() => act('pro')}>Activer illimité</button> : <button className="btn btn-ghost btn-sm" disabled={busy} onClick={() => act('trial')}>Repasser en essai</button>}
      <button className="btn btn-ghost btn-sm" disabled={busy} onClick={() => act('extend')}>+7 jours</button>
    </div>
  );
}
