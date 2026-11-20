import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { sesionActual } from '@/server/auth';
import { configAdmin, destinoSeguro } from '@/server/sesion';
import FormLogin from './FormLogin';
import { IconChevron } from '@/components/icons';

export const metadata: Metadata = { title: 'Acceso', robots: { index: false, follow: false } };
export const dynamic = 'force-dynamic';

type Props = { searchParams: Promise<{ next?: string | string[] }> };

export default async function LoginPage({ searchParams }: Props) {
  if (await sesionActual()) redirect('/admin/');
  const { next } = await searchParams;
  const configurado = configAdmin() !== null;
  return (
    <main id="main" className="admlogin">
      <h1>Administración</h1>
      <p className="muted">Acceso al panel de contenido de Armería 3D.</p>
      {configurado
        ? <FormLogin next={destinoSeguro(Array.isArray(next) ? next[0] : next)} />
        : <p className="admerror" role="alert">El acceso no está configurado. Define <code>ADMIN_USER</code>, <code>ADMIN_PASSWORD</code> y <code>SESSION_SECRET</code> (mínimo 32 caracteres) en el entorno del servidor.</p>}
      <p className="admvolver"><Link href="/"><IconChevron className="ic-prev" />Volver al sitio</Link></p>
    </main>
  );
}
