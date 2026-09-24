import { sql } from './db';

/** Fenêtre fixe stockée en base. Retourne false quand la limite est dépassée. */
export async function allow(key: string, max: number, windowSec: number): Promise<boolean> {
  const rows = await sql<{ hits: number }>(
    `insert into rate_limits (key, hits, window_start) values ($1, 1, now())
     on conflict (key) do update set
       hits = case when rate_limits.window_start < now() - make_interval(secs => $2::int) then 1 else rate_limits.hits + 1 end,
       window_start = case when rate_limits.window_start < now() - make_interval(secs => $2::int) then now() else rate_limits.window_start end
     returning hits`,
    [key, windowSec],
  );
  return (rows[0]?.hits ?? 1) <= max;
}

export function clientIp(req: Request): string {
  const fwd = req.headers.get('x-forwarded-for');
  return (fwd ? fwd.split(',')[0] : req.headers.get('x-real-ip') ?? 'unknown').trim();
}
