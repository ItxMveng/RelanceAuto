import type { Step } from './templates';

export type LibraryEntry = {
  id: string;
  title: string;
  who: string;
  description: string;
  steps: Step[];
};

const S = (delayDays: number, subject: string, body: string): Step => ({ delayDays, subject, body });

/** Modèles prêts à l'emploi : à personnaliser, jamais à envoyer tels quels sans relecture. */
export const LIBRARY: LibraryEntry[] = [
  {
    id: 'coach-vie',
    title: 'Coach de vie — appel découverte',
    who: 'Coachs de vie, coachs de carrière',
    description: 'Réponse chaleureuse, relance courte à J+2, clôture bienveillante à J+5. Objectif : un appel découverte de 15 minutes.',
    steps: [
      S(0, 'Merci pour votre message, {{prenom}}', 'Bonjour {{prenom}},\n\nMerci pour votre message, et bravo d’avoir fait ce premier pas : c’est souvent le plus difficile.\n\nPour comprendre où vous en êtes et voir si je peux vous aider, je vous propose un échange de 15 minutes, sans engagement : {{lien}}\n\nÀ très vite,\n{{mon_prenom}}'),
      S(2, 'Avez-vous trouvé un créneau ?', 'Bonjour {{prenom}},\n\nJe reviens vers vous simplement pour m’assurer que mon message ne s’est pas perdu. Si un créneau vous convient, il est ici : {{lien}}\n\nSi le moment n’est pas le bon, dites-le-moi : je comprends tout à fait.\n\n{{mon_prenom}}'),
      S(5, 'Je clos mon suivi', 'Bonjour {{prenom}},\n\nJe ne veux pas vous relancer plus que de raison : ce sera donc mon dernier message. Si l’accompagnement {{activite}} vous parle toujours, ma porte reste ouverte : {{lien}}\n\nPrenez soin de vous,\n{{mon_prenom}}'),
    ],
  },
  {
    id: 'coach-business',
    title: 'Coach business — diagnostic offert',
    who: 'Coachs business, consultants indépendants',
    description: 'Ton direct et orienté résultat, avec une promesse claire dès le premier message.',
    steps: [
      S(0, 'Votre demande — prochaine étape', 'Bonjour {{prenom}},\n\nMerci pour votre demande. Pour vous répondre utilement, la meilleure suite est un diagnostic de 15 minutes : nous identifions votre priorité et je vous dis franchement si je peux vous aider.\n\nChoisissez un créneau : {{lien}}\n\nCordialement,\n{{mon_prenom}}'),
      S(2, 'Un créneau cette semaine ?', 'Bonjour {{prenom}},\n\nJe me permets de relancer : mes créneaux de diagnostic partent vite en fin de semaine. Voici le lien pour réserver : {{lien}}\n\n{{mon_prenom}}'),
      S(4, 'Dernière relance', 'Bonjour {{prenom}},\n\nDernier message de ma part pour ne pas encombrer votre boîte. Si le sujet reste d’actualité, réservez quand vous voulez : {{lien}}\n\nBonne continuation,\n{{mon_prenom}}'),
    ],
  },
  {
    id: 'therapeute',
    title: 'Thérapeute — première prise de contact',
    who: 'Psychothérapeutes, psychologues, praticiens de la relation d’aide',
    description: 'Ton sobre et rassurant, sans pression, qui respecte le rythme de la personne.',
    steps: [
      S(0, 'Suite à votre message', 'Bonjour {{prenom}},\n\nMerci de votre message et de votre confiance. Je suis en consultation une bonne partie de la journée, mais je tenais à vous répondre.\n\nSi vous le souhaitez, vous pouvez réserver un premier échange, sans engagement, à cette adresse : {{lien}}\n\nBien cordialement,\n{{mon_prenom}}'),
      S(3, 'Prenez le temps qu’il vous faut', 'Bonjour {{prenom}},\n\nJe ne voudrais pas vous mettre la pression : prenez le temps qu’il vous faut. Si vous souhaitez avancer, le lien pour réserver reste ici : {{lien}}\n\nBien cordialement,\n{{mon_prenom}}'),
      S(7, 'Ma porte reste ouverte', 'Bonjour {{prenom}},\n\nCe sera mon dernier message. Si vous décidez de vous faire accompagner, je serai là : {{lien}}\n\nPrenez soin de vous,\n{{mon_prenom}}'),
    ],
  },
  {
    id: 'sophrologue',
    title: 'Sophrologue — séance découverte',
    who: 'Sophrologues, praticiens du bien-être',
    description: 'Ton apaisant, invitation à une séance découverte.',
    steps: [
      S(0, 'Votre demande de séance', 'Bonjour {{prenom}},\n\nMerci pour votre message. Je vous propose une séance découverte pour voir ensemble si la sophrologie peut vous aider.\n\nVous pouvez choisir votre créneau ici : {{lien}}\n\nÀ bientôt,\n{{mon_prenom}}'),
      S(2, 'Un moment pour vous', 'Bonjour {{prenom}},\n\nUn petit mot pour vous rappeler que vous pouvez réserver votre séance découverte quand cela vous convient : {{lien}}\n\nBelle journée,\n{{mon_prenom}}'),
      S(5, 'Quand vous serez prêt(e)', 'Bonjour {{prenom}},\n\nJe termine ici mes relances. Quand vous serez prêt(e), je serai ravi(e) de vous accueillir : {{lien}}\n\nPrenez soin de vous,\n{{mon_prenom}}'),
    ],
  },
  {
    id: 'hypnotherapeute',
    title: 'Hypnothérapeute — premier rendez-vous',
    who: 'Hypnothérapeutes',
    description: 'Ton posé, orienté vers la prise de rendez-vous.',
    steps: [
      S(0, 'Merci {{prenom}}, voici la suite', 'Bonjour {{prenom}},\n\nMerci pour votre message. Le premier rendez-vous nous permet de faire le point sur votre demande et de voir si l’hypnose est adaptée.\n\nRéservez ici : {{lien}}\n\nCordialement,\n{{mon_prenom}}'),
      S(2, 'Votre rendez-vous', 'Bonjour {{prenom}},\n\nJe me permets de revenir vers vous : si vous souhaitez un rendez-vous, voici le lien : {{lien}}\n\nCordialement,\n{{mon_prenom}}'),
      S(6, 'Dernier message', 'Bonjour {{prenom}},\n\nDernier message de ma part. Si le sujet vous tient toujours à cœur, vous pouvez réserver à tout moment : {{lien}}\n\nBonne continuation,\n{{mon_prenom}}'),
    ],
  },
  {
    id: 'long',
    title: 'Séquence longue — 5 relances sur 3 semaines',
    who: 'Offres à cycle de décision plus long',
    description: 'Cinq messages espacés pour les prospects qui réfléchissent longtemps, avec une sortie polie.',
    steps: [
      S(0, 'Merci pour votre message', 'Bonjour {{prenom}},\n\nMerci pour votre message. Pour échanger tranquillement sur votre besoin {{activite}}, vous pouvez réserver un créneau ici : {{lien}}\n\n{{mon_prenom}}'),
      S(2, 'Un petit mot', 'Bonjour {{prenom}},\n\nJe reviens vers vous au cas où mon message se serait perdu. Le lien de réservation : {{lien}}\n\n{{mon_prenom}}'),
      S(6, 'Une question ?', 'Bonjour {{prenom}},\n\nAvez-vous une question avant de réserver ? Répondez simplement à cet email, je vous réponds personnellement. Sinon, le lien est toujours là : {{lien}}\n\n{{mon_prenom}}'),
      S(12, 'Où en êtes-vous ?', 'Bonjour {{prenom}},\n\nJe prends de vos nouvelles : votre projet a-t-il avancé ? Si je peux vous aider, réservez un échange : {{lien}}\n\n{{mon_prenom}}'),
      S(20, 'Je clos mon suivi', 'Bonjour {{prenom}},\n\nJe clos mon suivi pour ne pas vous solliciter davantage. Si le besoin revient, ma porte reste ouverte : {{lien}}\n\nBien à vous,\n{{mon_prenom}}'),
    ],
  },
];
