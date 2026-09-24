import type { Metadata, Viewport } from 'next';
import './globals.css';
import './product.css';

export const metadata: Metadata = {
  title: { default: 'RelanceAuto — Relances automatiques pour coachs et thérapeutes', template: '%s · RelanceAuto' },
  description: 'Réponse immédiate, relances à J+2 et J+5, arrêt dès la prise de rendez-vous. Essayez gratuitement pendant 14 jours.',
  icons: { icon: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'%3E%3Crect width='32' height='32' rx='7' fill='%2301696f'/%3E%3Cpath d='M18 5L8 18h7l-1 9 10-13h-7z' fill='%23fff'/%3E%3C/svg%3E" },
};
export const viewport: Viewport = { themeColor: '#01696f', width: 'device-width', initialScale: 1 };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400..700&family=Instrument+Serif&display=swap" rel="stylesheet" />
      </head>
      <body>{children}</body>
    </html>
  );
}
