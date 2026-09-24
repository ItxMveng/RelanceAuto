import { sql } from '@/lib/db';
import { setLeadStatus } from '@/lib/engine';
import { allow, clientIp } from '@/lib/ratelimit';
import { fail, ok } from '@/lib/http';

export const dynamic = 'force-dynamic';

/**
 * Webhook « le prospect a répondu » (Zapier, Make, filtre Gmail…) : stoppe la séquence.
 * Corps JSON : { "email": "prospect@exemple.fr" }.
 */
export async function POST(req: Request) {
  const key = new URL(req.url).searchParams.get('key') ?? '';
  if (!/^[a-f0-9]{32}$/.test(key)) return fail('Clé invalide', 401);
  if (!(await allow(`webhook-reply:${clientIp(req)}`, 120, 3600))) return fail('Trop de requêtes', 429);
  const acc = await sql('select id from accounts where webhook_key = $1', [key]);
  if (!acc[0]) return fail('Clé invalide', 401);

  let body: any = {};
  try {
    body = await req.json();
  } catch {
    return fail('Corps JSON attendu');
  }
  const email = String(body?.email ?? body?.from ?? '').trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return fail('Champ « email » requis');
  const leads = await sql<{ id: string }>(`select id from leads where account_id = $1 and lower(email) = $2 and status in ('active','completed')`, [acc[0].id, email]);
  let updated = 0;
  for (const l of leads) if (await setLeadStatus(acc[0].id, l.id, 'replied')) updated++;
  return ok({ updated });
}
