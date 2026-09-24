import { notFound } from 'next/navigation';
import { sql } from '@/lib/db';
import { CaptureForm } from '@/components/CaptureForm';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Me contacter', robots: { index: false } };

export default async function PublicForm({ params }: { params: { slug: string } }) {
  if (!/^[a-f0-9]{6,32}$/.test(params.slug)) notFound();
  const rows = await sql<{ my_name: string; activity: string }>('select my_name, activity from accounts where capture_slug = $1', [params.slug]);
  if (!rows[0]) notFound();
  const name = rows[0].my_name || 'votre praticien';
  return (
    <main className="center-page">
      <div className="auth-card">
        <div className="card">
          <h1>Écrire à {name}</h1>
          <p className="sub">Décrivez brièvement votre demande : vous recevrez une réponse par email.</p>
          <CaptureForm slug={params.slug} />
        </div>
      </div>
    </main>
  );
}
