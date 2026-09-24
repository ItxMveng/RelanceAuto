export type Tone = 'warm' | 'pro';
export type Step = { delayDays: number; subject: string; body: string };
export type Vars = { prenom: string; mon_prenom: string; activite: string; lien: string };

export const VARIABLES: Array<{ key: keyof Vars; label: string }> = [
  { key: 'prenom', label: 'Prénom du prospect' },
  { key: 'mon_prenom', label: 'Votre prénom' },
  { key: 'activite', label: 'Votre activité' },
  { key: 'lien', label: 'Lien de réservation' },
];

export const ACTIVITIES: Array<{ value: string; label: string }> = [
  { value: 'en coaching de vie', label: 'Coaching de vie' },
  { value: 'en coaching business', label: 'Coaching business' },
  { value: 'en thérapie', label: 'Thérapie' },
  { value: 'en sophrologie', label: 'Sophrologie' },
  { value: 'en hypnothérapie', label: 'Hypnothérapie' },
  { value: 'en accompagnement bien-être', label: 'Bien-être' },
];

export function defaultSteps(tone: Tone): Step[] {
  if (tone === 'pro') {
    return [
      {
        delayDays: 0,
        subject: 'Votre message — {{mon_prenom}}',
        body:
          'Bonjour {{prenom}},\n\nMerci pour votre message. Je suis en séance et je reviens vers vous très vite ; en attendant, vous pouvez réserver directement un échange {{activite}} ici : {{lien}}\n\nCordialement,\n{{mon_prenom}}',
      },
      {
        delayDays: 2,
        subject: 'Suite à mon message',
        body:
          'Bonjour {{prenom}},\n\nJe reviens vers vous au sujet de mon message précédent. Si vous souhaitez un échange, le lien de réservation est ici : {{lien}}\n\nCordialement,\n{{mon_prenom}}',
      },
      {
        delayDays: 5,
        subject: 'Dernier message',
        body:
          'Bonjour {{prenom}},\n\nCeci est mon dernier message. Si un accompagnement {{activite}} vous intéresse à l’avenir, vous pouvez réserver à tout moment : {{lien}}\n\nCordialement,\n{{mon_prenom}}',
      },
    ];
  }
  return [
    {
      delayDays: 0,
      subject: 'Votre message — {{mon_prenom}}',
      body:
        'Bonjour {{prenom}},\n\nMerci pour votre message : faire le premier pas n’est jamais anodin, et je suis touché(e) de votre confiance. Je suis en séance une grande partie de la journée, mais je tenais à vous répondre tout de suite.\n\nPour échanger sur ce que vous cherchez {{activite}}, le plus simple est de choisir le créneau qui vous convient ici : {{lien}}\n\nÀ très vite,\n{{mon_prenom}}',
    },
    {
      delayDays: 2,
      subject: 'Un petit mot pour vous',
      body:
        'Bonjour {{prenom}},\n\nJe me permets un petit mot pour m’assurer que mon message précédent vous est bien parvenu. Si le moment n’est pas idéal, aucun souci, prenez le temps qu’il vous faut.\n\nSi vous souhaitez avancer, vous pouvez réserver ici : {{lien}}\n\nBelle journée,\n{{mon_prenom}}',
    },
    {
      delayDays: 5,
      subject: 'Ma porte reste ouverte',
      body:
        'Bonjour {{prenom}},\n\nCe sera mon dernier message : je ne voudrais surtout pas vous importuner. Si un accompagnement {{activite}} vous fait toujours envie, ma porte reste ouverte, quand vous le souhaitez : {{lien}}\n\nPrenez soin de vous,\n{{mon_prenom}}',
    },
  ];
}

export function render(template: string, vars: Vars): string {
  return template.replace(/\{\{\s*(\w+)\s*\}\}/g, (match, key: string) => {
    const v = (vars as Record<string, string>)[key];
    return v === undefined ? match : v;
  });
}

export function firstName(fullName: string): string {
  const trimmed = fullName.trim();
  return trimmed.split(/\s+/)[0] || trimmed;
}

/** Normalise et borne les étapes reçues (édition utilisateur). */
export function sanitizeSteps(input: unknown): Step[] | null {
  if (!Array.isArray(input) || input.length < 1 || input.length > 5) return null;
  const out: Step[] = [];
  for (let i = 0; i < input.length; i++) {
    const s = input[i] as Partial<Step>;
    const subject = typeof s.subject === 'string' ? s.subject.trim() : '';
    const body = typeof s.body === 'string' ? s.body.trim() : '';
    const delay = Number(s.delayDays);
    if (!subject || !body || subject.length > 200 || body.length > 5000) return null;
    if (!Number.isFinite(delay) || delay < 0 || delay > 60) return null;
    out.push({ delayDays: i === 0 ? 0 : Math.round(delay), subject, body });
  }
  for (let i = 1; i < out.length; i++) {
    if (out[i].delayDays <= out[i - 1].delayDays) return null;
  }
  return out;
}

export function isPrivateHost(host: string): boolean {
  const h = host.trim().toLowerCase();
  if (!h || h === 'localhost' || h.endsWith('.local') || h.endsWith('.internal')) return true;
  if (/^(127\.|10\.|192\.168\.|169\.254\.|0\.)/.test(h)) return true;
  if (/^172\.(1[6-9]|2\d|3[01])\./.test(h)) return true;
  if (h === '::1' || h.startsWith('fc') || h.startsWith('fd') || h.startsWith('fe80')) return true;
  return false;
}
