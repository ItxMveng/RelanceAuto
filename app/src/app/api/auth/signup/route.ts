import { z } from 'zod';
import { sql } from '@/lib/db';
import { hashPassword, startSession } from '@/lib/auth';
import { allow, clientIp } from '@/lib/ratelimit';
import { fail, ok, readJson } from '@/lib/http';
import { sameOrigin } from '@/lib/auth';
import { defaultSteps } from '@/lib/templates';

export const dynamic = 'force-dynamic';

const schema = z.object({
  email: z.string().trim().toLowerCase().email().max(200),
  password: z.string().min(8, 'Mot de passe : 8 caractères minimum').max(200),
  name: z.string().trim().max(60).optional(),
});

export async function POST(req: Request) {
  if (!sameOrigin(req)) return fail('Origine non autorisée', 403);
  if (!(await allow(`signup:${clientIp(req)}`, 10, 3600))) return fail('Trop de tentatives, réessayez plus tard.', 429);
  const parsed = schema.safeParse(await readJson(req));
  if (!parsed.success) return fail(parsed.error.issues[0]?.message ?? 'Données invalides');
  const { email, password, name } = parsed.data;

  const existing = await sql('select id from users where email = $1', [email]);
  if (existing[0]) return fail('Un compte existe déjà avec cet email.', 409);

  const users = await sql<{ id: string }>('insert into users (email, password_hash) values ($1,$2) returning id', [email, await hashPassword(password)]);
  const userId = users[0].id;
  await sql('insert into accounts (user_id, my_name, steps) values ($1,$2,$3::jsonb)', [userId, name ?? '', JSON.stringify(defaultSteps('warm'))]);
  await startSession(userId);
  return ok();
}
