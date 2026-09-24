import { sql } from './db';

export type Funnel = { contacts: number; contacted: number; relaunched: number; booked: number; replied: number; stopped: number };
export type DayPoint = { day: string; count: number };
export type SourceRow = { source: string; leads: number; booked: number };
export type Activity = { kind: 'sent' | 'lead' | 'booked' | 'replied'; at: string; title: string; detail: string; leadId: string };

export async function getFunnel(accountId: string): Promise<Funnel> {
  const [r] = await sql<Funnel>(
    `select
       (select count(*)::int from leads where account_id = $1) as contacts,
       (select count(distinct m.lead_id)::int from messages m where m.account_id = $1 and m.status = 'sent' and m.step_index = 0) as contacted,
       (select count(distinct m.lead_id)::int from messages m where m.account_id = $1 and m.status = 'sent' and m.step_index >= 1) as relaunched,
       (select count(*)::int from leads where account_id = $1 and status = 'booked') as booked,
       (select count(*)::int from leads where account_id = $1 and status = 'replied') as replied,
       (select count(*)::int from leads where account_id = $1 and status in ('stopped','unsubscribed')) as stopped`,
    [accountId],
  );
  return r;
}

/** Messages envoyés par jour sur les 14 derniers jours (jours sans envoi = 0). */
export async function getDaily(accountId: string): Promise<DayPoint[]> {
  const rows = await sql<{ day: string; count: number }>(
    `select to_char(d::date, 'YYYY-MM-DD') as day, coalesce(c.n, 0)::int as count
       from generate_series(current_date - 13, current_date, interval '1 day') d
       left join (select sent_at::date as day, count(*) as n from messages
                   where account_id = $1 and status = 'sent' and sent_at >= current_date - 13 group by 1) c
         on c.day = d::date
      order by d`,
    [accountId],
  );
  return rows;
}

export async function getBySource(accountId: string): Promise<SourceRow[]> {
  return sql<SourceRow>(
    `select source, count(*)::int as leads, count(*) filter (where status = 'booked')::int as booked
       from leads where account_id = $1 group by source order by leads desc`,
    [accountId],
  );
}

export async function getActivity(accountId: string, limit = 12): Promise<Activity[]> {
  return sql<Activity>(
    `select * from (
       select 'sent' as kind, m.sent_at as at, l.name as title,
              ('Étape ' || (m.step_index + 1) || ' · ' || m.subject) as detail, l.id as "leadId"
         from messages m join leads l on l.id = m.lead_id
        where m.account_id = $1 and m.status = 'sent' and m.sent_at is not null
       union all
       select 'lead', l.created_at, l.name, ('Nouveau contact via ' || l.source), l.id
         from leads l where l.account_id = $1
       union all
       select 'booked', l.booked_at, l.name, 'Rendez-vous pris : relances arrêtées', l.id
         from leads l where l.account_id = $1 and l.status = 'booked' and l.booked_at is not null
     ) t order by at desc limit $2`,
    [accountId, limit],
  );
}

export async function getOutbox(accountId: string, filter: string, limit = 100) {
  const allowed = ['sent', 'scheduled', 'failed', 'skipped'];
  const where = allowed.includes(filter) ? 'and m.status = $2' : `and $2 = $2`;
  return sql(
    `select m.id, m.step_index, m.subject, m.body, m.status, m.delivery, m.error, m.scheduled_at, m.sent_at,
            l.id as lead_id, l.name, l.email
       from messages m join leads l on l.id = m.lead_id
      where m.account_id = $1 ${where}
      order by coalesce(m.sent_at, m.scheduled_at) desc limit ${Math.min(limit, 200)}`,
    [accountId, allowed.includes(filter) ? filter : 'all'],
  );
}
