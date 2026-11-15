import type { Metadata, Viewport } from 'next';
import '@fontsource-variable/ibm-plex-sans';
import './globals.css';

export const metadata: Metadata = {
  title: { default: 'Armería 3D — Enciclopedia de armas y réplicas airsoft', template: '%s | Armería 3D' },
  description: 'Fichas técnicas de armas reales y de sus réplicas de airsoft, munición y un constructor 3D para montar accesorios.',
  robots: { index: true, follow: true },
};

export const viewport: Viewport = { width: 'device-width', initialScale: 1, viewportFit: 'cover', themeColor: '#14161a' };

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
