import Link from 'next/link';
import { redirect } from 'next/navigation';
import { Brand } from '@/components/Brand';
import { AuthForm } from '@/components/AuthForm';
import { getCtx } from '@/lib/auth';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Connexion' };

export default async function Login() {
  if (await getCtx()) redirect('/dashboard');
  return (
    <main className="center-page">
      <div className="auth-card">
        <Brand />
        <div className="card">
          <h1>Bon retour</h1>
          <p className="sub">Connectez-vous pour retrouver vos contacts et vos relances.</p>
          <AuthForm mode="login" />
        </div>
        <p className="auth-foot">Pas encore de compte ? <Link href="/signup">Essai gratuit</Link></p>
      </div>
    </main>
  );
}
