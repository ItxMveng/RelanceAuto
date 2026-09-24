import { createLead } from '@/lib/engine';
import { fail, guard, isResponse, ok, readJson } from '@/lib/http';

export const dynamic = 'force-dynamic';

/** Import « Nom, email » (une ligne par contact, séparateur virgule, point-virgule ou tabulation). */
export async function POST(req: Request) {
  const ctx = await guard(req);
  if (isResponse(ctx)) return ctx;
  const text = String((await readJson(req)).text ?? '');
  const lines = text.split(/\r?\n/).map((l) => l.trim()).filter(Boolean).slice(0, 50);
  if (lines.length === 0) return fail('Collez au moins une ligne « Nom, email ».');

  let created = 0;
  const errors: string[] = [];
  for (const line of lines) {
    const parts = line.split(/[;,\t]/).map((p) => p.trim());
    const email = parts.find((p) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(p));
    const name = parts.find((p) => p && p !== email) ?? (email ? email.split('@')[0] : '');
    if (!email) {
      errors.push(`« ${line.slice(0, 40)} » : email introuvable`);
      continue;
    }
    const r = await createLead(ctx.account, { name, email, source: 'import' });
    if (r.ok) created++;
    else {
      errors.push(`${email} : ${r.error}`);
      if (r.error.includes('Limite') || r.error.includes('terminé')) break;
    }
  }
  return ok({ created, errors });
}
