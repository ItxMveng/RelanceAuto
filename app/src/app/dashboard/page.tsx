import Link from 'next/link';
import { redirect } from 'next/navigation';
import { requireCtx } from '@/lib/auth';
import { sql } from '@/lib/db';
import { TRIAL_LEAD_LIMIT, tickAccount, trialState } from '@/lib/engine';
import { getActivity, getBySource, getDaily, getFunnel } from '@/lib/stats';
import { ActivityFeed, Checklist, DailyChart, FunnelChart, SourceTable } from '@/components/Charts';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Vue d’ensemble' };

export default async function Overview() {
  const { account } = await requireCtx();
  if (!account.onboarding_done && !account.my_name && !account.booking_link) redirect('/dashboard/welcome');
  await tickAccount(account.id);

  const [funnel, daily, sources, activity, [msgStats]] = await Promise.all([
    getFunnel(account.id),
    getDaily(account.id),
    getBySource(account.id),
    getActivity(account.id, 10),
    sql<{ failed: number; scheduled: number; sent: number }>(
      `select count(*) filter (where status='failed')::int as failed, count(*) filter (where status='scheduled')::int as scheduled, count(*) filter (where status='sent')::int as sent from messages where account_id = $1`,
      [account.id],
    ),
  ]);

  const trial = trialState(account);
  const simulation = account.send_mode === 'simulation';
  const rate = funnel.contacts > 0 ? Math.round((funnel.booked / funnel.contacts) * 100) : 0;
  const upgrade = '/dashboard/upgrade';

  const steps = [
    { done: Boolean(account.my_name && account.booking_link), title: 'Renseigner votre activité', text: 'Votre prénom et votre lien de réservation personnalisent chaque message.', href: '/dashboard/welcome', cta: 'Compléter' },
    { done: Boolean(account.onboarding_done) || funnel.contacts > 0, title: 'Vérifier vos messages', text: 'Choisissez un modèle adapté à votre métier et relisez-le.', href: '/dashboard/sequence', cta: 'Ouvrir' },
    { done: !simulation, title: 'Connecter votre boîte email', text: 'Pour que les messages partent vraiment de votre adresse (2 minutes).', href: '/dashboard/settings#email', cta: 'Connecter' },
    { done: funnel.contacts > 0, title: 'Recevoir un premier contact', text: 'Partagez votre formulaire ou ajoutez un contact pour voir la séquence tourner.', href: '/dashboard/contacts', cta: 'Ajouter' },
  ];

  return (
    <>
      <div className="page-head">
        <div>
          <h1>Vue d’ensemble</h1>
          <p>Ce que RelanceAuto fait pour vous, en un coup d’œil.</p>
        </div>
        <span className={`chip ${simulation ? 'sim' : 'booked'}`}>{simulation ? 'Mode simulation — aucun email réel' : 'Envoi réel actif'}</span>
      </div>

      {!trial.isPro && trial.active && (
        <div className="banner trial">
          <span><strong>Essai gratuit : {trial.daysLeft} jour{trial.daysLeft > 1 ? 's' : ''} restant{trial.daysLeft > 1 ? 's' : ''}</strong> · {funnel.contacts}/{TRIAL_LEAD_LIMIT} contacts</span>
          <Link href={upgrade}>Passer en illimité (199 €, une seule fois)</Link>
        </div>
      )}
      {!trial.active && (
        <div className="banner warn">
          <span><strong>Votre essai est terminé.</strong> Vos données sont conservées, mais les relances sont en pause.</span>
          <Link className="btn btn-primary btn-sm" href={upgrade}>Réactiver — 199 €</Link>
        </div>
      )}
      {msgStats.failed > 0 && (
        <div className="msg err">{msgStats.failed} message(s) n’ont pas pu partir. <Link href="/dashboard/outbox?statut=failed">Voir le détail</Link></div>
      )}

      <Checklist steps={steps} />

      <div className="grid stats" style={{ marginBottom: 18 }}>
        <div className="card stat"><div className="n">{funnel.contacts}</div><div className="l">Contacts reçus</div></div>
        <div className="card stat"><div className="n">{msgStats.sent}</div><div className="l">Messages {simulation ? 'simulés' : 'envoyés'}</div></div>
        <div className="card stat"><div className="n">{funnel.booked}</div><div className="l">Rendez-vous pris</div></div>
        <div className="card stat"><div className="n">{rate} %</div><div className="l">Taux de rendez-vous</div></div>
      </div>

      <div className="grid two" style={{ marginBottom: 18 }}>
        <div className="card">
          <h2>Messages par jour</h2>
          <p className="sub">14 derniers jours · {msgStats.scheduled} message(s) planifié(s)</p>
          <DailyChart points={daily} />
        </div>
        <div className="card">
          <h2>Entonnoir</h2>
          <p className="sub">De la demande au rendez-vous.</p>
          <FunnelChart f={funnel} />
        </div>
      </div>

      <div className="grid two">
        <div className="card">
          <h2>Activité récente</h2>
          <p className="sub">Tout ce qui s’est passé sur votre compte.</p>
          <ActivityFeed items={activity} />
        </div>
        <div className="card">
          <h2>D’où viennent vos contacts</h2>
          <p className="sub">Sources et taux de rendez-vous.</p>
          <SourceTable rows={sources} />
        </div>
      </div>
    </>
  );
}
