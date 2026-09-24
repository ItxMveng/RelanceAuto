'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { call } from './api';

const ICONS = {
  home: <path d="M3 11l9-8 9 8v10a1 1 0 01-1 1h-5v-7H9v7H4a1 1 0 01-1-1z" />,
  seq: (<><path d="M4 6h16M4 12h10M4 18h6" /></>),
  cog: (<><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.7 1.7 0 00.3 1.8l.1.1a2 2 0 11-2.8 2.8l-.1-.1a1.7 1.7 0 00-1.8-.3 1.7 1.7 0 00-1 1.5V21a2 2 0 11-4 0v-.1a1.7 1.7 0 00-1.1-1.5 1.7 1.7 0 00-1.8.3l-.1.1a2 2 0 11-2.8-2.8l.1-.1a1.7 1.7 0 00.3-1.8 1.7 1.7 0 00-1.5-1H3a2 2 0 110-4h.1a1.7 1.7 0 001.5-1.1 1.7 1.7 0 00-.3-1.8l-.1-.1a2 2 0 112.8-2.8l.1.1a1.7 1.7 0 001.8.3H9a1.7 1.7 0 001-1.5V3a2 2 0 114 0v.1a1.7 1.7 0 001 1.5 1.7 1.7 0 001.8-.3l.1-.1a2 2 0 112.8 2.8l-.1.1a1.7 1.7 0 00-.3 1.8V9a1.7 1.7 0 001.5 1H21a2 2 0 110 4h-.1a1.7 1.7 0 00-1.5 1z" /></>),
  users: (<><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" /></>),
  send: (<><path d="M22 2L11 13M22 2l-7 20-4-9-9-4z" /></>),
  shield: (<><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></>),
  out: (<><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9" /></>),
};

export function SideNav({ email, admin }: { email: string; admin?: boolean }) {
  const path = usePathname();
  const items = [
    { href: '/dashboard', label: 'Accueil', icon: ICONS.home, active: path === '/dashboard' || path.startsWith('/dashboard/welcome') },
    { href: '/dashboard/contacts', label: 'Contacts', icon: ICONS.users, active: path.startsWith('/dashboard/contacts') || path.startsWith('/dashboard/leads') },
    { href: '/dashboard/sequence', label: 'Séquence', icon: ICONS.seq, active: path.startsWith('/dashboard/sequence') },
    { href: '/dashboard/outbox', label: 'Envois', icon: ICONS.send, active: path.startsWith('/dashboard/outbox') },
    { href: '/dashboard/settings', label: 'Réglages', icon: ICONS.cog, active: path.startsWith('/dashboard/settings') || path.startsWith('/dashboard/upgrade') },
    ...(admin ? [{ href: '/dashboard/admin', label: 'Admin', icon: ICONS.shield, active: path.startsWith('/dashboard/admin') }] : []),
  ];
  async function logout() {
    await call('/api/auth/logout', 'POST');
    window.location.href = '/login';
  }
  return (
    <aside className="side">
      <div className="brand">
        <span className="brand-mark" aria-hidden="true">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M13 2L3 14h9l-1 8 10-12h-9z" /></svg>
        </span>
        RelanceAuto
      </div>
      <nav aria-label="Navigation principale" style={{ display: 'contents' }}>
        {items.map((i) => (
          <Link key={i.href} href={i.href} className="nav-link" aria-current={i.active ? 'page' : undefined}>
            <svg viewBox="0 0 24 24" aria-hidden="true">{i.icon}</svg>
            {i.label}
          </Link>
        ))}
      </nav>
      <button className="nav-link" onClick={logout} style={{ background: 'none', border: 0, cursor: 'pointer', textAlign: 'left' }}>
        <svg viewBox="0 0 24 24" aria-hidden="true">{ICONS.out}</svg>
        Déconnexion
      </button>
      <div className="side-foot">{email}</div>
    </aside>
  );
}
