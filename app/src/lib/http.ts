import { NextResponse } from 'next/server';
import { getCtx, sameOrigin, Ctx } from './auth';

export const ok = (data: Record<string, unknown> = {}, status = 200) => NextResponse.json({ ok: true, ...data }, { status });
export const fail = (error: string, status = 400) => NextResponse.json({ ok: false, error }, { status });

export async function readJson(req: Request): Promise<Record<string, any>> {
  try {
    const body = await req.json();
    return body && typeof body === 'object' ? body : {};
  } catch {
    return {};
  }
}

/** Route authentifiée + contrôle CSRF. Retourne le contexte ou une réponse d'erreur. */
export async function guard(req: Request): Promise<Ctx | NextResponse> {
  if (!sameOrigin(req)) return fail('Origine non autorisée', 403);
  const ctx = await getCtx();
  if (!ctx) return fail('Non connecté', 401);
  return ctx;
}

export const isResponse = (v: unknown): v is NextResponse => v instanceof NextResponse;
