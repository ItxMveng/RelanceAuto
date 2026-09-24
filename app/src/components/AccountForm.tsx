'use client';
import { useState } from 'react';
import { call } from './api';

export function AccountForm() {
  const [msg, setMsg] = useState<{ kind: 'err' | 'good'; text: string } | null>(null);
  const [busy, setBusy] = useState(false);

  async function changePassword(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const f = new FormData(form);
    setBusy(true);
    const r = await call('/api/account', 'PATCH', { current: f.get('current'), next: f.get('next') });
    setBusy(false);
    setMsg(r.ok ? { kind: 'good', text: 'Mot de passe modifié.' } : { kind: 'err', text: r.error ?? 'Erreur' });
    if (r.ok) form.reset();
  }

  async function deleteAccount(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    if (!window.confirm('Supprimer définitivement votre compte, vos contacts et tous vos messages ? Cette action est irréversible.')) return;
    setBusy(true);
    const r = await call('/api/account', 'DELETE', { password: f.get('password') });
    setBusy(false);
    if (r.ok) window.location.href = '/';
    else setMsg({ kind: 'err', text: r.error ?? 'Erreur' });
  }

  return (
    <div>
      {msg && <div className={`msg ${msg.kind}`} role="status">{msg.text}</div>}
      <form onSubmit={changePassword} className="row">
        <div className="field"><label htmlFor="pw-cur">Mot de passe actuel</label><input id="pw-cur" name="current" type="password" required autoComplete="current-password" className="input" /></div>
        <div className="field"><label htmlFor="pw-new">Nouveau mot de passe</label><input id="pw-new" name="next" type="password" required minLength={8} autoComplete="new-password" className="input" /></div>
        <div><button className="btn btn-ghost btn-sm" disabled={busy}>Changer le mot de passe</button></div>
      </form>
      <hr className="sep" />
      <p className="hint" style={{ marginBottom: 8 }}>Exporter vos contacts (CSV) ou supprimer définitivement votre compte et toutes vos données.</p>
      <div className="actions" style={{ alignItems: 'flex-end' }}>
        <a className="btn btn-ghost btn-sm" href="/api/leads/export">Exporter mes contacts</a>
        <form onSubmit={deleteAccount} className="actions" style={{ alignItems: 'flex-end' }}>
          <div className="field" style={{ margin: 0 }}><label htmlFor="del-pw" className="sr-only">Mot de passe pour confirmer</label><input id="del-pw" name="password" type="password" required placeholder="Mot de passe pour confirmer" autoComplete="current-password" className="input" style={{ minWidth: 230 }} /></div>
          <button className="btn btn-danger btn-sm" disabled={busy}>Supprimer mon compte</button>
        </form>
      </div>
    </div>
  );
}
