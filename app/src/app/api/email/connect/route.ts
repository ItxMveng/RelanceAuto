import { z } from 'zod';
import { sql } from '@/lib/db';
import { encrypt, decrypt } from '@/lib/crypto';
import { fail, guard, isResponse, ok, readJson } from '@/lib/http';
import { humanizeSmtpError } from '@/lib/providers';
import { sendMail, verifySmtp } from '@/lib/mailer';
import { allow } from '@/lib/ratelimit';
import { isPrivateHost } from '@/lib/templates';

export const dynamic = 'force-dynamic';
export const maxDuration = 30;

const schema = z.object({
  host: z.string().trim().min(3).max(200),
  port: z.coerce.number().int().min(1).max(65535),
  user: z.string().trim().min(3).max(200),
  pass: z.string().max(300).optional(),
  from: z.string().trim().max(200).optional(),
  sendTest: z.boolean().optional(),
});

/** Vérifie la connexion SMTP AVANT d'enregistrer ; n'active l'envoi réel que si la vérification réussit. */
export async function POST(req: Request) {
  const ctx = await guard(req);
  if (isResponse(ctx)) return ctx;
  if (!(await allow(`email-connect:${ctx.user.id}`, 12, 600))) return fail('Trop d’essais, patientez quelques minutes.', 429);

  const parsed = schema.safeParse(await readJson(req));
  if (!parsed.success) return fail('Renseignez le serveur, le port et l’adresse email.');
  const d = parsed.data;
  if (process.env.ALLOW_PRIVATE_SMTP !== '1' && isPrivateHost(d.host)) return fail('Hôte SMTP non autorisé.');

  let pass = d.pass;
  if (!pass) {
    if (!ctx.account.smtp_pass_enc) return fail('Collez le mot de passe (ou mot de passe d’application) de votre boîte email.');
    pass = decrypt(ctx.account.smtp_pass_enc);
  }
  if (!ctx.account.booking_link) return fail('Ajoutez d’abord votre lien de réservation (étape « Votre activité »).');

  try {
    await verifySmtp({ host: d.host, port: d.port, user: d.user, pass });
  } catch (e) {
    return fail(humanizeSmtpError(e));
  }

  await sql(
    `update accounts set smtp_host=$2, smtp_port=$3, smtp_user=$4, smtp_pass_enc=$5, smtp_from=$6, send_mode='smtp', sim_offset_minutes=0 where id=$1`,
    [ctx.account.id, d.host, d.port, d.user, encrypt(pass), d.from || null],
  );

  let testSent = false;
  let testError: string | undefined;
  if (d.sendTest) {
    try {
      const fresh = (await sql('select * from accounts where id = $1', [ctx.account.id]))[0];
      await sendMail(fresh, {
        to: ctx.user.email,
        subject: 'RelanceAuto est connecté à votre boîte email',
        text: 'Bonne nouvelle : RelanceAuto peut désormais envoyer vos réponses et vos relances depuis cette adresse.\n\nVos prospects verront votre nom et pourront répondre directement à ce message.\n\nRien d’autre à faire : ajoutez un contact ou partagez votre formulaire pour lancer votre première séquence.',
      });
      testSent = true;
    } catch (e) {
      testError = humanizeSmtpError(e);
    }
  }
  return ok({ verified: true, testSent, testError, sendTo: ctx.user.email });
}
