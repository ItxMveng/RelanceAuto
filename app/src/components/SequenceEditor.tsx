'use client';
import { useRef, useState } from 'react';
import { call } from './api';
import { defaultSteps, render, Step, Tone, VARIABLES } from '@/lib/templates';

type Props = { initial: Step[]; vars: { mon_prenom: string; activite: string; lien: string } };

export function SequenceEditor({ initial, vars }: Props) {
  const [steps, setSteps] = useState<Step[]>(initial);
  const [active, setActive] = useState(0);
  const [msg, setMsg] = useState<{ kind: 'err' | 'good'; text: string } | null>(null);
  const [busy, setBusy] = useState(false);
  const bodyRef = useRef<HTMLTextAreaElement>(null);

  const preview = { prenom: 'Camille', mon_prenom: vars.mon_prenom || 'Sophie', activite: vars.activite, lien: vars.lien || 'https://votre-lien-de-reservation' };

  function update(i: number, patch: Partial<Step>) {
    setSteps((s) => s.map((st, idx) => (idx === i ? { ...st, ...patch } : st)));
  }
  function insertVar(key: string) {
    const el = bodyRef.current;
    const token = `{{${key}}}`;
    if (!el) return update(active, { body: steps[active].body + token });
    const start = el.selectionStart ?? el.value.length;
    const end = el.selectionEnd ?? start;
    const next = el.value.slice(0, start) + token + el.value.slice(end);
    update(active, { body: next });
    requestAnimationFrame(() => { el.focus(); el.setSelectionRange(start + token.length, start + token.length); });
  }
  function addStep() {
    if (steps.length >= 5) return;
    const last = steps[steps.length - 1];
    setSteps([...steps, { delayDays: last.delayDays + 3, subject: 'Un dernier point', body: 'Bonjour {{prenom}},\n\n…\n\n{{mon_prenom}}' }]);
    setActive(steps.length);
  }
  function removeStep(i: number) {
    if (steps.length <= 1) return;
    setSteps(steps.filter((_, idx) => idx !== i));
    setActive(0);
  }
  function applyTone(t: Tone) {
    if (!window.confirm('Remplacer vos messages par le modèle ' + (t === 'warm' ? 'chaleureux' : 'sobre') + ' ?')) return;
    setSteps(defaultSteps(t));
    setActive(0);
  }
  async function save() {
    setBusy(true);
    setMsg(null);
    const r = await call('/api/sequence', 'PUT', { steps });
    setBusy(false);
    setMsg(r.ok ? { kind: 'good', text: 'Séquence enregistrée. Elle s’applique aux prochains contacts.' } : { kind: 'err', text: r.error ?? 'Erreur' });
  }

  const cur = steps[active];
  return (
    <div className="grid two">
      <div className="card">
        <div className="chips-row" role="tablist" aria-label="Étapes">
          {steps.map((s, i) => (
            <button key={i} type="button" role="tab" aria-selected={i === active} onClick={() => setActive(i)} style={i === active ? { borderColor: 'var(--primary)', color: 'var(--primary)', fontWeight: 600 } : undefined}>
              {i === 0 ? 'Réponse immédiate' : `J+${s.delayDays}`}
            </button>
          ))}
          {steps.length < 5 && <button type="button" onClick={addStep}>+ Ajouter une relance</button>}
        </div>
        {msg && <div className={`msg ${msg.kind}`} role="status">{msg.text}</div>}
        {cur && (
          <>
            {active > 0 && (
              <div className="row">
                <div className="field">
                  <label htmlFor="delay">Envoyée après (jours)</label>
                  <input id="delay" type="number" min={1} max={60} className="input" value={cur.delayDays} onChange={(e) => update(active, { delayDays: Number(e.target.value) })} />
                  <span className="hint">Doit être postérieure à l’étape précédente.</span>
                </div>
              </div>
            )}
            <div className="field">
              <label htmlFor="subj">Objet</label>
              <input id="subj" className="input" maxLength={200} value={cur.subject} onChange={(e) => update(active, { subject: e.target.value })} />
            </div>
            <div className="field">
              <label htmlFor="body">Message</label>
              <div className="chips-row" aria-label="Insérer une variable">
                {VARIABLES.map((v) => <button key={v.key} type="button" title={v.label} onClick={() => insertVar(v.key)}>{`{{${v.key}}}`}</button>)}
              </div>
              <textarea id="body" ref={bodyRef} className="textarea" style={{ minHeight: 220 }} maxLength={5000} value={cur.body} onChange={(e) => update(active, { body: e.target.value })} />
            </div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <button className="btn btn-primary" onClick={save} disabled={busy}>{busy ? 'Enregistrement…' : 'Enregistrer la séquence'}</button>
              <button className="btn btn-ghost" onClick={() => applyTone('warm')}>Modèle chaleureux</button>
              <button className="btn btn-ghost" onClick={() => applyTone('pro')}>Modèle sobre</button>
              {steps.length > 1 && active > 0 && <button className="btn btn-danger" onClick={() => removeStep(active)}>Supprimer cette étape</button>}
            </div>
          </>
        )}
      </div>
      <div className="card">
        <h2>Aperçu pour Camille</h2>
        <p className="sub">Ce que recevrait votre prospect à cette étape.</p>
        {cur && (
          <div className="tl-item">
            <div className="tl-head"><strong>Objet : {render(cur.subject, preview)}</strong></div>
            <div className="tl-body">{render(cur.body, preview)}</div>
          </div>
        )}
        <p className="tl-meta" style={{ marginTop: 10 }}>Un lien de désinscription est ajouté automatiquement en bas de chaque email envoyé.</p>
      </div>
    </div>
  );
}
