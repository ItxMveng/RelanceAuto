import { requireCtx } from '@/lib/auth';
import { trialState } from '@/lib/engine';
import { fmtDate } from '@/lib/format';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Passer en illimité' };

const INCLUDED = [
  'Contacts illimités (10 pendant l’essai)',
  'Envoi réel sans plafond depuis votre propre adresse (30 emails pendant l’essai)',
  'Séquences jusqu’à 5 messages et modèles par métier',
  'Formulaire de contact, webhooks de réservation et de réponse',
  'Statistiques, boîte d’envoi, export CSV de vos contacts',
  'Support par email pendant 30 jours pour la mise en place',
];

export default async function Upgrade() {
  const { account, user } = await requireCtx();
  const trial = trialState(account);
  const pay = process.env.PAYMENT_URL;
  const call = process.env.UPGRADE_URL || 'https://cal.com/victor-francis-itoua-mveng-feg0dn/15min';
  const support = process.env.SUPPORT_EMAIL || 'francisitoua05@gmail.com';

  return (
    <>
      <div className="page-head">
        <div>
          <h1>Passer en illimité</h1>
          <p>Un paiement unique, sans abonnement.</p>
        </div>
      </div>
      {trial.isPro ? (
        <div className="card"><h2>Vous êtes en offre illimitée</h2><p className="sub">Merci de votre confiance. Écrivez-nous à <a href={`mailto:${support}`}>{support}</a> pour toute question.</p></div>
      ) : (
        <div className="grid two">
          <div className="card">
            <h2>RelanceAuto illimité</h2>
            <p className="price">199 €<span> une seule fois</span></p>
            <ul className="perks">{INCLUDED.map((i) => <li key={i}>{i}</li>)}</ul>
          </div>
          <div className="card">
            <h2>Comment ça se passe</h2>
            <ol className="how">
              <li><strong>Réglez 199 €</strong><span>{pay ? 'Paiement sécurisé en ligne.' : 'Réservez un appel de 15 minutes : nous validons ensemble votre besoin puis vous recevez le lien de paiement.'}</span></li>
              <li><strong>Votre compte est activé</strong><span>Indiquez l’email de votre compte : <code>{user.email}</code>. L’activation est faite le jour même (jours ouvrés).</span></li>
              <li><strong>Vos données restent en place</strong><span>Contacts, séquence et réglages sont conservés tels quels.</span></li>
            </ol>
            <div className="actions" style={{ marginTop: 14 }}>
              {pay && <a className="btn btn-primary" href={pay} target="_blank" rel="noreferrer">Payer 199 €</a>}
              <a className={pay ? 'btn btn-ghost' : 'btn btn-primary'} href={call} target="_blank" rel="noreferrer">Réserver un appel de 15 min</a>
              <a className="btn btn-ghost" href={`mailto:${support}?subject=Activation%20RelanceAuto&body=Email%20de%20mon%20compte%20:%20${encodeURIComponent(user.email)}`}>Écrire à l’assistance</a>
            </div>
            <p className="tl-meta" style={{ marginTop: 12 }}>Essai en cours : {trial.active ? `se termine le ${fmtDate(trial.endsAt)}` : 'terminé'}.</p>
          </div>
        </div>
      )}
    </>
  );
}
