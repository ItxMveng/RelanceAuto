'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { call } from './api';
import { ACTIVITIES } from '@/lib/templates';

type Init = {
  my_name: string; activity: string; booking_link: string; tone: 'warm' | 'pro'; send_mode: 'simulation' | 'smtp';
  smtp_host: string; smtp_port: number | ''; smtp_user: string; smtp_from: string; hasPass: boolean;
};

export function SettingsForm({ init }: { init: Init }) {
  const router = useRouter();
  const [v, setV] = useState(init);
  const [pass, setPass] = useState('');
  const [msg, setMsg] = useState<{ kind: 'err' | 'good'; text: string } | null>(null);
  const [busy, setBusy] = useState(false);
  const set = (patch: Partial<Init>) => setV((s) => ({ ...s, ...patch }));

  async function save(e?: React.FormEvent) {
    e?.preventDefault();
    setBusy(true);
    setMsg(null);
    const r = await call('/api/settings', 'PUT', { ...v, smtp_port: v.smtp_port === '' ? undefined : v.smtp_port, smtp_pass: pass || undefined });
    setBusy(false);
    if (r.ok) {
      setPass('');
      set({ hasPass: v.hasPass || Boolean(pass) });
      setMsg({ kind: 'good', text: 'Réglages enregistrés.' });
      router.refresh();
      return true;
    }
    setMsg({ kind: 'err', text: r.error ?? 'Erreur' });
    return false;
  }

  async function test() {
    if (!(await save())) return;
    setBusy(true);
    const r = await call('/api/settings/smtp-test', 'POST');
    setBusy(false);
    setMsg(r.ok ? { kind: 'good', text: `Email de test envoyé à ${r.to}. Vérifiez votre boîte de réception.` } : { kind: 'err', text: r.error ?? 'Échec' });
  }

  return (
    <form onSubmit={save} className="grid">
      {msg && <div className={`msg ${msg.kind}`} role="status">{msg.text}</div>}
      <div className="card">
        <h2>Votre identité</h2>
        <p className="sub">Ces informations remplissent les variables de vos messages.</p>
        <div className="row">
          <div className="field"><label htmlFor="my_name">Votre prénom</label><input id="my_name" className="input" value={v.my_name} maxLength={60} onChange={(e) => set({ my_name: e.target.value })} /></div>
          <div className="field">
            <label htmlFor="activity">Votre activité</label>
            <select id="activity" className="select" value={v.activity} onChange={(e) => set({ activity: e.target.value })}>
              {ACTIVITIES.map((a) => <option key={a.value} value={a.value}>{a.label}</option>)}
              {!ACTIVITIES.some((a) => a.value === v.activity) && <option value={v.activity}>{v.activity}</option>}
            </select>
          </div>
        </div>
        <div className="field"><label htmlFor="link">Lien de réservation</label><input id="link" className="input" type="url" placeholder="https://cal.com/vous/15min" value={v.booking_link} maxLength={300} onChange={(e) => set({ booking_link: e.target.value })} /><span className="hint">Calendly, Cal.com, Google Agenda… inséré dans chaque message.</span></div>
        <div className="field">
          <label htmlFor="tone">Ton par défaut</label>
          <select id="tone" className="select" value={v.tone} onChange={(e) => set({ tone: e.target.value as 'warm' | 'pro' })}>
            <option value="warm">Chaleureux</option>
            <option value="pro">Sobre</option>
          </select>
        </div>
      </div>

      <div className="card">
        <h2>Envoi des emails</h2>
        <p className="sub">Commencez en simulation pour tout voir fonctionner. Passez à l’envoi réel avec votre propre adresse quand vous êtes prêt.</p>
        <div className="field">
          <label htmlFor="mode">Mode</label>
          <select id="mode" className="select" value={v.send_mode} onChange={(e) => set({ send_mode: e.target.value as 'simulation' | 'smtp' })}>
            <option value="simulation">Simulation — rien n’est envoyé, tout est visible dans l’historique</option>
            <option value="smtp">Envoi réel via mon adresse email (SMTP)</option>
          </select>
        </div>
        {v.send_mode === 'smtp' && (
          <>
            <div className="msg info">Pendant l’essai : 30 emails réels maximum. Avec Gmail, créez un « mot de passe d’application » (validation en deux étapes requise) et utilisez smtp.gmail.com, port 465.</div>
            <div className="row">
              <div className="field"><label htmlFor="host">Serveur SMTP</label><input id="host" className="input" placeholder="smtp.gmail.com" value={v.smtp_host} onChange={(e) => set({ smtp_host: e.target.value })} /></div>
              <div className="field"><label htmlFor="port">Port</label><input id="port" className="input" type="number" placeholder="465" value={v.smtp_port} onChange={(e) => set({ smtp_port: e.target.value === '' ? '' : Number(e.target.value) })} /></div>
            </div>
            <div className="row">
              <div className="field"><label htmlFor="suser">Identifiant</label><input id="suser" className="input" autoComplete="off" value={v.smtp_user} onChange={(e) => set({ smtp_user: e.target.value })} /></div>
              <div className="field"><label htmlFor="spass">Mot de passe {v.hasPass && <span className="hint">(enregistré, laissez vide pour le conserver)</span>}</label><input id="spass" className="input" type="password" autoComplete="new-password" value={pass} onChange={(e) => setPass(e.target.value)} /></div>
            </div>
            <div className="field"><label htmlFor="sfrom">Adresse d’expédition <span className="hint">(facultatif, sinon l’identifiant)</span></label><input id="sfrom" className="input" placeholder="Sophie <sophie@exemple.fr>" value={v.smtp_from} onChange={(e) => set({ smtp_from: e.target.value })} /></div>
            <button type="button" className="btn btn-ghost" onClick={test} disabled={busy}>Enregistrer et envoyer un email de test</button>
          </>
        )}
      </div>
      <div><button className="btn btn-primary" disabled={busy}>{busy ? 'Enregistrement…' : 'Enregistrer les réglages'}</button></div>
    </form>
  );
}
