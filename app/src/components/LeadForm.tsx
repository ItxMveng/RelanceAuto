'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { call } from './api';

export function LeadForm({ simulation = true }: { simulation?: boolean }) {
  const router = useRouter();
  const [tab, setTab] = useState<'one' | 'many'>('one');
  const [msg, setMsg] = useState<{ kind: 'err' | 'good'; text: string } | null>(null);
  const [busy, setBusy] = useState(false);

  async function addOne(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const f = new FormData(form);
    setBusy(true);
    const r = await call('/api/leads', 'POST', { name: f.get('name'), email: f.get('email'), message: f.get('message') });
    setBusy(false);
    if (r.ok) {
      form.reset();
      setMsg({ kind: 'good', text: 'Contact ajouté : la séquence démarre immédiatement.' });
      router.refresh();
    } else setMsg({ kind: 'err', text: r.error ?? 'Erreur' });
  }

  async function addMany(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const f = new FormData(form);
    setBusy(true);
    const r = await call('/api/leads/import', 'POST', { text: f.get('text') });
    setBusy(false);
    if (r.ok) {
      const errs = (r.errors as string[]) ?? [];
      setMsg({ kind: r.created > 0 ? 'good' : 'err', text: `${r.created} contact(s) importé(s).${errs.length ? ' Ignorés : ' + errs.slice(0, 3).join(' ; ') : ''}` });
      if (r.created > 0) form.reset();
      router.refresh();
    } else setMsg({ kind: 'err', text: r.error ?? 'Erreur' });
  }

  return (
    <div className="card">
      <h2>Ajouter des contacts</h2>
      <p className="sub">Dès l’ajout, le premier message part et les relances sont planifiées.</p>
      {!simulation && <div className="msg info">Envoi réel actif : n’ajoutez que des personnes qui vous ont contacté ou qui ont accepté d’être recontactées.</div>}
      <div className="chips-row" role="tablist" aria-label="Mode d’ajout">
        <button type="button" role="tab" aria-selected={tab === 'one'} onClick={() => setTab('one')} style={tab === 'one' ? { borderColor: 'var(--primary)', color: 'var(--primary)' } : undefined}>Un contact</button>
        <button type="button" role="tab" aria-selected={tab === 'many'} onClick={() => setTab('many')} style={tab === 'many' ? { borderColor: 'var(--primary)', color: 'var(--primary)' } : undefined}>Importer une liste</button>
      </div>
      {msg && <div className={`msg ${msg.kind}`} role="status">{msg.text}</div>}
      {tab === 'one' ? (
        <form onSubmit={addOne}>
          <div className="row">
            <div className="field"><label htmlFor="l-name">Nom</label><input id="l-name" name="name" required className="input" maxLength={120} placeholder="Camille Martin" /></div>
            <div className="field"><label htmlFor="l-email">Email</label><input id="l-email" name="email" type="email" required className="input" maxLength={200} placeholder="camille@exemple.fr" /></div>
          </div>
          <div className="field"><label htmlFor="l-msg">Son message <span className="hint">(facultatif, pour mémoire)</span></label><input id="l-msg" name="message" className="input" maxLength={500} /></div>
          <button className="btn btn-primary" disabled={busy}>{busy ? 'Ajout…' : 'Ajouter et lancer la séquence'}</button>
        </form>
      ) : (
        <form onSubmit={addMany}>
          <div className="field">
            <label htmlFor="l-list">Une ligne par contact</label>
            <textarea id="l-list" name="text" required className="textarea" style={{ minHeight: 110 }} placeholder={'Camille Martin, camille@exemple.fr\nLucas Bernard; lucas@exemple.fr'} />
            <span className="hint">50 lignes maximum par import. Séparateurs : virgule, point-virgule ou tabulation.</span>
          </div>
          <button className="btn btn-primary" disabled={busy}>{busy ? 'Import…' : 'Importer'}</button>
        </form>
      )}
    </div>
  );
}
