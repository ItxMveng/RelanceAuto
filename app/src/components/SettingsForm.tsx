'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { call } from './api';
import { ACTIVITIES } from '@/lib/templates';

type Init = { my_name: string; activity: string; booking_link: string; tone: 'warm' | 'pro'; send_from_hour: number; send_to_hour: number };

export function SettingsForm({ init }: { init: Init }) {
  const router = useRouter();
  const [v, setV] = useState(init);
  const [msg, setMsg] = useState<{ kind: 'err' | 'good'; text: string } | null>(null);
  const [busy, setBusy] = useState(false);
  const set = (patch: Partial<Init>) => setV((s) => ({ ...s, ...patch }));

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setMsg(null);
    const r = await call('/api/settings', 'PUT', v);
    setBusy(false);
    setMsg(r.ok ? { kind: 'good', text: 'Réglages enregistrés.' } : { kind: 'err', text: r.error ?? 'Erreur' });
    if (r.ok) router.refresh();
  }

  return (
    <form onSubmit={save}>
      {msg && <div className={`msg ${msg.kind}`} role="status">{msg.text}</div>}
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
      <div className="row">
        <div className="field">
          <label htmlFor="from">Envoyer les emails à partir de</label>
          <select id="from" className="select" value={v.send_from_hour} onChange={(e) => set({ send_from_hour: Number(e.target.value) })}>
            {Array.from({ length: 24 }).map((_, h) => <option key={h} value={h}>{String(h).padStart(2, '0')} h</option>)}
          </select>
        </div>
        <div className="field">
          <label htmlFor="to">…jusqu’à</label>
          <select id="to" className="select" value={v.send_to_hour} onChange={(e) => set({ send_to_hour: Number(e.target.value) })}>
            {Array.from({ length: 24 }).map((_, h) => <option key={h + 1} value={h + 1}>{String(h + 1).padStart(2, '0')} h</option>)}
          </select>
        </div>
      </div>
      <p className="hint" style={{ marginBottom: 12 }}>Heure de Paris. En envoi réel, un message prévu en dehors de cette plage attend l’ouverture suivante : vos prospects ne reçoivent rien la nuit.</p>
      <button className="btn btn-primary" disabled={busy}>{busy ? 'Enregistrement…' : 'Enregistrer'}</button>
    </form>
  );
}
