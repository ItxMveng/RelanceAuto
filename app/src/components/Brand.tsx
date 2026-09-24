import Link from 'next/link';

export function BrandMark() {
  return (
    <span className="brand-mark" aria-hidden="true">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M13 2L3 14h9l-1 8 10-12h-9z" />
      </svg>
    </span>
  );
}

export function Brand({ href = '/' }: { href?: string }) {
  return (
    <Link href={href} className="brand">
      <BrandMark />
      RelanceAuto
    </Link>
  );
}
