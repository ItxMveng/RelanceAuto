import nodemailer from 'nodemailer';
import type { Row } from './db';
import { decrypt } from './crypto';
import { isPrivateHost } from './templates';

export function smtpConfigured(account: Row): boolean {
  return Boolean(account.smtp_host && account.smtp_port && account.smtp_user && account.smtp_pass_enc);
}

/** Les hôtes privés sont refusés (SSRF) ; l'exception n'existe que pour les tests avec un serveur SMTP local. */
function hostAllowed(host: string): boolean {
  return process.env.ALLOW_PRIVATE_SMTP === '1' || !isPrivateHost(host);
}

export type SmtpSettings = { host: string; port: number; user: string; pass: string };

export function buildTransporter(s: SmtpSettings) {
  if (!hostAllowed(s.host)) throw new Error('Hôte SMTP non autorisé');
  const local = process.env.ALLOW_PRIVATE_SMTP === '1' && isPrivateHost(s.host);
  return nodemailer.createTransport({
    host: s.host,
    port: s.port,
    secure: s.port === 465,
    requireTLS: !local && s.port !== 465,
    ignoreTLS: local,
    auth: { user: s.user, pass: s.pass },
    connectionTimeout: 10_000,
    greetingTimeout: 10_000,
    socketTimeout: 15_000,
  });
}

export function transporterFor(account: Row) {
  if (!smtpConfigured(account)) throw new Error('SMTP non configuré');
  return buildTransporter({ host: account.smtp_host, port: account.smtp_port, user: account.smtp_user, pass: decrypt(account.smtp_pass_enc) });
}

/** Vérifie la connexion et l'authentification sans envoyer d'email. */
export async function verifySmtp(s: SmtpSettings): Promise<void> {
  await buildTransporter(s).verify();
}

export async function sendMail(account: Row, opts: { to: string; subject: string; text: string; unsubscribeUrl?: string }) {
  const transporter = transporterFor(account);
  const from = account.smtp_from || account.smtp_user;
  await transporter.sendMail({
    from,
    to: opts.to,
    replyTo: from,
    subject: opts.subject,
    text: opts.text,
    headers: opts.unsubscribeUrl ? { 'List-Unsubscribe': `<${opts.unsubscribeUrl}>` } : undefined,
  });
}
