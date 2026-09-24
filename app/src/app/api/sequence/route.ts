import { sql } from '@/lib/db';
import { fail, guard, isResponse, ok, readJson } from '@/lib/http';
import { sanitizeSteps } from '@/lib/templates';

export const dynamic = 'force-dynamic';

export async function PUT(req: Request) {
  const ctx = await guard(req);
  if (isResponse(ctx)) return ctx;
  const steps = sanitizeSteps((await readJson(req)).steps);
  if (!steps) return fail('Séquence invalide : objet et message requis, délais croissants (0 à 60 jours), 5 étapes maximum.');
  await sql('update accounts set steps = $2::jsonb where id = $1', [ctx.account.id, JSON.stringify(steps)]);
  return ok();
}
