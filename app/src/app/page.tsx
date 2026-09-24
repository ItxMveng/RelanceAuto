import Link from 'next/link';
import { getCtx } from '@/lib/auth';
import { Calculator } from '@/components/Calculator';
import { SequenceDemo } from '@/components/SequenceDemo';
import { BrandMark } from '@/components/Brand';
import './marketing.css';

export const dynamic = 'force-dynamic';

const I = {
  zap: 'M13 2L3 14h9l-1 8 10-12h-9z',
  send: 'M22 2L11 13M22 2l-7 20-4-9-9-4z',
  stop: 'M12 22a10 10 0 100-20 10 10 0 000 20zM8 12h8',
  mail: 'M4 4h16a2 2 0 012 2v12a2 2 0 01-2 2H4a2 2 0 01-2-2V6a2 2 0 012-2zM22 6l-10 7L2 6',
  book: 'M4 19.5A2.5 2.5 0 016.5 17H20V2H6.5A2.5 2.5 0 004 4.5v15zM4 19.5A2.5 2.5 0 006.5 22H20v-5',
  form: 'M9 11l3 3L22 4M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11',
  chart: 'M3 3v18h18M7 15v3M12 9v9M17 5v13',
  shield: 'M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10zM9 12l2 2 4-4',
  clock: 'M12 22a10 10 0 100-20 10 10 0 000 20zM12 6v6l4 2',
  check: 'M20 6L9 17l-5-5',
};
const Icon = ({ d }: { d: string }) => (
  <svg viewBox="0 0 24 24" aria-hidden="true" className="ico"><path d={d} /></svg>
);

const FEATURES = [
  { icon: I.zap, title: 'Réponse en moins de 5 minutes', text: 'Dès qu’une personne vous écrit, elle reçoit un message chaleureux signé de votre prénom, même si vous êtes en séance.' },
  { icon: I.clock, title: 'Relances douces à J+2 et J+5', text: 'Deux relances courtes et sans pression, avec votre lien de réservation. Vous réglez les délais et le nombre de messages.' },
  { icon: I.stop, title: 'Arrêt automatique', text: 'Dès qu’un rendez-vous est pris (webhook Cal.com ou Calendly) ou que la personne répond, plus aucune relance ne part.' },
  { icon: I.mail, title: 'Depuis votre propre adresse', text: 'Gmail, Outlook, OVH, IONOS… Vos messages partent de votre boîte : ils sont lus comme des emails personnels, et vos prospects vous répondent directement.' },
  { icon: I.book, title: 'Modèles par métier', text: 'Coach de vie, business, thérapeute, sophrologue, hypnothérapeute : partez d’un modèle rédigé pour votre pratique et faites-le vôtre.' },
  { icon: I.form, title: 'Formulaire de contact prêt', text: 'Un formulaire hébergé à partager en un lien ou à intégrer à votre site. Chaque message reçu lance la séquence.' },
  { icon: I.chart, title: 'Vous voyez tout', text: 'Entonnoir, messages par jour, boîte d’envoi, tableau des contacts : vous savez qui a été contacté, relancé, qui a réservé.' },
  { icon: I.shield, title: 'Respectueux et conforme', text: 'Lien de désinscription dans chaque email, fenêtre d’envoi sans messages la nuit, export et suppression de vos données en un clic.' },
];

const STEPS = [
  { n: '1', title: 'Configurez en 5 minutes', text: 'Un assistant vous guide : votre prénom, votre lien de réservation, un modèle de messages, votre boîte email.' },
  { n: '2', title: 'Partagez votre formulaire', text: 'Sur votre site, votre bio Instagram ou votre signature. Vous pouvez aussi ajouter un contact à la main.' },
  { n: '3', title: 'RelanceAuto répond et relance', text: 'Réponse immédiate, puis relances aux jours choisis, depuis votre adresse, aux heures qui conviennent.' },
  { n: '4', title: 'Vous n’avez plus qu’à recevoir', text: 'Quand la personne réserve ou répond, tout s’arrête. Vous suivez le résultat dans votre tableau de bord.' },
];

const FAQ = [
  ['Ai-je besoin de compétences techniques ?', 'Non. L’assistant de démarrage tient en quatre étapes. Pour la boîte email, vous choisissez votre fournisseur (Gmail, Outlook…) et collez un mot de passe d’application : nous expliquons où le trouver.'],
  ['Les messages partent-ils vraiment de mon adresse ?', 'Oui. RelanceAuto se connecte à votre boîte via SMTP : vos prospects voient votre adresse et votre nom, leurs réponses arrivent dans votre boîte habituelle, et la réputation de votre domaine est celle qui compte.'],
  ['Puis-je essayer sans envoyer d’emails à de vrais prospects ?', 'Oui. Le mode simulation, actif par défaut, montre toute la séquence et vous permet d’avancer le temps pour voir partir les relances J+2 et J+5. L’envoi réel s’active quand vous le décidez.'],
  ['Que se passe-t-il quand quelqu’un réserve ou répond ?', 'La séquence s’arrête : automatiquement si vous branchez le webhook de votre agenda (Cal.com, Calendly), ou en un clic sur « A répondu » / « RDV pris ».'],
  ['Est-ce conforme au RGPD ?', 'Chaque email contient un lien de désinscription, les envois respectent une plage horaire, et vous pouvez exporter ou supprimer toutes vos données à tout moment. Vous restez responsable du choix des personnes contactées : n’écrivez qu’à celles qui vous ont sollicité.'],
  ['Où sont stockées mes données ?', 'Dans une base PostgreSQL hébergée en Europe (Francfort). Le mot de passe de votre boîte email est chiffré (AES-256) avant enregistrement et peut être supprimé à tout moment.'],
  ['Quelle est la différence entre l’essai et l’offre illimitée ?', 'L’essai dure 14 jours, avec 10 contacts et 30 emails réels. L’offre illimitée (199 €, une seule fois) lève ces limites, sans abonnement.'],
  ['Et si ça ne me convient pas ?', 'Vous pouvez exporter vos contacts en CSV et supprimer votre compte depuis les réglages. Pendant l’essai, vous ne payez rien.'],
];

export default async function Landing() {
  const ctx = await getCtx();
  const cta = ctx ? { href: '/dashboard', label: 'Ouvrir mon tableau de bord' } : { href: '/signup', label: 'Essayer gratuitement' };

  return (
    <div className="mk">
      <header className="mk-nav">
        <div className="mk-wrap mk-nav-in">
          <Link href="/" className="mk-logo"><BrandMark /> RelanceAuto</Link>
          <nav aria-label="Sections" className="mk-links">
            <a href="#fonctionnement">Fonctionnement</a>
            <a href="#fonctionnalites">Fonctionnalités</a>
            <a href="#essayer">Essayer</a>
            <a href="#tarif">Tarif</a>
            <a href="#faq">FAQ</a>
          </nav>
          <div className="mk-nav-cta">
            {!ctx && <Link href="/login" className="mk-login">Connexion</Link>}
            <Link href={cta.href} className="btn btn-primary btn-sm">{cta.label}</Link>
          </div>
        </div>
      </header>

      <main>
        <section className="mk-hero">
          <div className="mk-wrap mk-hero-in">
            <div className="mk-hero-copy">
              <p className="eyebrow">Pour coachs, thérapeutes et praticiens indépendants</p>
              <h1>Chaque demande mérite une réponse. <em>Même quand vous êtes en séance.</em></h1>
              <p className="lead">RelanceAuto répond à vos prospects en moins de cinq minutes, les relance avec délicatesse, et s’arrête dès qu’ils réservent. Depuis votre propre adresse email.</p>
              <div className="mk-hero-btns">
                <Link href={cta.href} className="btn btn-primary btn-lg">{cta.label}</Link>
                <a href="#essayer" className="btn btn-ghost btn-lg">Voir la séquence en direct</a>
              </div>
              <ul className="mk-ticks">
                <li>14 jours gratuits, sans carte bancaire</li>
                <li>Prêt en 5 minutes avec l’assistant</li>
                <li>Aucun abonnement : 199 € une seule fois</li>
              </ul>
            </div>
            <div className="mk-hero-visual" aria-hidden="true">
              <div className="mock">
                <div className="mock-bar"><i /><i /><i /><span>RelanceAuto · Contacts</span></div>
                <div className="mock-body">
                  <div className="mock-lead">
                    <div className="av">CM</div>
                    <div><strong>Camille Martin</strong><small>Formulaire de contact · il y a 2 min</small></div>
                    <span className="chip active">Relance en cours</span>
                  </div>
                  <ol className="mock-tl">
                    <li className="done"><span className="dot"><Icon d={I.check} /></span><div><strong>Réponse envoyée</strong><small>Il y a 2 minutes · depuis sophie@cabinet.fr</small></div></li>
                    <li><span className="dot" /><div><strong>Relance douce</strong><small>Dans 2 jours · à 10 h 00</small></div></li>
                    <li><span className="dot" /><div><strong>Dernière relance</strong><small>Dans 5 jours · à 10 h 00</small></div></li>
                  </ol>
                  <div className="mock-note"><Icon d={I.stop} /> Dès qu’un rendez-vous est pris, tout s’arrête.</div>
                </div>
              </div>
              <div className="mock-float"><Icon d={I.check} /> Rendez-vous pris · relances arrêtées</div>
            </div>
          </div>
        </section>

        <section className="mk-strip">
          <div className="mk-wrap">
            <p>Compatible avec <strong>Gmail</strong>, <strong>Outlook</strong>, <strong>OVH</strong>, <strong>IONOS</strong>, <strong>Yahoo</strong>, <strong>iCloud</strong>, <strong>Zoho</strong> · Webhooks <strong>Cal.com</strong> et <strong>Calendly</strong> · Base de données en Europe</p>
          </div>
        </section>

        <section className="mk-section" id="probleme">
          <div className="mk-wrap two">
            <div>
              <p className="eyebrow">Le problème</p>
              <h2>Vous perdez des clients sans le voir</h2>
              <p className="prose">Vous êtes en séance toute la journée. Entre deux rendez-vous, quelqu’un vous écrit. Vous répondez le soir, ou le lendemain. Entre-temps, la personne a pris rendez-vous ailleurs.</p>
              <p className="prose">Et celles à qui vous ne répondez pas du tout ? Elles s’éloignent en silence. Ce n’est pas un manque d’intérêt : personne ne les a accompagnées jusqu’à la prise de rendez-vous.</p>
              <p className="prose"><strong>Estimez ce que cela vous coûte</strong> avec vos propres chiffres : les hypothèses sont modifiables, aucune n’est une promesse.</p>
            </div>
            <Calculator />
          </div>
        </section>

        <section className="mk-section alt" id="fonctionnement">
          <div className="mk-wrap">
            <p className="eyebrow">Fonctionnement</p>
            <h2>De la demande au rendez-vous, sans y penser</h2>
            <ol className="steps4">
              {STEPS.map((s) => (
                <li key={s.n}><span className="n">{s.n}</span><h3>{s.title}</h3><p>{s.text}</p></li>
              ))}
            </ol>
          </div>
        </section>

        <section className="mk-section" id="fonctionnalites">
          <div className="mk-wrap">
            <p className="eyebrow">Fonctionnalités</p>
            <h2>Tout ce qu’il faut, rien de superflu</h2>
            <div className="feat-grid">
              {FEATURES.map((f) => (
                <article className="feat" key={f.title}>
                  <span className="feat-ico"><Icon d={f.icon} /></span>
                  <h3>{f.title}</h3>
                  <p>{f.text}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="mk-section alt" id="essayer">
          <div className="mk-wrap">
            <p className="eyebrow">Essayez-le</p>
            <h2>Voyez la séquence que recevrait votre prospect</h2>
            <p className="prose narrow">Renseignez quelques informations : les trois messages se génèrent sous vos yeux. Dans l’application, vous choisissez parmi six modèles et vous adaptez chaque mot.</p>
            <SequenceDemo />
          </div>
        </section>

        <section className="mk-section">
          <div className="mk-wrap">
            <p className="eyebrow">Avant / après</p>
            <h2>Ce qui change dans votre semaine</h2>
            <div className="compare">
              <div className="card">
                <h3>Sans RelanceAuto</h3>
                <ul className="cross">
                  <li>Vous répondez quand vous avez un moment, parfois le lendemain</li>
                  <li>Les relances dépendent de votre mémoire et de votre énergie</li>
                  <li>Vous ne savez pas combien de demandes ne débouchent sur rien</li>
                  <li>Vous relancez parfois quelqu’un qui a déjà réservé</li>
                </ul>
              </div>
              <div className="card good">
                <h3>Avec RelanceAuto</h3>
                <ul className="tick">
                  <li>Réponse en moins de cinq minutes, à toute heure raisonnable</li>
                  <li>Deux relances programmées, dans votre ton</li>
                  <li>Entonnoir et boîte d’envoi : vous voyez tout</li>
                  <li>Arrêt automatique au rendez-vous ou à la réponse</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        <section className="mk-section alt" id="tarif">
          <div className="mk-wrap">
            <p className="eyebrow center">Tarif</p>
            <h2 className="center">Simple. Une seule fois.</h2>
            <div className="pricing">
              <article className="card plan">
                <h3>Essai gratuit</h3>
                <p className="price">0 €<span> 14 jours</span></p>
                <ul className="tick">
                  <li>Assistant de configuration guidé</li>
                  <li>Mode simulation avec voyage dans le temps</li>
                  <li>10 contacts · 30 emails réels</li>
                  <li>Modèles, formulaire, statistiques</li>
                </ul>
                <Link href={cta.href} className="btn btn-ghost btn-block">{cta.label}</Link>
              </article>
              <article className="card plan featured">
                <span className="badge">Le plus choisi</span>
                <h3>Illimité</h3>
                <p className="price">199 €<span> une seule fois</span></p>
                <ul className="tick">
                  <li>Contacts et envois réels illimités</li>
                  <li>Séquences jusqu’à 5 messages</li>
                  <li>Toutes les fonctionnalités de l’essai</li>
                  <li>Aucun abonnement, aucun frais caché</li>
                  <li>Support par email pendant 30 jours</li>
                </ul>
                <Link href={ctx ? '/dashboard/upgrade' : '/signup'} className="btn btn-primary btn-block">{ctx ? 'Passer en illimité' : 'Commencer par l’essai gratuit'}</Link>
                <p className="tl-meta center">Vous ne payez qu’une fois l’essai concluant.</p>
              </article>
            </div>
          </div>
        </section>

        <section className="mk-section" id="faq">
          <div className="mk-wrap narrow-wrap">
            <p className="eyebrow">Questions fréquentes</p>
            <h2>Avant de vous lancer</h2>
            <div className="faq">
              {FAQ.map(([q, a]) => (
                <details key={q}><summary>{q}</summary><p>{a}</p></details>
              ))}
            </div>
          </div>
        </section>

        <section className="mk-final">
          <div className="mk-wrap">
            <h2>Prêt à ne plus laisser une demande sans réponse ?</h2>
            <p>Créez votre compte, suivez l’assistant, et regardez votre première séquence tourner dans cinq minutes.</p>
            <Link href={cta.href} className="btn btn-white btn-lg">{cta.label}</Link>
            <small>14 jours gratuits · sans carte bancaire</small>
          </div>
        </section>
      </main>

      <footer className="mk-foot">
        <div className="mk-wrap foot-in">
          <div>
            <Link href="/" className="mk-logo"><BrandMark /> RelanceAuto</Link>
            <p>Réponses et relances automatiques pour coachs et thérapeutes. Conçu et maintenu par Victor Francis Itoua Mveng, développeur indépendant.</p>
          </div>
          <nav aria-label="Informations légales">
            <Link href="/mentions-legales">Mentions légales</Link>
            <Link href="/confidentialite">Confidentialité</Link>
            <Link href="/cgu">Conditions d’utilisation</Link>
            <a href="mailto:francisitoua05@gmail.com">Contact</a>
          </nav>
        </div>
      </footer>
    </div>
  );
}
