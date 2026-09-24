'use client';
import { useState } from 'react';
import { call } from './api';

export function CaptureForm({ slug }: { slug: string }) {
  const [state, setState] = useState<'idle' | 'busy' | 'done'>('idle');
  const [error, setError] = useState('');

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    setState('busy');
    setError('');
    const r = await call(`/api/capture/${slug}`, 'POST', { name: f.get('name'), email: f.get('email'), message: f.get('message'), website: f.get('website') });
    if (r.ok) setState('done');
    else {
      setError(r.error ?? 'Une erreur est survenue');
      setState('idle');
    }
  }

  if (state === 'done') {
    return <div className="msg good" role="status">Merci ! Votre message a bien été envoyé. Vous allez recevoir une réponse par email très vite.</div>;
  }
  return (
    <form onSubmit={submit}>
      {error && <div className="msg err" role="alert">{error}</div>}
      <div className="field"><label htmlFor="c-name">Votre prénom et nom</label><input id="c-name" name="name" required className="input" maxLength={120} autoComplete="name" /></div>
      <div className="field"><label htmlFor="c-email">Votre email</label><input id="c-email" name="email" type="email" required className="input" maxLength={200} autoComplete="email" /></div>
      <div className="field"><label htmlFor="c-msg">Votre message</label><textarea id="c-msg" name="message" className="textarea" style={{ minHeight: 110 }} maxLength={2000} /></div>
      <input name="website" className="hp" tabIndex={-1} autoComplete="off" aria-hidden="true" />
      <button className="btn btn-primary" style={{ width: '100%' }} disabled={state === 'busy'}>{state === 'busy' ? 'Envoi…' : 'Envoyer'}</button>
      <p className="tl-meta" style={{ marginTop: 10 }}>En envoyant ce formulaire, vous acceptez de recevoir une réponse et un suivi par email. Vous pourrez vous désinscrire à tout moment.</p>
    </form>
  );
}
