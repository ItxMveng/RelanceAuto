export const STATUS_LABEL: Record<string, string> = {
  active: 'Relance en cours',
  booked: 'RDV pris',
  completed: 'Séquence terminée',
  stopped: 'Arrêté',
  unsubscribed: 'Désinscrit',
};

export const MSG_LABEL: Record<string, string> = {
  scheduled: 'Planifié',
  sending: 'Envoi…',
  sent: 'Envoyé',
  failed: 'Échec',
  skipped: 'Annulé',
};

export function fmtDate(d: string | Date, offsetMin = 0): string {
  const date = new Date(new Date(d).getTime() - offsetMin * 60_000);
  return date.toLocaleString('fr-FR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit', timeZone: 'Europe/Paris' });
}
