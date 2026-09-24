import Link from 'next/link';
import { redirect } from 'next/navigation';
import { Brand } from '@/components/Brand';
import { AuthForm } from '@/components/AuthForm';
import { getCtx } from '@/lib/auth';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Essai gratuit' };

export default async function Signup() {
  if (await getCtx()) redirect('/dashboard');
  return (
    <main className="center-page">
      <div className="auth-card">
        <Brand />
        <div className="card">
          <h1>Essayez RelanceAuto gratuitement</h1>
          <p className="sub">14 jours, sans carte bancaire. Vous verrez vos relances partir en direct.</p>
          <AuthForm mode="signup" />
          <ul className="perks">
            <li>Séquence de 3 messages prête à l’emploi (J+0, J+2, J+5)</li>
            <li>Mode simulation : aucun email réel envoyé tant que vous ne l’activez pas</li>
            <li>Jusqu’à 10 contacts pendant l’essai</li>
          </ul>
        </div>
        <p className="auth-foot">Déjà un compte ? <Link href="/login">Se connecter</Link></p>
      </div>
    </main>
  );
}
