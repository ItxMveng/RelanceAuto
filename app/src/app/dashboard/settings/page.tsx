import Link from 'next/link';
import { requireCtx } from '@/lib/auth';
import { appUrl, trialState } from '@/lib/engine';
import { SettingsForm } from '@/components/SettingsForm';
import { EmailConnect } from '@/components/EmailConnect';
import { AccountForm } from '@/components/AccountForm';
import { CopyField } from '@/components/CopyField';
import { fmtDate } from '@/lib/format';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Réglages' };

export default async function SettingsPage() {
  const { account, user } = await requireCtx();
  const trial = trialState(account);
  const base = appUrl();
  const formUrl = `${base}/f/${account.capture_slug}`;
  const embed = `<iframe src="${formUrl}" title="Me contacter" width="100%" height="560" style="border:0;max-width:520px"></iframe>`;
  const connected = account.send_mode === 'smtp';

  return (
    <>
      <div className="page-head">
        <div>
          <h1>Réglages</h1>
          <p>Votre identité, votre boîte email, vos sources de contacts et votre compte.</p>
        </div>
        <Link className="btn btn-ghost btn-sm" href="/dashboard/welcome">Relancer l’assistant</Link>
      </div>
      <div className="grid">
        <section className="card" id="profil">
          <h2>Votre activité</h2>
          <p className="sub">Ces informations remplissent les variables de vos messages.</p>
          <SettingsForm init={{ my_name: account.my_name, activity: account.activity, booking_link: account.booking_link, tone: account.tone, send_from_hour: account.send_from_hour, send_to_hour: account.send_to_hour }} />
        </section>

        <section className="card" id="email">
          <h2>Votre boîte email</h2>
          <p className="sub">Vos messages partent de votre propre adresse : vos prospects vous répondent directement, et la délivrabilité est celle de votre domaine.</p>
          <EmailConnect connected={connected} currentUser={account.smtp_user ?? ''} currentHost={account.smtp_host ?? ''} accountEmail={user.email} />
          {trial.isPro ? null : <p className="tl-meta" style={{ marginTop: 10 }}>Pendant l’essai : 30 emails réels au maximum.</p>}
        </section>

        <section className="card" id="sources">
          <h2>Recevoir vos contacts</h2>
          <p className="sub">Trois façons d’alimenter RelanceAuto : la première suffit pour démarrer.</p>
          <h3 className="h3">1. Formulaire de contact hébergé</h3>
          <p className="tl-meta" style={{ marginBottom: 8 }}>Mettez ce lien sur votre site, dans votre bio Instagram ou LinkedIn, dans votre signature.</p>
          <CopyField label="Lien du formulaire" value={formUrl} />
          <p className="tl-meta" style={{ margin: '8px 0 16px' }}><a href={`/f/${account.capture_slug}`} target="_blank" rel="noreferrer">Ouvrir le formulaire</a></p>
          <h3 className="h3">2. Intégrer le formulaire à votre site</h3>
          <p className="tl-meta" style={{ marginBottom: 8 }}>Collez ce code dans une page de votre site (Wix, WordPress, Squarespace, Systeme.io…).</p>
          <CopyField label="Code d’intégration" value={embed} multiline />
          <h3 className="h3" style={{ marginTop: 16 }}>3. Depuis vos autres outils (Zapier, Make, formulaires existants)</h3>
          <p className="tl-meta" style={{ marginBottom: 8 }}>Envoyez une requête POST JSON avec <code>name</code>, <code>email</code> et <code>message</code> à :</p>
          <CopyField label="URL de capture" value={`${base}/api/capture/${account.capture_slug}`} />
        </section>

        <section className="card" id="arret">
          <h2>Arrêter les relances automatiquement</h2>
          <p className="sub">Une relance à quelqu’un qui a déjà réservé ou répondu ferait mauvaise impression : RelanceAuto s’arrête dans deux cas.</p>
          <h3 className="h3">Rendez-vous pris</h3>
          <p className="tl-meta" style={{ marginBottom: 8 }}>Dans Cal.com (Paramètres → Développeur → Webhooks) ou Calendly, ajoutez ce webhook sur l’événement « réservation créée » : le contact qui réserve avec le même email est retiré de la séquence.</p>
          <CopyField label="Webhook de réservation" value={`${base}/api/webhooks/booking?key=${account.webhook_key}`} />
          <h3 className="h3" style={{ marginTop: 16 }}>Réponse du prospect</h3>
          <p className="tl-meta" style={{ marginBottom: 8 }}>Cliquez « A répondu » sur le contact, ou automatisez avec Zapier/Make : envoyez <code>{'{"email":"prospect@exemple.fr"}'}</code> à cette adresse quand un email arrive.</p>
          <CopyField label="Webhook de réponse" value={`${base}/api/webhooks/reply?key=${account.webhook_key}`} />
        </section>

        <section className="card" id="compte">
          <h2>Votre compte</h2>
          <p className="sub">{user.email}</p>
          <p>
            Offre : <strong>{trial.isPro ? 'Illimitée' : trial.active ? `Essai gratuit — se termine le ${fmtDate(trial.endsAt)}` : 'Essai terminé'}</strong>
            {!trial.isPro && <> · <Link href="/dashboard/upgrade">Passer en illimité</Link></>}
          </p>
          <hr className="sep" />
          <AccountForm />
        </section>
      </div>
    </>
  );
}
