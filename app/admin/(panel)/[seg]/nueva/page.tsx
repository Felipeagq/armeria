import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { exigirAdmin } from '@/server/auth';
import { ENTIDADES, esSeg } from '@/admin/entidades';
import { armasConVariantes, opcionesAccesorios, opcionesMunicion } from '@/admin/repo';
import { accesorioVacio, armaVacia, municionVacia, terminoVacio } from '@/admin/vacios';
import { EditorAccesorio, EditorArma, EditorMunicion, EditorTermino } from '../../_ui/editores';

export const dynamic = 'force-dynamic';
type Props = { params: Promise<{ seg: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { seg } = await params;
  return { title: esSeg(seg) ? ENTIDADES[seg].nueva : 'No encontrado' };
}

export default async function NuevaPage({ params }: Props) {
  const { seg } = await params;
  if (!esSeg(seg)) notFound();
  await exigirAdmin();
  const e = ENTIDADES[seg];
  return (
    <>
      <p className="admmigas"><Link href={`/admin/${seg}/`}>{e.plural}</Link> / Nuevo</p>
      <h1>{e.nueva}</h1>
      {seg === 'armas' && <EditorArma inicial={armaVacia()} municion={await opcionesMunicion()} accesorios={await opcionesAccesorios()} />}
      {seg === 'municion' && <EditorMunicion inicial={municionVacia()} armas={await armasConVariantes()} />}
      {seg === 'accesorios' && <EditorAccesorio inicial={accesorioVacio()} armas={await armasConVariantes()} />}
      {seg === 'glosario' && <EditorTermino inicial={terminoVacio()} />}
    </>
  );
}
