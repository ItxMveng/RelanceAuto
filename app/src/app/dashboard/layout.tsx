import { SideNav } from '@/components/SideNav';
import { requireCtx } from '@/lib/auth';
import { isAdmin } from '@/lib/admin';

export const dynamic = 'force-dynamic';

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const ctx = await requireCtx();
  const { user } = ctx;
  return (
    <div className="shell">
      <SideNav email={user.email} admin={isAdmin(ctx)} />
      <main className="main">{children}</main>
    </div>
  );
}
