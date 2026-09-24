export type Provider = {
  id: string;
  name: string;
  host: string;
  port: number;
  needsAppPassword: boolean;
  help: string;
  helpUrl?: string;
};

/** Préréglages SMTP : l'utilisateur ne saisit que son adresse et un mot de passe. */
export const PROVIDERS: Provider[] = [
  {
    id: 'gmail',
    name: 'Gmail / Google Workspace',
    host: 'smtp.gmail.com',
    port: 465,
    needsAppPassword: true,
    help: 'Activez la validation en deux étapes, puis créez un « mot de passe d’application » (16 caractères). C’est lui qu’il faut coller ici, pas votre mot de passe habituel.',
    helpUrl: 'https://myaccount.google.com/apppasswords',
  },
  {
    id: 'outlook',
    name: 'Outlook / Microsoft 365',
    host: 'smtp.office365.com',
    port: 587,
    needsAppPassword: true,
    help: 'Activez la validation en deux étapes puis créez un mot de passe d’application dans « Sécurité » de votre compte Microsoft. Sur Microsoft 365, l’envoi SMTP authentifié doit être autorisé par votre administrateur.',
    helpUrl: 'https://account.microsoft.com/security',
  },
  {
    id: 'ovh',
    name: 'OVH (email pro / MX Plan)',
    host: 'ssl0.ovh.net',
    port: 465,
    needsAppPassword: false,
    help: 'Utilisez l’adresse complète et le mot de passe de votre boîte OVH.',
  },
  {
    id: 'ionos',
    name: 'IONOS (1&1)',
    host: 'smtp.ionos.fr',
    port: 465,
    needsAppPassword: false,
    help: 'Utilisez l’adresse complète et le mot de passe de votre boîte IONOS.',
  },
  {
    id: 'infomaniak',
    name: 'Infomaniak',
    host: 'mail.infomaniak.com',
    port: 465,
    needsAppPassword: false,
    help: 'Utilisez l’adresse complète et le mot de passe de votre boîte Infomaniak.',
  },
  {
    id: 'zoho',
    name: 'Zoho Mail',
    host: 'smtp.zoho.eu',
    port: 465,
    needsAppPassword: true,
    help: 'Si la double authentification est active, créez un mot de passe d’application dans les paramètres de sécurité Zoho.',
    helpUrl: 'https://accounts.zoho.eu/home#security/app_password',
  },
  {
    id: 'yahoo',
    name: 'Yahoo Mail',
    host: 'smtp.mail.yahoo.com',
    port: 465,
    needsAppPassword: true,
    help: 'Générez un mot de passe d’application dans « Sécurité du compte » de Yahoo.',
    helpUrl: 'https://login.yahoo.com/account/security',
  },
  {
    id: 'icloud',
    name: 'iCloud Mail',
    host: 'smtp.mail.me.com',
    port: 587,
    needsAppPassword: true,
    help: 'Créez un mot de passe pour application sur appleid.apple.com (Connexion et sécurité).',
    helpUrl: 'https://appleid.apple.com/',
  },
  {
    id: 'orange',
    name: 'Orange',
    host: 'smtp.orange.fr',
    port: 465,
    needsAppPassword: false,
    help: 'Utilisez votre adresse Orange complète et son mot de passe.',
  },
  {
    id: 'other',
    name: 'Autre fournisseur',
    host: '',
    port: 465,
    needsAppPassword: false,
    help: 'Renseignez le serveur SMTP et le port indiqués par votre fournisseur (souvent 465 ou 587).',
  },
];

export function providerById(id: string): Provider | undefined {
  return PROVIDERS.find((p) => p.id === id);
}

export function guessProviderFromEmail(email: string): string {
  const domain = email.split('@')[1]?.toLowerCase() ?? '';
  if (/^(gmail|googlemail)\./.test(domain)) return 'gmail';
  if (/^(outlook|hotmail|live|msn)\./.test(domain)) return 'outlook';
  if (/^(yahoo|ymail)\./.test(domain)) return 'yahoo';
  if (/^(icloud|me|mac)\./.test(domain)) return 'icloud';
  if (/^orange\./.test(domain)) return 'orange';
  if (/^zoho\./.test(domain)) return 'zoho';
  return 'other';
}

/** Traduit une erreur technique SMTP en conseil actionnable. */
export function humanizeSmtpError(err: unknown): string {
  const e = err as { code?: string; responseCode?: number; message?: string };
  const msg = String(e?.message ?? '');
  if (e?.code === 'EAUTH' || e?.responseCode === 535 || /invalid login|authentication|auth/i.test(msg)) {
    return 'Identifiant ou mot de passe refusé. Avec Gmail, Outlook, Yahoo ou iCloud, il faut un mot de passe d’application (pas votre mot de passe habituel).';
  }
  if (e?.code === 'ENOTFOUND' || e?.code === 'EDNS') return 'Serveur introuvable : vérifiez le nom du serveur SMTP.';
  if (e?.code === 'ETIMEDOUT' || e?.code === 'ECONNECTION' || e?.code === 'ESOCKET' || e?.code === 'ECONNREFUSED') {
    return 'Connexion impossible : vérifiez le serveur et le port (465 avec SSL, ou 587).';
  }
  if (/self[- ]signed|certificate|tls|ssl/i.test(msg)) return 'Erreur de sécurité (certificat TLS) : essayez l’autre port (465 ou 587).';
  return `Échec de la connexion : ${msg.slice(0, 160) || 'erreur inconnue'}`;
}
