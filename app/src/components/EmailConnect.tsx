'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { call } from './api';
import { PROVIDERS, guessProviderFromEmail, providerById } from '@/lib/providers';

type Props = {
  connected: boolean;
  currentUser: string;
  currentHost: string;
  accountEmail: string;
  onConnected?: () => void;
};

export function EmailConnect({ connected, currentUser, currentHost, accountEmail, onConnected }: Props) {
  const router = useRouter();
  const [email, setEmail] = useState(currentUser || accountEmail);
  const [providerId, setProviderId] = useState(currentHost ? (PROVIDERS.find((p) => p.host === currentHost)?.id ?? 'other') : guessProviderFromEmail(currentUser || accountEmail));
  const provider = providerById(providerId)!;
  const [host, setHost] = useState(currentHost || provider.host);
  const [port, setPort] = useState<number>(PROVIDERS.find((p) => p.host === currentHost)?.port ?? provider.port);
  const [pass, setPass] = useState('');
  const [fromName, setFromName] = useState('');
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ kind: 'err' | 'good' | 'info'; text: string } | null>(null);
  const [editing, setEditing] = useState(!connected);

  function pickProvider(id: string) {
    const p = providerById(id)!;
    setProviderId(id);
    if (p.host) {
      setHost(p.host);
      setPort(p.port);
    }
  }
  function onEmailChange(v: string) {
    setEmail(v);
    if (providerId === 'other' && !host) pickProvider(guessProviderFromEmail(v));
  }

  async function connect(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setMsg({ kind: 'info', text: 'Vérification de la connexion à votre boîte email…' });
    const from = fromName.trim() ? `${fromName.trim()} <${email.trim()}>` : undefined;
    const r = await call('/api/email/connect', 'POST', { host, port, user: email, pass: pass || undefined, from, sendTest: true });
    setBusy(false);
    if (!r.ok) return setMsg({ kind: 'err', text: r.error ?? 'Échec de la connexion' });
    setPass('');
    setEditing(false);
    setMsg({
      kind: 'good',
      text: r.testSent
        ? `Connecté. Un email de confirmation vient d’être envoyé à ${r.sendTo} : vérifiez qu’il est bien arrivé (et pas dans les spams).`
        : `Connecté. ${r.testError ? 'Le test d’envoi a échoué : ' + r.testError : ''}`,
    });
    router.refresh();
    onConnected?.();
  }

  async function disconnect() {
    if (!window.confirm('Repasser en mode simulation ? Vos identifiants SMTP seront supprimés.')) return;
    setBusy(true);
    await call('/api/email/disconnect', 'POST');
    setBusy(false);
    setEditing(true);
    setMsg({ kind: 'info', text: 'Envoi réel désactivé : retour en mode simulation.' });
    router.refresh();
  }

  async function test() {
    setBusy(true);
    const r = await call('/api/settings/smtp-test', 'POST');
    setBusy(false);
    setMsg(r.ok ? { kind: 'good', text: `Email de test envoyé à ${r.to}.` } : { kind: 'err', text: r.error ?? 'Échec' });
  }

  return (
    <div>
      {msg && <div className={`msg ${msg.kind}`} role="status">{msg.text}</div>}
      {connected && !editing ? (
        <div className="connected">
          <div>
            <span className="chip booked">Envoi réel actif</span>
            <p style={{ marginTop: 8 }}>Vos relances partent depuis <strong>{currentUser}</strong>.</p>
          </div>
          <div className="actions">
            <button className="btn btn-ghost btn-sm" onClick={test} disabled={busy}>Envoyer un test</button>
            <button className="btn btn-ghost btn-sm" onClick={() => setEditing(true)} disabled={busy}>Modifier</button>
            <button className="btn btn-danger btn-sm" onClick={disconnect} disabled={busy}>Déconnecter</button>
          </div>
        </div>
      ) : (
        <form onSubmit={connect}>
          <div className="field">
            <label htmlFor="ec-email">Votre adresse email professionnelle</label>
            <input id="ec-email" className="input" type="email" required autoComplete="off" value={email} onChange={(e) => onEmailChange(e.target.value)} placeholder="vous@votredomaine.fr" />
            <span className="hint">C’est depuis cette adresse que partiront vos messages : vos prospects vous répondront directement.</span>
          </div>
          <div className="field">
            <label htmlFor="ec-provider">Votre fournisseur</label>
            <select id="ec-provider" className="select" value={providerId} onChange={(e) => pickProvider(e.target.value)}>
              {PROVIDERS.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </div>
          <div className="msg info" style={{ marginTop: 0 }}>
            {provider.help}
            {provider.helpUrl && <> <a href={provider.helpUrl} target="_blank" rel="noreferrer">Ouvrir la page</a>.</>}
          </div>
          <div className="field">
            <label htmlFor="ec-pass">{provider.needsAppPassword ? 'Mot de passe d’application' : 'Mot de passe de la boîte email'}</label>
            <input id="ec-pass" className="input" type="password" required={!connected} autoComplete="new-password" value={pass} onChange={(e) => setPass(e.target.value)} placeholder={connected ? 'Laissez vide pour conserver l’actuel' : ''} />
            <span className="hint">Chiffré (AES-256) avant enregistrement. Vous pourrez le supprimer à tout moment.</span>
          </div>
          <div className="field">
            <label htmlFor="ec-name">Nom affiché à vos prospects <span className="hint">(facultatif)</span></label>
            <input id="ec-name" className="input" value={fromName} onChange={(e) => setFromName(e.target.value)} placeholder="Sophie Martin" maxLength={80} />
          </div>
          <details className="adv" open={providerId === 'other' || undefined}>
            <summary>Réglages avancés (serveur et port)</summary>
            <div className="row" style={{ marginTop: 10 }}>
              <div className="field"><label htmlFor="ec-host">Serveur SMTP</label><input id="ec-host" className="input" value={host} onChange={(e) => setHost(e.target.value)} required /></div>
              <div className="field"><label htmlFor="ec-port">Port</label><input id="ec-port" className="input" type="number" value={port} onChange={(e) => setPort(Number(e.target.value))} required /></div>
            </div>
          </details>
          <div className="actions" style={{ marginTop: 12 }}>
            <button className="btn btn-primary" disabled={busy}>{busy ? 'Vérification…' : 'Vérifier et activer l’envoi réel'}</button>
            {connected && <button type="button" className="btn btn-ghost" onClick={() => setEditing(false)}>Annuler</button>}
          </div>
        </form>
      )}
    </div>
  );
}

