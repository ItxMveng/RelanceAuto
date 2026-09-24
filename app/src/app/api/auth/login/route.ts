import { z } from 'zod';
import { sql } from '@/lib/db';
import { checkPassword, sameOrigin, startSession } from '@/lib/auth';
import { allow, clientIp } from '@/lib/ratelimit';
import { fail, ok, readJson } from '@/lib/http';

export const dynamic = 'force-dynamic';

const schema = z.object({ email: z.string().trim().toLowerCase().email(), password: z.string().min(1).max(200) });

export async function POST(req: Request) {
  if (!sameOrigin(req)) return fail('Origine non autorisée', 403);
  const parsed = schema.safeParse(await readJson(req));
  if (!parsed.success) return fail('Email ou mot de passe invalide');
  const { email, password } = parsed.data;
  if (!(await allow(`login:${clientIp(req)}:${email}`, 10, 900))) return fail('Trop de tentatives, réessayez dans quelques minutes.', 429);

  const rows = await sql<{ id: string; password_hash: string }>('select id, password_hash from users where email = $1', [email]);
  const valid = rows[0] ? await checkPassword(password, rows[0].password_hash) : false;
  if (!rows[0] || !valid) return fail('Email ou mot de passe incorrect', 401);
  await startSession(rows[0].id);
  return ok();
}
