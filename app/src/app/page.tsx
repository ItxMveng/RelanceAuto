import { redirect } from 'next/navigation';
import { getCtx } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export default async function Home() {
  redirect((await getCtx()) ? '/dashboard' : '/signup');
}
