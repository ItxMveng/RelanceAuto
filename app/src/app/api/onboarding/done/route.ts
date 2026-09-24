import { sql } from '@/lib/db';
import { guard, isResponse, ok } from '@/lib/http';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  const ctx = await guard(req);
  if (isResponse(ctx)) return ctx;
  await sql('update accounts set onboarding_done = true where id = $1', [ctx.account.id]);
  return ok();
}
