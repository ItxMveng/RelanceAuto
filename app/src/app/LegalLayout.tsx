import Link from 'next/link';
import { BrandMark } from '@/components/Brand';

export function LegalLayout({ title, updated, children }: { title: string; updated: string; children: React.ReactNode }) {
  return (
    <main className="legal">
      <Link href="/" className="brand" style={{ padding: 0, marginBottom: 24 }}><BrandMark /> RelanceAuto</Link>
      <h1>{title}</h1>
      <p className="tl-meta">Dernière mise à jour : {updated}</p>
      <div className="legal-body">{children}</div>
      <p style={{ marginTop: 32 }}><Link href="/">← Retour à l’accueil</Link></p>
    </main>
  );
}
