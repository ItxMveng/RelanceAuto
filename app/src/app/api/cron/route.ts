import { tickAll } from '@/lib/engine';
import { fail, ok } from '@/lib/http';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

/** Envoie les relances arrivées à échéance. Idempotent : peut être appelé aussi souvent que voulu. */
export async function GET(req: Request) {
  const expected = process.env.CRON_SECRET;
  if (expected && req.headers.get('authorization') !== `Bearer ${expected}`) return fail('Non autorisé', 401);
  const result = await tickAll();
  return ok(result);
}
