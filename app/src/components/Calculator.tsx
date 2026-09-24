'use client';
import { useState } from 'react';

const eur = (n: number) => Math.round(n).toLocaleString('fr-FR') + ' €';
const dec = (n: number) => (Math.round(n * 10) / 10).toString().replace('.', ',');

export function Calculator() {
  const [req, setReq] = useState(8);
  const [price, setPrice] = useState(90);
  const [loss, setLoss] = useState(60);
  const [rec, setRec] = useState(20);

  const lost = req * (loss / 100);
  const recovered = lost * (rec / 100);
  const month = recovered * price;
  const sessions = Math.ceil(199 / price);

  const Ctl = ({ id, label, value, display, min, max, step, set, hint }: { id: string; label: string; value: number; display: string; min: number; max: number; step?: number; set: (n: number) => void; hint?: string }) => (
    <div className="ctl">
      <label htmlFor={id}>{label}<b>{display}</b></label>
      <input id={id} type="range" min={min} max={max} step={step ?? 1} value={value} onChange={(e) => set(Number(e.target.value))} />
      {hint && <small>{hint}</small>}
    </div>
  );

  return (
    <div className="calc card">
      <Ctl id="c-req" label="Demandes reçues par mois" value={req} display={String(req)} min={2} max={40} set={setReq} />
      <Ctl id="c-price" label="Prix d’une séance" value={price} display={`${price} €`} min={30} max={300} step={5} set={setPrice} />
      <Ctl id="c-loss" label="Demandes sans suite aujourd’hui" value={loss} display={`${loss} %`} min={10} max={90} step={5} set={setLoss} hint="Hypothèse de départ à ajuster avec vos chiffres." />
      <Ctl id="c-rec" label="Part récupérée grâce au suivi" value={rec} display={`${rec} %`} min={5} max={60} step={5} set={setRec} hint="Hypothèse prudente, sans garantie de résultat." />
      <div className="calc-out">
        <div><span>{dec(lost)}</span><small>demandes sans suite / mois</small></div>
        <div><span>{dec(recovered)}</span><small>rendez-vous récupérés / mois</small></div>
        <div className="big"><span>{eur(month * 12)}</span><small>de chiffre d’affaires récupéré par an (estimation)</small></div>
      </div>
      <p className="calc-note">Il suffit de récupérer {sessions} séance{sessions > 1 ? 's' : ''} pour rentabiliser les 199 € de l’offre illimitée.</p>
    </div>
  );
}
