import type { Metadata, Viewport } from 'next';
import '@fontsource/barlow/latin-400.css';
import '@fontsource/barlow/latin-500.css';
import '@fontsource/barlow/latin-600.css';
import '@fontsource/barlow-condensed/latin-500.css';
import '@fontsource/barlow-condensed/latin-600.css';
import '@fontsource/barlow-condensed/latin-700.css';
import './globals.css';
import './site.css';
import { ENABLE_3D } from '@/config';

export const metadata: Metadata = {
  title: { default: 'Armería 3D — Enciclopedia de armas y réplicas airsoft', template: '%s | Armería 3D' },
  description: `Fichas técnicas de armas reales y de sus réplicas de airsoft, munición y accesorios${ENABLE_3D ? ', y un constructor 3D para montar accesorios' : ''}.`,
  robots: { index: true, follow: true },
};

export const viewport: Viewport = { width: 'device-width', initialScale: 1, viewportFit: 'cover', themeColor: '#0a0e0d' };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es">
      <body>
        <a className="skip" href="#main">Saltar al contenido</a>
        {children}
      </body>
    </html>
  );
}
