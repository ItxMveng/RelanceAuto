import { unsubscribeByToken } from '@/lib/engine';
import { fail, ok, readJson } from '@/lib/http';
import { sameOrigin } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  const token = String((await readJson(req)).token ?? '');
  // Le lien « List-Unsubscribe-Post » des clients mail n'a pas d'en-tête Origin : sameOrigin l'autorise.
  if (!sameOrigin(req) || !/^[a-f0-9]{24}$/.test(token)) return fail('Lien invalide', 400);
  return (await unsubscribeByToken(token)) ? ok() : fail('Lien invalide', 404);
}
