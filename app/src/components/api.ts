export async function call(url: string, method: string, body?: unknown): Promise<{ ok: boolean; error?: string; [k: string]: any }> {
  try {
    const res = await fetch(url, {
      method,
      headers: body === undefined ? undefined : { 'Content-Type': 'application/json' },
      body: body === undefined ? undefined : JSON.stringify(body),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok && !data.error) return { ok: false, error: `Erreur ${res.status}` };
    return data;
  } catch {
    return { ok: false, error: 'Connexion impossible. Réessayez.' };
  }
}
