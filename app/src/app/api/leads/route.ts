import { createLead } from '@/lib/engine';
import { fail, guard, isResponse, ok, readJson } from '@/lib/http';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  const ctx = await guard(req);
  if (isResponse(ctx)) return ctx;
  const b = await readJson(req);
  const r = await createLead(ctx.account, {
    name: String(b.name ?? ''),
    email: String(b.email ?? ''),
    message: String(b.message ?? ''),
    source: 'manuel',
  });
  return r.ok ? ok({ leadId: r.leadId }) : fail(r.error);
}
