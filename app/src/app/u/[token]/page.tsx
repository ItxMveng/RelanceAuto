import { UnsubButton } from '@/components/UnsubButton';

export const metadata = { title: 'Désinscription', robots: { index: false } };

export default function Unsubscribe({ params }: { params: { token: string } }) {
  return (
    <main className="center-page">
      <div className="auth-card">
        <div className="card">
          <h1>Se désinscrire</h1>
          <p className="sub">Confirmez pour ne plus recevoir de messages de suivi.</p>
          <UnsubButton token={params.token} />
        </div>
      </div>
    </main>
  );
}
