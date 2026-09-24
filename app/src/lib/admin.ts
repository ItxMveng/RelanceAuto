import type { Ctx } from './auth';

export function isAdmin(ctx: Ctx | null): boolean {
  if (!ctx) return false;
  const list = (process.env.ADMIN_EMAILS || 'francisitoua05@gmail.com')
    .split(',')
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
  return list.includes(ctx.user.email.toLowerCase());
}
