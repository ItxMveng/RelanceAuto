'use client';
import { useState } from 'react';
import { call } from './api';

export function AuthForm({ mode }: { mode: 'login' | 'signup' }) {
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setError('');
    const f = new FormData(e.currentTarget);
    const res = await call(`/api/auth/${mode}`, 'POST', {
      email: f.get('email'),
      password: f.get('password'),
      name: f.get('name') || undefined,
    });
    if (res.ok) {
      window.location.href = '/dashboard';
      return;
    }
    setError(res.error ?? 'Une erreur est survenue');
    setBusy(false);
  }

  return (
    <form onSubmit={submit} noValidate>
      {error && <div className="msg err" role="alert">{error}</div>}
      {mode === 'signup' && (
        <div className="field">
          <label htmlFor="name">Votre prénom</label>
          <input id="name" name="name" className="input" autoComplete="given-name" maxLength={60} placeholder="Sophie" />
        </div>
      )}
      <div className="field">
        <label htmlFor="email">Email</label>
        <input id="email" name="email" type="email" required className="input" autoComplete="email" placeholder="vous@exemple.fr" />
      </div>
      <div className="field">
        <label htmlFor="password">Mot de passe {mode === 'signup' && <span className="hint">(8 caractères minimum)</span>}</label>
        <input id="password" name="password" type="password" required minLength={mode === 'signup' ? 8 : 1} className="input" autoComplete={mode === 'signup' ? 'new-password' : 'current-password'} />
      </div>
      <button className="btn btn-primary" style={{ width: '100%' }} disabled={busy}>
        {busy ? 'Un instant…' : mode === 'signup' ? 'Démarrer mon essai gratuit' : 'Se connecter'}
      </button>
    </form>
  );
}
