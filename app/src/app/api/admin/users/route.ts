import { sql } from '@/lib/db';
import { isAdmin } from '@/lib/admin';
import { fail, guard, isResponse, ok, readJson } from '@/lib/http';

export const dynamic = 'force-dynamic';

/** Administration : passer un compte en illimité ou prolonger l'essai (après paiement confirmé). */
export async function POST(req: Request) {
  const ctx = await guard(req);
  if (isResponse(ctx)) return ctx;
  if (!isAdmin(ctx)) return fail('Accès refusé', 403);
  const b = await readJson(req);
  const id = String(b.accountId ?? '');
  if (!/^[0-9a-f-]{36}$/i.test(id)) return fail('Compte invalide');

  if (b.action === 'pro') await sql(`update accounts set plan = 'pro' where id = $1`, [id]);
  else if (b.action === 'trial') await sql(`update accounts set plan = 'trial' where id = $1`, [id]);
  else if (b.action === 'extend') await sql(`update accounts set trial_ends_at = greatest(trial_ends_at, now()) + interval '7 days' where id = $1`, [id]);
  else return fail('Action invalide');
  return ok();
}
