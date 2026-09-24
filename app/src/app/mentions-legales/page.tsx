import { LegalLayout } from '../LegalLayout';

export const metadata = { title: 'Mentions légales' };

export default function Page() {
  return (
    <LegalLayout title="Mentions légales" updated="25 septembre 2026">
      <h2>Éditeur du service</h2>
      <p>RelanceAuto est édité par Victor Francis Itoua Mveng, développeur indépendant.<br />Contact : <a href="mailto:francisitoua05@gmail.com">francisitoua05@gmail.com</a></p>
      <h2>Hébergement</h2>
      <p>Application : Vercel Inc., 440 N Barranca Ave #4133, Covina, CA 91723, États-Unis.<br />Base de données : Neon, hébergée en Europe (Francfort, Allemagne).</p>
      <h2>Propriété intellectuelle</h2>
      <p>Le code, les textes, les modèles de messages et l’identité graphique de RelanceAuto sont protégés. Les messages que vous rédigez et les contacts que vous saisissez restent votre propriété.</p>
      <h2>Responsabilité</h2>
      <p>RelanceAuto est un outil d’automatisation. Vous restez responsable du contenu de vos messages et du choix des personnes contactées. Nous nous efforçons d’assurer la disponibilité du service sans pouvoir garantir une absence totale d’interruption.</p>
    </LegalLayout>
  );
}
