import { allow } from '@/lib/ratelimit';
import { fail, guard, isResponse, ok } from '@/lib/http';
import { sendMail, smtpConfigured } from '@/lib/mailer';
import { humanizeSmtpError } from '@/lib/providers';

export const dynamic = 'force-dynamic';
export const maxDuration = 30;

/** Envoie un email de test à l'adresse du compte (jamais à un tiers). */
export async function POST(req: Request) {
  const ctx = await guard(req);
  if (isResponse(ctx)) return ctx;
  if (!smtpConfigured(ctx.account)) return fail('Connectez d’abord votre boîte email.');
  if (!(await allow(`smtptest:${ctx.user.id}`, 5, 600))) return fail('Trop d’essais, patientez quelques minutes.', 429);
  try {
    await sendMail(ctx.account, {
      to: ctx.user.email,
      subject: 'Test RelanceAuto — votre envoi fonctionne',
      text: 'Ce message confirme que RelanceAuto envoie bien vos emails depuis votre adresse.',
    });
    return ok({ to: ctx.user.email });
  } catch (e) {
    return fail(humanizeSmtpError(e));
  }
}
