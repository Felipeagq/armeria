import type { Metadata, Viewport } from 'next';
import '@fontsource-variable/space-grotesk';
import '@fontsource-variable/jetbrains-mono';
import './globals.css';

export const metadata: Metadata = {
  title: 'Armería 3D — Constructor de réplicas airsoft',
  description: 'Configura réplicas de airsoft en 3D: elige modelo, monta accesorios y consulta la ficha técnica.',
  robots: { index: true, follow: true },
};

export const viewport: Viewport = { width: 'device-width', initialScale: 1, viewportFit: 'cover', themeColor: '#0f1012' };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
