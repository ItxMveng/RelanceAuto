import { sql } from '@/lib/db';
import { createLead } from '@/lib/engine';
import { allow, clientIp } from '@/lib/ratelimit';
import { fail, ok } from '@/lib/http';

export const dynamic = 'force-dynamic';

/** Formulaire public de contact d'un praticien : crée un contact et démarre la séquence. */
export async function POST(req: Request, { params }: { params: { slug: string } }) {
  if (!/^[a-f0-9]{6,32}$/.test(params.slug)) return fail('Formulaire introuvable', 404);
  let body: Record<string, any> = {};
  try {
    body = await req.json();
  } catch {
    return fail('Requête invalide');
  }
  if (body.website) return ok(); // piège à robots : on répond « ok » sans rien créer
  if (!(await allow(`capture:${params.slug}:${clientIp(req)}`, 5, 3600))) return fail('Trop de messages envoyés, réessayez plus tard.', 429);

  const rows = await sql('select * from accounts where capture_slug = $1', [params.slug]);
  if (!rows[0]) return fail('Formulaire introuvable', 404);
  const r = await createLead(rows[0], {
    name: String(body.name ?? ''),
    email: String(body.email ?? ''),
    message: String(body.message ?? ''),
    source: 'formulaire',
  });
  if (!r.ok && r.error === 'Ce contact existe déjà.') return ok(); // ne révèle pas qu'un contact existe
  return r.ok ? ok() : fail(r.error === 'Nom ou email invalide.' ? r.error : 'Le formulaire est momentanément indisponible.');
}
