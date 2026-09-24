'use client';
import { useMemo, useState } from 'react';
import { ACTIVITIES, defaultSteps, render, type Tone } from '@/lib/templates';

export function SequenceDemo() {
  const [prospect, setProspect] = useState('Camille');
  const [me, setMe] = useState('Sophie');
  const [act, setAct] = useState(ACTIVITIES[3].value);
  const [tone, setTone] = useState<Tone>('warm');
  const [copied, setCopied] = useState<number | null>(null);
  const steps = useMemo(() => defaultSteps(tone), [tone]);
  const vars = { prenom: prospect.trim() || 'Camille', mon_prenom: me.trim() || 'Sophie', activite: act, lien: 'https://votre-lien-de-reservation' };
  const when = ['Immédiatement (moins de 5 min)', 'J+2 · sans réponse', 'J+5 · dernière relance'];

  async function copy(i: number) {
    try { await navigator.clipboard.writeText(render(steps[i].body, vars)); } catch { /* copie non disponible */ }
    setCopied(i);
    setTimeout(() => setCopied(null), 1400);
  }

  return (
    <div className="demo">
      <form className="demo-form card" onSubmit={(e) => e.preventDefault()} aria-label="Personnaliser la démonstration">
        <div className="field"><label htmlFor="d-p">Prénom du prospect</label><input id="d-p" className="input" value={prospect} maxLength={30} onChange={(e) => setProspect(e.target.value)} /></div>
        <div className="field"><label htmlFor="d-m">Votre prénom</label><input id="d-m" className="input" value={me} maxLength={30} onChange={(e) => setMe(e.target.value)} /></div>
        <div className="field">
          <label htmlFor="d-a">Votre activité</label>
          <select id="d-a" className="select" value={act} onChange={(e) => setAct(e.target.value)}>{ACTIVITIES.map((a) => <option key={a.value} value={a.value}>{a.label}</option>)}</select>
        </div>
        <div className="field">
          <span className="lbl">Ton des messages</span>
          <div className="seg" role="group" aria-label="Ton">
            <button type="button" className={tone === 'warm' ? 'on' : ''} aria-pressed={tone === 'warm'} onClick={() => setTone('warm')}>Chaleureux</button>
            <button type="button" className={tone === 'pro' ? 'on' : ''} aria-pressed={tone === 'pro'} onClick={() => setTone('pro')}>Sobre</button>
          </div>
        </div>
      </form>
      <div className="demo-thread" aria-live="polite">
        {steps.map((s, i) => (
          <article className="mail" key={i}>
            <header>
              <span className="mail-when">{when[i]}</span>
              <button type="button" className="copy" onClick={() => copy(i)}>{copied === i ? 'Copié ✓' : 'Copier'}</button>
            </header>
            <div className="mail-subj">Objet : {render(s.subject, vars)}</div>
            <div className="mail-body">{render(s.body, vars)}</div>
          </article>
        ))}
        <p className="demo-note">Exemple généré dans votre navigateur : rien n’est envoyé ni enregistré. Dans l’application, vous choisissez un modèle adapté à votre métier et vous l’adaptez à votre voix.</p>
      </div>
    </div>
  );
}
