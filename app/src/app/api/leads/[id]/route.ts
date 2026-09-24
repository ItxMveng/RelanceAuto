import { sql } from '@/lib/db';
import { setLeadStatus } from '@/lib/engine';
import { fail, guard, isResponse, ok, readJson } from '@/lib/http';

export const dynamic = 'force-dynamic';

const UUID = /^[0-9a-f-]{36}$/i;

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const ctx = await guard(req);
  if (isResponse(ctx)) return ctx;
  if (!UUID.test(params.id)) return fail('Contact introuvable', 404);
  const action = (await readJson(req)).action;
  if (action !== 'booked' && action !== 'stopped') return fail('Action invalide');
  const changed = await setLeadStatus(ctx.account.id, params.id, action);
  return changed ? ok() : fail('Contact introuvable ou déjà clôturé', 404);
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  const ctx = await guard(req);
  if (isResponse(ctx)) return ctx;
  if (!UUID.test(params.id)) return fail('Contact introuvable', 404);
  await sql('delete from leads where id = $1 and account_id = $2', [params.id, ctx.account.id]);
  return ok();
}
