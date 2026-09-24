import { SideNav } from '@/components/SideNav';
import { requireCtx } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user } = await requireCtx();
  return (
    <div className="shell">
      <SideNav email={user.email} />
      <main className="main">{children}</main>
    </div>
  );
}
