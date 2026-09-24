import { requireCtx } from '@/lib/auth';
import { appUrl } from '@/lib/engine';
import { Wizard } from '@/components/Wizard';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Configuration' };

export default async function Welcome() {
  const { account, user } = await requireCtx();
  return (
    <>
      <div className="page-head">
        <div>
          <h1>Configurons RelanceAuto ensemble</h1>
          <p>Quatre étapes, cinq minutes. Vous pouvez tout modifier plus tard.</p>
        </div>
      </div>
      <Wizard
        init={{ my_name: account.my_name, activity: account.activity, booking_link: account.booking_link }}
        email={{ connected: account.send_mode === 'smtp', user: account.smtp_user ?? '', host: account.smtp_host ?? '', accountEmail: user.email }}
        formUrl={`${appUrl()}/f/${account.capture_slug}`}
      />
    </>
  );
}
