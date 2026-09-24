import { createLead } from '@/lib/engine';
import { fail, guard, isResponse, ok } from '@/lib/http';

export const dynamic = 'force-dynamic';

/** Crée un contact de démonstration (adresse réservée example.com, jamais envoyée en envoi réel). */
export async function POST(req: Request) {
  const ctx = await guard(req);
  if (isResponse(ctx)) return ctx;
  if (ctx.account.send_mode !== 'simulation') return fail('Le contact de démonstration n’existe qu’en mode simulation, pour ne jamais écrire à une fausse adresse.');
  const r = await createLead(ctx.account, {
    name: 'Camille Démo',
    email: `camille.demo+${Date.now().toString(36)}@example.com`,
    message: 'Bonjour, je souhaiterais en savoir plus sur votre accompagnement.',
    source: 'manuel',
  });
  return r.ok ? ok({ leadId: r.leadId }) : fail(r.error);
}
