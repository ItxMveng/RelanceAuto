import { allow } from '@/lib/ratelimit';
import { fail, guard, isResponse, ok } from '@/lib/http';
import { sendMail, smtpConfigured } from '@/lib/mailer';

export const dynamic = 'force-dynamic';

/** Envoie un email de test à l'adresse du compte (jamais à un tiers). */
export async function POST(req: Request) {
  const ctx = await guard(req);
  if (isResponse(ctx)) return ctx;
  if (!smtpConfigured(ctx.account)) return fail('Enregistrez d’abord vos paramètres SMTP.');
  if (!(await allow(`smtptest:${ctx.user.id}`, 5, 600))) return fail('Trop d’essais, patientez quelques minutes.', 429);
  try {
    await sendMail(ctx.account, {
      to: ctx.user.email,
      subject: 'Test RelanceAuto — votre envoi fonctionne',
      text: 'Ce message confirme que RelanceAuto peut envoyer des emails avec vos paramètres SMTP.\n\nVous pouvez activer l’envoi réel dans les réglages.',
    });
    return ok({ to: ctx.user.email });
  } catch (e) {
    return fail(`Échec de l’envoi : ${(e as Error).message.slice(0, 200)}`);
  }
}
