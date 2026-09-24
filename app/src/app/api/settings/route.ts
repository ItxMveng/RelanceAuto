import { z } from 'zod';
import { sql } from '@/lib/db';
import { fail, guard, isResponse, ok, readJson } from '@/lib/http';

export const dynamic = 'force-dynamic';

const schema = z
  .object({
    my_name: z.string().trim().max(60),
    activity: z.string().trim().max(80),
    booking_link: z.string().trim().max(300).refine((v) => v === '' || /^https?:\/\//i.test(v), 'Le lien doit commencer par https://'),
    tone: z.enum(['warm', 'pro']),
    send_from_hour: z.coerce.number().int().min(0).max(23),
    send_to_hour: z.coerce.number().int().min(1).max(24),
  })
  .refine((v) => v.send_from_hour < v.send_to_hour, 'La plage d’envoi doit avoir un début avant sa fin.');

export async function PUT(req: Request) {
  const ctx = await guard(req);
  if (isResponse(ctx)) return ctx;
  const parsed = schema.safeParse(await readJson(req));
  if (!parsed.success) return fail(parsed.error.issues[0]?.message ?? 'Données invalides');
  const d = parsed.data;
  await sql(
    `update accounts set my_name=$2, activity=$3, booking_link=$4, tone=$5, send_from_hour=$6, send_to_hour=$7 where id=$1`,
    [ctx.account.id, d.my_name, d.activity, d.booking_link, d.tone, d.send_from_hour, d.send_to_hour],
  );
  return ok();
}
