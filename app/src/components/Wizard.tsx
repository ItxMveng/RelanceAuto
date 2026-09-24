'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { call } from './api';
import { ACTIVITIES, render, type Step } from '@/lib/templates';
import { LIBRARY } from '@/lib/library';
import { EmailConnect } from './EmailConnect';
import { CopyField } from './CopyField';

type Props = {
  init: { my_name: string; activity: string; booking_link: string };
  email: { connected: boolean; user: string; host: string; accountEmail: string };
  formUrl: string;
};

const STEPS = ['Votre activité', 'Vos messages', 'Votre boîte email', 'Vos contacts'];

export function Wizard({ init, email, formUrl }: Props) {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [profile, setProfile] = useState({ ...init, tone: 'warm' as const, send_from_hour: 8, send_to_hour: 20 });
  const [tpl, setTpl] = useState(LIBRARY[0].id);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const [demo, setDemo] = useState<string | null>(null);
  const [connected, setConnected] = useState(email.connected);

  const current = LIBRARY.find((t) => t.id === tpl)!;
  const preview = render(current.steps[0].body, { prenom: 'Camille', mon_prenom: profile.my_name || 'Sophie', activite: profile.activity, lien: profile.booking_link || 'https://votre-lien' });

  async function saveProfile() {
    setErr('');
    if (!profile.my_name.trim()) return setErr('Indiquez votre prénom.');
    if (!/^https?:\/\/\S+\.\S+/.test(profile.booking_link)) return setErr('Collez le lien de votre agenda de réservation (il commence par https://). Pas encore d’agenda ? Créez-en un gratuitement sur cal.com ou calendly.com.');
    setBusy(true);
    const r = await call('/api/settings', 'PUT', profile);
    setBusy(false);
    if (!r.ok) return setErr(r.error ?? 'Erreur');
    setStep(1);
  }
  async function saveTemplate() {
    setBusy(true);
    setErr('');
    const r = await call('/api/sequence', 'PUT', { steps: current.steps as Step[] });
    setBusy(false);
    if (!r.ok) return setErr(r.error ?? 'Erreur');
    setStep(2);
  }
  async function addDemo() {
    setBusy(true);
    setErr('');
    const r = await call('/api/onboarding/demo', 'POST');
    setBusy(false);
    if (!r.ok) return setErr(r.error ?? 'Erreur');
    setDemo(r.leadId as string);
  }
  async function finish(dest: string) {
    await call('/api/onboarding/done', 'POST');
    router.push(dest);
    router.refresh();
  }

  return (
    <div className="wizard">
      <ol className="steps" aria-label="Progression">
        {STEPS.map((s, i) => (
          <li key={s} className={i === step ? 'cur' : i < step ? 'done' : ''} aria-current={i === step ? 'step' : undefined}>
            <span className="num">{i < step ? '✓' : i + 1}</span>
            <span className="lbl">{s}</span>
          </li>
        ))}
      </ol>

      {err && <div className="msg err" role="alert">{err}</div>}

      {step === 0 && (
        <div className="card">
          <h2>Dites-nous qui vous êtes</h2>
          <p className="sub">Ces trois informations remplissent automatiquement vos messages.</p>
          <div className="row">
            <div className="field"><label htmlFor="w-name">Votre prénom</label><input id="w-name" className="input" value={profile.my_name} maxLength={60} onChange={(e) => setProfile({ ...profile, my_name: e.target.value })} placeholder="Sophie" /></div>
            <div className="field">
              <label htmlFor="w-act">Votre activité</label>
              <select id="w-act" className="select" value={profile.activity} onChange={(e) => setProfile({ ...profile, activity: e.target.value })}>
                {ACTIVITIES.map((a) => <option key={a.value} value={a.value}>{a.label}</option>)}
              </select>
            </div>
          </div>
          <div className="field">
            <label htmlFor="w-link">Le lien où vos prospects réservent un rendez-vous</label>
            <input id="w-link" className="input" type="url" value={profile.booking_link} onChange={(e) => setProfile({ ...profile, booking_link: e.target.value })} placeholder="https://cal.com/vous/15min" />
            <span className="hint">Cal.com, Calendly, Google Agenda (page de réservation), Doctolib… tout lien fonctionne.</span>
          </div>
          <div className="actions"><button className="btn btn-primary" onClick={saveProfile} disabled={busy}>{busy ? 'Enregistrement…' : 'Continuer'}</button></div>
        </div>
      )}

      {step === 1 && (
        <div className="card">
          <h2>Choisissez vos messages</h2>
          <p className="sub">Un modèle adapté à votre métier : une réponse immédiate puis des relances douces. Vous pourrez tout modifier ensuite.</p>
          <div className="tpl-grid">
            {LIBRARY.map((t) => (
              <button key={t.id} type="button" className={`tpl ${t.id === tpl ? 'on' : ''}`} onClick={() => setTpl(t.id)} aria-pressed={t.id === tpl}>
                <strong>{t.title}</strong>
                <span className="tl-meta">{t.who}</span>
                <span className="tl-meta">{t.steps.length} messages · jours {t.steps.map((s) => s.delayDays).join(', ')}</span>
              </button>
            ))}
          </div>
          <h3 style={{ margin: '18px 0 8px', fontSize: '1.15rem' }}>Aperçu du premier message pour Camille</h3>
          <div className="tl-item"><div className="tl-head"><strong>Objet : {render(current.steps[0].subject, { prenom: 'Camille', mon_prenom: profile.my_name || 'Sophie', activite: profile.activity, lien: '' })}</strong></div><div className="tl-body">{preview}</div></div>
          <div className="actions" style={{ marginTop: 14 }}>
            <button className="btn btn-ghost" onClick={() => setStep(0)}>Retour</button>
            <button className="btn btn-primary" onClick={saveTemplate} disabled={busy}>{busy ? 'Enregistrement…' : 'Utiliser ce modèle'}</button>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="card">
          <h2>Connectez votre boîte email</h2>
          <p className="sub">Pour que vos réponses et relances partent réellement de votre adresse, avec votre nom. Vous pouvez aussi passer cette étape et tester d’abord en simulation.</p>
          <EmailConnect connected={connected} currentUser={email.user} currentHost={email.host} accountEmail={email.accountEmail} onConnected={() => setConnected(true)} />
          <div className="actions" style={{ marginTop: 14 }}>
            <button className="btn btn-ghost" onClick={() => setStep(1)}>Retour</button>
            <button className="btn btn-primary" onClick={() => setStep(3)}>{connected ? 'Continuer' : 'Passer pour l’instant'}</button>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="card">
          <h2>Recevez vos premiers contacts</h2>
          <p className="sub">Votre séquence démarre dès qu’une personne vous écrit.</p>
          <div className="src-grid">
            <div className="src">
              <strong>1. Votre formulaire de contact</strong>
              <p className="tl-meta">Mettez ce lien sur votre site, votre bio Instagram ou LinkedIn. Chaque message reçu déclenche la séquence.</p>
              <CopyField label="Lien du formulaire" value={formUrl} />
            </div>
            <div className="src">
              <strong>2. Ajouter un contact à la main</strong>
              <p className="tl-meta">Quelqu’un vous a écrit sur WhatsApp ou par téléphone ? Ajoutez-le en 10 secondes dans « Contacts ».</p>
            </div>
            <div className="src">
              <strong>3. Le voir tourner tout de suite</strong>
              <p className="tl-meta">{connected ? 'Vous êtes en envoi réel : ajoutez un vrai contact (une personne qui a demandé à être recontactée).' : 'Créez un contact de démonstration : le premier message part, puis avancez le temps pour voir les relances J+2 et J+5.'}</p>
              {!connected && (demo ? <button className="btn btn-ghost btn-sm" onClick={() => finish(`/dashboard/leads/${demo}`)}>Voir la séquence de Camille</button> : <button className="btn btn-ghost btn-sm" onClick={addDemo} disabled={busy}>Créer un contact de démonstration</button>)}
            </div>
          </div>
          <div className="actions" style={{ marginTop: 14 }}>
            <button className="btn btn-ghost" onClick={() => setStep(2)}>Retour</button>
            <button className="btn btn-primary" onClick={() => finish('/dashboard')}>Terminer et ouvrir mon tableau de bord</button>
          </div>
        </div>
      )}

      <p className="tl-meta" style={{ textAlign: 'center', marginTop: 14 }}>
        <button className="linklike" onClick={() => finish('/dashboard')}>Passer la configuration</button> — vous la retrouverez dans « Réglages ».
      </p>
    </div>
  );
}
