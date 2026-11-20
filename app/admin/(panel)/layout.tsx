import type { Metadata } from 'next';
import Link from 'next/link';
import { cerrarSesion } from '../acciones';
import { IconExternal } from '@/components/icons';

export const metadata: Metadata = { title: { default: 'Administración', template: '%s | Administración' }, robots: { index: false, follow: false } };

/** Marco del panel. La comprobación de sesión NO va aquí (un layout no se vuelve a ejecutar al navegar): va en cada página. */
export default function PanelLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <>
      <header className="admbar">
        <Link className="admmarca" href="/admin/">Armería 3D <span>· Administración</span></Link>
        <nav className="admnav" aria-label="Panel">
          <Link href="/admin/armas/">Armas</Link>
          <Link href="/admin/municion/">Munición</Link>
          <Link href="/admin/accesorios/">Accesorios</Link>
          <Link href="/admin/glosario/">Glosario</Link>
          <Link href="/admin/registro/">Registro</Link>
          <Link href="/" target="_blank">Ver sitio <IconExternal /></Link>
          <form action={cerrarSesion}><button className="ghost sm" type="submit">Salir</button></form>
        </nav>
      </header>
      <main id="main" className="admmain">{children}</main>
    </>
  );
}
