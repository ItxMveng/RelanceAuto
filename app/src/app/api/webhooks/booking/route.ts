import { sql } from '@/lib/db';
import { markBookedByEmail } from '@/lib/engine';
import { allow, clientIp } from '@/lib/ratelimit';
import { fail, ok } from '@/lib/http';

export const dynamic = 'force-dynamic';

function extractEmails(body: any): string[] {
  const found = new Set<string>();
  const add = (v: unknown) => {
    if (typeof v === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim())) found.add(v.trim().toLowerCase());
  };
  add(body?.email);
  add(body?.payload?.email); // Calendly
  add(body?.payload?.invitee?.email);
  for (const a of body?.payload?.attendees ?? []) add(a?.email); // Cal.com
  for (const a of body?.attendees ?? []) add(a?.email);
  return [...found];
}

/** Webhook de réservation (Cal.com, Calendly ou générique) : stoppe les relances des contacts qui ont pris RDV. */
export async function POST(req: Request) {
  const key = new URL(req.url).searchParams.get('key') ?? '';
  if (!/^[a-f0-9]{32}$/.test(key)) return fail('Clé invalide', 401);
  if (!(await allow(`webhook:${clientIp(req)}`, 120, 3600))) return fail('Trop de requêtes', 429);
  const rows = await sql('select id from accounts where webhook_key = $1', [key]);
  if (!rows[0]) return fail('Clé invalide', 401);

  let body: any = {};
  try {
    body = await req.json();
  } catch {
    return fail('Corps JSON attendu');
  }
  const event = String(body?.triggerEvent ?? body?.event ?? 'BOOKING_CREATED');
  if (/cancel/i.test(event)) return ok({ updated: 0 });

  let updated = 0;
  for (const email of extractEmails(body)) updated += await markBookedByEmail(rows[0].id, email);
  return ok({ updated });
}
