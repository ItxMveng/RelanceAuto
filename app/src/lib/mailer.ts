import nodemailer from 'nodemailer';
import type { Row } from './db';
import { decrypt } from './crypto';
import { isPrivateHost } from './templates';

export function smtpConfigured(account: Row): boolean {
  return Boolean(account.smtp_host && account.smtp_port && account.smtp_user && account.smtp_pass_enc);
}

export function transporterFor(account: Row) {
  if (!smtpConfigured(account)) throw new Error('SMTP non configuré');
  if (isPrivateHost(account.smtp_host)) throw new Error('Hôte SMTP non autorisé');
  return nodemailer.createTransport({
    host: account.smtp_host,
    port: account.smtp_port,
    secure: account.smtp_port === 465,
    auth: { user: account.smtp_user, pass: decrypt(account.smtp_pass_enc) },
    connectionTimeout: 10_000,
    greetingTimeout: 10_000,
    socketTimeout: 15_000,
  });
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
    headers: opts.unsubscribeUrl
      ? { 'List-Unsubscribe': `<${opts.unsubscribeUrl}>` }
      : undefined,
  });
}
