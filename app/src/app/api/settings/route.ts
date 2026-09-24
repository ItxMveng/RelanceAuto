import { z } from 'zod';
import { sql } from '@/lib/db';
import { encrypt } from '@/lib/crypto';
import { fail, guard, isResponse, ok, readJson } from '@/lib/http';
import { isPrivateHost } from '@/lib/templates';

export const dynamic = 'force-dynamic';

const schema = z.object({
  my_name: z.string().trim().max(60),
  activity: z.string().trim().max(80),
  booking_link: z.string().trim().max(300).refine((v) => v === '' || /^https?:\/\//i.test(v), 'Le lien doit commencer par https://'),
  tone: z.enum(['warm', 'pro']),
  send_mode: z.enum(['simulation', 'smtp']),
  smtp_host: z.string().trim().max(200).optional(),
  smtp_port: z.coerce.number().int().min(1).max(65535).optional(),
  smtp_user: z.string().trim().max(200).optional(),
  smtp_pass: z.string().max(300).optional(),
  smtp_from: z.string().trim().max(200).optional(),
});

export async function PUT(req: Request) {
  const ctx = await guard(req);
  if (isResponse(ctx)) return ctx;
  const parsed = schema.safeParse(await readJson(req));
  if (!parsed.success) return fail(parsed.error.issues[0]?.message ?? 'Données invalides');
  const d = parsed.data;
  const a = ctx.account;

  const host = d.smtp_host || a.smtp_host || null;
  const port = d.smtp_port ?? a.smtp_port ?? null;
  const user = d.smtp_user || a.smtp_user || null;
  const passEnc = d.smtp_pass ? encrypt(d.smtp_pass) : a.smtp_pass_enc ?? null;
  const from = d.smtp_from || a.smtp_from || null;

  if (host && isPrivateHost(host)) return fail('Hôte SMTP non autorisé.');
  if (d.send_mode === 'smtp' && !(host && port && user && passEnc)) return fail('Renseignez l’hôte, le port, l’identifiant et le mot de passe SMTP pour activer l’envoi réel.');
  if (d.send_mode === 'smtp' && !d.booking_link) return fail('Ajoutez votre lien de réservation avant d’activer l’envoi réel.');

  await sql(
    `update accounts set my_name=$2, activity=$3, booking_link=$4, tone=$5, send_mode=$6,
       smtp_host=$7, smtp_port=$8, smtp_user=$9, smtp_pass_enc=$10, smtp_from=$11,
       sim_offset_minutes = case when $6 = 'smtp' then 0 else sim_offset_minutes end
     where id = $1`,
    [a.id, d.my_name, d.activity, d.booking_link, d.tone, d.send_mode, host, port, user, passEnc, from],
  );
  return ok();
}
