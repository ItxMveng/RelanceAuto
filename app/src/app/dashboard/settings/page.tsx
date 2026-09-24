import { requireCtx } from '@/lib/auth';
import { appUrl, trialState } from '@/lib/engine';
import { SettingsForm } from '@/components/SettingsForm';
import { CopyField } from '@/components/CopyField';
import { fmtDate } from '@/lib/format';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Réglages' };

export default async function SettingsPage() {
  const { account, user } = await requireCtx();
  const trial = trialState(account);
  const base = appUrl();
  return (
    <>
      <div className="page-head">
        <div>
          <h1>Réglages</h1>
          <p>Identité, envoi des emails, formulaire de contact et intégrations.</p>
        </div>
      </div>
      <div className="grid">
        <SettingsForm
          init={{
            my_name: account.my_name, activity: account.activity, booking_link: account.booking_link, tone: account.tone,
            send_mode: account.send_mode, smtp_host: account.smtp_host ?? '', smtp_port: account.smtp_port ?? '',
            smtp_user: account.smtp_user ?? '', smtp_from: account.smtp_from ?? '', hasPass: Boolean(account.smtp_pass_enc),
          }}
        />
        <div className="card">
          <h2>Votre formulaire de contact</h2>
          <p className="sub">Partagez ce lien (site, bio, réseaux) : chaque personne qui écrit entre automatiquement dans la séquence.</p>
          <CopyField label="Lien du formulaire" value={`${base}/f/${account.capture_slug}`} />
          <p className="tl-meta" style={{ marginTop: 8 }}><a href={`/f/${account.capture_slug}`} target="_blank" rel="noreferrer">Ouvrir le formulaire</a></p>
        </div>
        <div className="card">
          <h2>Arrêt automatique au rendez-vous</h2>
          <p className="sub">
            Dans Cal.com (Paramètres → Développeur → Webhooks) ou Calendly, ajoutez ce webhook sur l’événement « réservation créée » :
            les relances s’arrêtent dès qu’un contact prend rendez-vous avec le même email. Vous pouvez aussi cliquer « RDV pris » à la main.
          </p>
          <CopyField label="URL du webhook" value={`${base}/api/webhooks/booking?key=${account.webhook_key}`} />
        </div>
        <div className="card">
          <h2>Votre compte</h2>
          <p className="sub">{user.email}</p>
          <p>
            Offre : <strong>{trial.isPro ? 'Illimitée' : trial.active ? `Essai gratuit — se termine le ${fmtDate(trial.endsAt)}` : 'Essai terminé'}</strong>
          </p>
          {!trial.isPro && (
            <p style={{ marginTop: 10 }}>
              <a className="btn btn-primary btn-sm" href={process.env.UPGRADE_URL || 'https://cal.com/victor-francis-itoua-mveng-feg0dn/15min'}>Passer en illimité — 199 €, une seule fois</a>
            </p>
          )}
        </div>
      </div>
    </>
  );
}
