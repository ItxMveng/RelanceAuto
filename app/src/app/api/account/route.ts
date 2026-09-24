import { z } from 'zod';
import { sql } from '@/lib/db';
import { checkPassword, endSession, hashPassword } from '@/lib/auth';
import { fail, guard, isResponse, ok, readJson } from '@/lib/http';
import { allow } from '@/lib/ratelimit';

export const dynamic = 'force-dynamic';

const pwSchema = z.object({ current: z.string().min(1).max(200), next: z.string().min(8, 'Nouveau mot de passe : 8 caractères minimum').max(200) });

export async function PATCH(req: Request) {
  const ctx = await guard(req);
  if (isResponse(ctx)) return ctx;
  if (!(await allow(`pw:${ctx.user.id}`, 8, 900))) return fail('Trop d’essais, réessayez plus tard.', 429);
  const parsed = pwSchema.safeParse(await readJson(req));
  if (!parsed.success) return fail(parsed.error.issues[0]?.message ?? 'Données invalides');
  const rows = await sql<{ password_hash: string }>('select password_hash from users where id = $1', [ctx.user.id]);
  if (!rows[0] || !(await checkPassword(parsed.data.current, rows[0].password_hash))) return fail('Mot de passe actuel incorrect', 401);
  await sql('update users set password_hash = $2 where id = $1', [ctx.user.id, await hashPassword(parsed.data.next)]);
  return ok();
}

/** Suppression définitive du compte et de toutes les données associées (droit à l'effacement). */
export async function DELETE(req: Request) {
  const ctx = await guard(req);
  if (isResponse(ctx)) return ctx;
  if (!(await allow(`delacc:${ctx.user.id}`, 5, 900))) return fail('Trop d’essais, réessayez plus tard.', 429);
  const password = String((await readJson(req)).password ?? '');
  const rows = await sql<{ password_hash: string }>('select password_hash from users where id = $1', [ctx.user.id]);
  if (!rows[0] || !(await checkPassword(password, rows[0].password_hash))) return fail('Mot de passe incorrect', 401);
  await sql('delete from users where id = $1', [ctx.user.id]); // cascade : compte, contacts, messages
  endSession();
  return ok();
}
