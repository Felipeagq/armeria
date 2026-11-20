import type { Metadata } from 'next';
import Link from 'next/link';
import SiteNav from '@/components/SiteNav';
import SiteFooter from '@/components/SiteFooter';
import { ENABLE_3D } from '@/config';

export const metadata: Metadata = { title: 'Página no encontrada' };

const SECCIONES: [href: string, nombre: string, desc: string][] = [
  ['/', 'Armas', 'Fichas técnicas de armas reales y de sus réplicas de airsoft.'],
  ['/comparar/', 'Comparar', 'Dos o tres armas lado a lado.'],
  ['/accesorios/', 'Accesorios', 'Miras, bocachas, luces, empuñaduras, cargadores y culatas.'],
  ['/balas/', 'Balas', 'Cartuchos de las armas del catálogo y la bola de 6 mm.'],
  ['/sistemas/', 'Glosario', 'Qué significan los sistemas, cerrojos y términos de las fichas.'],
  ...(ENABLE_3D ? [['/montar/', 'Montar en 3D', 'Configura un arma con accesorios y expórtala.'] as [string, string, string]] : []),
];

export default function NotFound() {
  return (
    <>
      <SiteNav />
      <main id="main" className="wikimain">
        <h1>No encontramos esa página</h1>
        <p className="wikilead">El enlace puede estar mal escrito o la ficha ya no existe. Busca lo que necesitas con el buscador de arriba (Ctrl K) o entra por una de estas secciones.</p>
        <ul className="wlist">
          {SECCIONES.map(([href, nombre, desc]) => <li key={href}><Link href={href}>{nombre}</Link><span>{desc}</span></li>)}
        </ul>
      </main>
      <SiteFooter />
    </>
  );
}
