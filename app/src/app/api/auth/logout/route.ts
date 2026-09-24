import { endSession, sameOrigin } from '@/lib/auth';
import { fail, ok } from '@/lib/http';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  if (!sameOrigin(req)) return fail('Origine non autorisée', 403);
  endSession();
  return ok();
}
