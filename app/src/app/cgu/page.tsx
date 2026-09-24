import { LegalLayout } from '../LegalLayout';

export const metadata = { title: 'Conditions d’utilisation' };

export default function Page() {
  return (
    <LegalLayout title="Conditions d’utilisation" updated="25 septembre 2026">
      <h2>Objet</h2>
      <p>RelanceAuto permet d’envoyer automatiquement une réponse puis des relances aux personnes qui vous ont contacté, et d’arrêter ces relances lorsqu’elles réservent ou répondent.</p>
      <h2>Essai gratuit et offre illimitée</h2>
      <p>L’essai dure 14 jours, sans carte bancaire, dans la limite de 10 contacts et 30 emails réels. L’offre illimitée est un paiement unique de 199 € TTC, sans abonnement ni reconduction. Elle est activée sur votre compte après réception du paiement.</p>
      <h2>Utilisation responsable</h2>
      <p>Vous vous engagez à ne contacter que des personnes qui vous ont sollicité ou qui ont consenti à être recontactées, à ne pas envoyer de messages trompeurs, illicites ou de prospection non sollicitée, et à respecter la demande de désinscription de toute personne. Un compte utilisé pour du spam peut être suspendu.</p>
      <h2>Vos données</h2>
      <p>Vous restez propriétaire de vos contacts et de vos messages. Vous pouvez les exporter et supprimer votre compte à tout moment (voir la politique de confidentialité).</p>
      <h2>Disponibilité et responsabilité</h2>
      <p>Le service est fourni « en l’état », sans garantie de résultat commercial : les hypothèses affichées par le calculateur sont des estimations. La responsabilité de l’éditeur est limitée au montant payé pour le service.</p>
      <h2>Contact</h2>
      <p><a href="mailto:francisitoua05@gmail.com">francisitoua05@gmail.com</a></p>
    </LegalLayout>
  );
}
