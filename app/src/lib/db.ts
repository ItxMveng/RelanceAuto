import { neon } from '@neondatabase/serverless';

export type Row = Record<string, any>;

let client: ReturnType<typeof neon> | null = null;

export async function sql<T extends Row = Row>(text: string, params: unknown[] = []): Promise<T[]> {
  if (!client) {
    const url = process.env.DATABASE_URL;
    if (!url) throw new Error('DATABASE_URL manquant');
    client = neon(url);
  }
  return (await (client as any)(text, params)) as T[];
}
