import { readFileSync } from 'node:fs';
import { neon } from '@neondatabase/serverless';

const url = process.env.DATABASE_URL;
if (!url) {
  console.error('DATABASE_URL manquant');
  process.exit(1);
}
const sql = neon(url);
const statements = readFileSync(new URL('../schema.sql', import.meta.url), 'utf8')
  .split(/;\s*\n/)
  .map((s) => s.trim())
  .filter(Boolean);
for (const stmt of statements) {
  await sql(stmt);
}
console.log(`Schéma appliqué (${statements.length} instructions).`);
