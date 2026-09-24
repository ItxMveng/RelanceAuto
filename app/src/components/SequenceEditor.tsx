'use client';
import { useRef, useState } from 'react';
import { call } from './api';
import { render, Step, VARIABLES } from '@/lib/templates';
import type { LibraryEntry } from '@/lib/library';

type Props = { initial: Step[]; library: LibraryEntry[]; vars: { mon_prenom: string; activite: string; lien: string } };

export function SequenceEditor({ initial, library, vars }: Props) {
  const [steps, setSteps] = useState<Step[]>(initial);
  const [active, setActive] = useState(0);
  const [msg, setMsg] = useState<{ kind: 'err' | 'good'; text: string } | null>(null);
  const [busy, setBusy] = useState(false);
  const [dirty, setDirty] = useState(false);
  const bodyRef = useRef<HTMLTextAreaElement>(null);

  const preview = { prenom: 'Camille', mon_prenom: vars.mon_prenom || 'Sophie', activite: vars.activite, lien: vars.lien || 'https://votre-lien-de-reservation' };
  const missing = [!vars.mon_prenom && 'votre prénom', !vars.lien && 'votre lien de réservation'].filter(Boolean);

  function update(i: number, patch: Partial<Step>) {
    setSteps((s) => s.map((st, idx) => (idx === i ? { ...st, ...patch } : st)));
    setDirty(true);
  }
  function insertVar(key: string) {
    const el = bodyRef.current;
    const token = `{{${key}}}`;
    if (!el) return update(active, { body: steps[active].body + token });
    const start = el.selectionStart ?? el.value.length;
    const end = el.selectionEnd ?? start;
    update(active, { body: el.value.slice(0, start) + token + el.value.slice(end) });
    requestAnimationFrame(() => { el.focus(); el.setSelectionRange(start + token.length, start + token.length); });
  }
  function addStep() {
    if (steps.length >= 5) return;
    const last = steps[steps.length - 1];
    setSteps([...steps, { delayDays: last.delayDays + 3, subject: 'Un dernier point', body: 'Bonjour {{prenom}},\n\n…\n\n{{mon_prenom}}' }]);
    setActive(steps.length);
    setDirty(true);
  }
  function removeStep(i: number) {
    if (steps.length <= 1) return;
    setSteps(steps.filter((_, idx) => idx !== i));
    setActive(0);
    setDirty(true);
  }
  function applyTemplate(t: LibraryEntry) {
    if (dirty && !window.confirm('Remplacer vos messages actuels par ce modèle ?')) return;
    setSteps(t.steps.map((s) => ({ ...s })));
    setActive(0);
    setDirty(true);
    setMsg({ kind: 'good', text: `Modèle « ${t.title} » chargé : relisez-le puis enregistrez.` });
  }
  async function save() {
    setBusy(true);
    setMsg(null);
    const r = await call('/api/sequence', 'PUT', { steps });
    setBusy(false);
    if (r.ok) setDirty(false);
    setMsg(r.ok ? { kind: 'good', text: 'Séquence enregistrée. Elle s’applique aux prochains contacts.' } : { kind: 'err', text: r.error ?? 'Erreur' });
  }

  const cur = steps[active];
  return (
    <>
      {missing.length > 0 && <div className="msg info">Pour que les messages soient complets, renseignez {missing.join(' et ')} dans les <a href="/dashboard/settings">réglages</a>.</div>}
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
                <div className="field">
                  <label htmlFor="delay">Envoyée après (jours)</label>
                  <input id="delay" type="number" min={1} max={60} className="input" style={{ maxWidth: 140 }} value={cur.delayDays} onChange={(e) => update(active, { delayDays: Number(e.target.value) })} />
                  <span className="hint">Doit être postérieure à l’étape précédente.</span>
                </div>
              )}
              <div className="field">
                <label htmlFor="subj">Objet</label>
                <input id="subj" className="input" maxLength={200} value={cur.subject} onChange={(e) => update(active, { subject: e.target.value })} />
              </div>
              <div className="field">
                <label htmlFor="body">Message</label>
                <div className="chips-row" aria-label="Insérer une variable">
                  {VARIABLES.map((v) => <button key={v.key} type="button" title={v.label} onClick={() => insertVar(v.key)}>{v.label}</button>)}
                </div>
                <textarea id="body" ref={bodyRef} className="textarea" style={{ minHeight: 220 }} maxLength={5000} value={cur.body} onChange={(e) => update(active, { body: e.target.value })} />
              </div>
              <div className="actions">
                <button className="btn btn-primary" onClick={save} disabled={busy || !dirty}>{busy ? 'Enregistrement…' : dirty ? 'Enregistrer la séquence' : 'Enregistrée ✓'}</button>
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

      <div className="card" style={{ marginTop: 18 }}>
        <h2>Modèles prêts à l’emploi</h2>
        <p className="sub">Cliquez pour charger un modèle, puis adaptez-le à votre voix.</p>
        <div className="tpl-grid">
          {library.map((t) => (
            <button key={t.id} type="button" className="tpl" onClick={() => applyTemplate(t)}>
              <strong>{t.title}</strong>
              <span className="tl-meta">{t.description}</span>
              <span className="tl-meta">{t.steps.length} messages · jours {t.steps.map((s) => s.delayDays).join(', ')}</span>
            </button>
          ))}
        </div>
      </div>
    </>
  );
}
