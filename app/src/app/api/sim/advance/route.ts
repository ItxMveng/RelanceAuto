import { advanceTime, resetTime } from '@/lib/engine';
import { fail, guard, isResponse, ok, readJson } from '@/lib/http';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  const ctx = await guard(req);
  if (isResponse(ctx)) return ctx;
  const b = await readJson(req);
  if (b.reset) {
    await resetTime(ctx.account);
    return ok();
  }
  const days = Number(b.days);
  if (![1, 2, 3, 5, 7].includes(days)) return fail('Durée invalide');
  const done = await advanceTime(ctx.account, days);
  return done ? ok() : fail('Le voyage dans le temps n’existe qu’en mode simulation.');
}
