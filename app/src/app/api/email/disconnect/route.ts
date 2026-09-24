import { sql } from '@/lib/db';
import { guard, isResponse, ok } from '@/lib/http';

export const dynamic = 'force-dynamic';

/** Retour en mode simulation ; supprime les identifiants SMTP enregistrés. */
export async function POST(req: Request) {
  const ctx = await guard(req);
  if (isResponse(ctx)) return ctx;
  await sql(
    `update accounts set send_mode='simulation', smtp_host=null, smtp_port=null, smtp_user=null, smtp_pass_enc=null, smtp_from=null where id=$1`,
    [ctx.account.id],
  );
  return ok();
}
