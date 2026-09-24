import { getCtx } from '@/lib/auth';
import { sql } from '@/lib/db';
import { STATUS_LABEL } from '@/lib/format';

export const dynamic = 'force-dynamic';

const esc = (v: unknown) => {
  let s = String(v ?? '');
  if (/^[=+\-@\t\r]/.test(s)) s = `'${s}`; // neutralise l'injection de formules dans Excel
  return `"${s.replace(/"/g, '""')}"`;
};

export async function GET() {
  const ctx = await getCtx();
  if (!ctx) return new Response('Non connecté', { status: 401 });
  const rows = await sql(
    `select l.name, l.email, l.source, l.status, l.created_at, l.booked_at, l.notes,
            (select count(*)::int from messages m where m.lead_id = l.id and m.status = 'sent') as sent
       from leads l where l.account_id = $1 order by l.created_at desc`,
    [ctx.account.id],
  );
  const header = ['Nom', 'Email', 'Source', 'Statut', 'Ajouté le', 'RDV pris le', 'Messages envoyés', 'Notes'];
  const lines = rows.map((r) =>
    [r.name, r.email, r.source, STATUS_LABEL[r.status] ?? r.status, new Date(r.created_at).toISOString(), r.booked_at ? new Date(r.booked_at).toISOString() : '', r.sent, r.notes].map(esc).join(';'),
  );
  const csv = '﻿' + [header.map(esc).join(';'), ...lines].join('\r\n');
  return new Response(csv, {
    headers: { 'Content-Type': 'text/csv; charset=utf-8', 'Content-Disposition': 'attachment; filename="contacts-relanceauto.csv"' },
  });
}
