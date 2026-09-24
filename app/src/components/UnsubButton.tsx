'use client';
import { useState } from 'react';
import { call } from './api';

export function UnsubButton({ token }: { token: string }) {
  const [state, setState] = useState<'idle' | 'busy' | 'done' | 'err'>('idle');
  async function go() {
    setState('busy');
    const r = await call('/api/unsub', 'POST', { token });
    setState(r.ok ? 'done' : 'err');
  }
  if (state === 'done') return <div className="msg good" role="status">C’est fait : vous ne recevrez plus de messages.</div>;
  return (
    <>
      {state === 'err' && <div className="msg err" role="alert">Lien invalide ou déjà utilisé.</div>}
      <button className="btn btn-primary" onClick={go} disabled={state === 'busy'}>Confirmer la désinscription</button>
    </>
  );
}
