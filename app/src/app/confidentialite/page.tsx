import { LegalLayout } from '../LegalLayout';

export const metadata = { title: 'Politique de confidentialité' };

export default function Page() {
  return (
    <LegalLayout title="Politique de confidentialité" updated="25 septembre 2026">
      <h2>Qui est responsable de quelles données ?</h2>
      <p>Pour les données de votre compte (email, mot de passe haché, réglages), l’éditeur de RelanceAuto est responsable de traitement. Pour les données de vos prospects que vous saisissez ou recevez via votre formulaire (nom, email, message), <strong>vous</strong> êtes responsable de traitement et RelanceAuto agit comme sous-traitant.</p>
      <h2>Données traitées</h2>
      <ul>
        <li>Compte : adresse email, mot de passe (haché avec bcrypt), réglages, lien de réservation.</li>
        <li>Contacts : nom, email, message, statut de suivi, notes, historique des messages envoyés.</li>
        <li>Identifiants SMTP de votre boîte email, si vous activez l’envoi réel : le mot de passe est chiffré (AES-256-GCM) et supprimé dès que vous déconnectez votre boîte.</li>
        <li>Données techniques minimales : adresse IP, uniquement pour limiter les abus (durée courte).</li>
      </ul>
      <h2>Finalités et base légale</h2>
      <p>Fournir le service (exécution du contrat), sécuriser les comptes et prévenir les abus (intérêt légitime). Aucune donnée n’est vendue, ni utilisée à des fins publicitaires.</p>
      <h2>Durée de conservation</h2>
      <p>Les données sont conservées tant que votre compte existe. La suppression du compte efface immédiatement et définitivement le compte, les contacts et les messages.</p>
      <h2>Vos droits</h2>
      <p>Depuis « Réglages », vous pouvez exporter vos contacts (CSV), modifier vos informations et supprimer votre compte. Chaque prospect peut se désinscrire via le lien présent dans chaque email. Pour toute autre demande : <a href="mailto:francisitoua05@gmail.com">francisitoua05@gmail.com</a>. Vous pouvez aussi saisir la CNIL.</p>
      <h2>Sous-traitants</h2>
      <p>Vercel (hébergement de l’application) et Neon (base de données, Europe). Vos emails sont envoyés par le serveur de votre propre fournisseur de messagerie.</p>
      <h2>Cookies</h2>
      <p>Un seul cookie, strictement nécessaire : la session de connexion. Aucun traceur publicitaire ou d’analyse.</p>
    </LegalLayout>
  );
}
