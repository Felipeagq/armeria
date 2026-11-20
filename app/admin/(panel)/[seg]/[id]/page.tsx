import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { exigirAdmin } from '@/server/auth';
import { ENTIDADES, esSeg, type Seg } from '@/admin/entidades';
import { listarImagenes } from '@/admin/repo-imagenes';
import type { TipoImg } from '@/admin/tipos';
import { armasConVariantes, leerAccesorio, leerArma, leerMunicion, leerRegistro, leerTermino, opcionesAccesorios, opcionesMunicion, type Leido } from '@/admin/repo';
import { BotonArchivar } from '../../_ui/BotonArchivar';
import { GestorImagenes } from '../../_ui/GestorImagenes';
import { Historial } from '../../_ui/Historial';
import { EditorAccesorio, EditorArma, EditorMunicion, EditorTermino } from '../../_ui/editores';
import { IconExternal } from '@/components/icons';

export const dynamic = 'force-dynamic';
type Props = { params: Promise<{ seg: string; id: string }>; searchParams: Promise<{ ok?: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { seg, id } = await params;
  return { title: esSeg(seg) ? `${ENTIDADES[seg].plural}: ${decodeURIComponent(id)}` : 'No encontrado' };
}

const AVISOS: Record<string, string> = {
  creado: 'Creado. Ya está publicado en el sitio.',
  guardado: 'Guardado. El sitio ya muestra el cambio.',
  'sin-cambios': 'No había nada que guardar: los datos son los mismos.',
  archivado: 'Archivado: ya no aparece en el sitio. Puedes restaurarlo cuando quieras.',
  restaurado: 'Restaurado: vuelve a verse en el sitio.',
  error: 'No se pudo completar la operación. No se ha cambiado nada.',
};

async function leer(seg: Seg, id: string): Promise<Leido<unknown> | null> {
  return seg === 'armas' ? leerArma(id) : seg === 'municion' ? leerMunicion(id) : seg === 'accesorios' ? leerAccesorio(id) : leerTermino(id);
}

export default async function EditarPage({ params, searchParams }: Props) {
  const { seg, id: idRaw } = await params;
  if (!esSeg(seg)) notFound();
  await exigirAdmin();
  const id = decodeURIComponent(idRaw);
  const { ok } = await searchParams;
  const e = ENTIDADES[seg];
  const dato = await leer(seg, id);
  if (!dato) notFound();
  const nombre = (dato.form as { nombre: string }).nombre;
  const archivado = !!dato.archivadoEn;
  const visible = !archivado && !(seg === 'armas' && !(dato.form as { revisado: boolean }).revisado);
  const { filas } = await leerRegistro({ tipo: e.tipo, entidadId: id, porPagina: 12 });
  const clave = `${dato.actualizadoEn.getTime()}`;
  const aviso = ok ? AVISOS[ok] : undefined;

  return (
    <>
      <p className="admmigas"><Link href={`/admin/${seg}/`}>{e.plural}</Link> / {nombre}</p>
      <div className="admtitulo">
        <h1>{nombre}{archivado && <span className="admsello">Archivado</span>}</h1>
        <div className="admtitulo-acc">
          {visible && <Link className="ghost sm" href={e.publica(id)} target="_blank">Ver en el sitio<IconExternal /></Link>}
          <BotonArchivar seg={seg} id={id} archivado={archivado} nombre={nombre} />
        </div>
      </div>
      {aviso && <p className={ok === 'error' ? 'admerror' : 'admaviso'} role="status">{aviso}</p>}
      {archivado && ok !== 'archivado' && <p className="admaviso">Este ítem está archivado y no se muestra en el sitio. Si lo editas, sigue archivado hasta que lo restaures.</p>}
      {seg === 'armas' && dato.origen && dato.origen !== 'catalogo' && <p className="admaviso">Ficha traída de {dato.origen === 'ia' ? 'la IA (sin verificar)' : 'Wikipedia'}. Revísala y marca «Revisada» para que se muestre en el sitio.</p>}

      {seg === 'armas' && <EditorArma key={clave} inicial={dato.form as never} municion={await opcionesMunicion()} accesorios={await opcionesAccesorios()} />}
      {seg === 'municion' && <EditorMunicion key={clave} inicial={dato.form as never} armas={await armasConVariantes()} />}
      {seg === 'accesorios' && <EditorAccesorio key={clave} inicial={dato.form as never} armas={await armasConVariantes()} />}
      {seg === 'glosario' && <EditorTermino key={clave} inicial={dato.form as never} />}

      {seg !== 'glosario' && <GestorImagenes tipo={e.tipo as TipoImg} id={id} imagenes={await listarImagenes(e.tipo as TipoImg, id)} />}

      <section className="admhistorial">
        <h2>Historial</h2>
        <Historial filas={filas} />
        <p className="admayuda"><Link href={`/admin/registro/?tipo=${e.tipo}&id=${encodeURIComponent(id)}`}>Ver todo el historial de este ítem</Link></p>
      </section>
    </>
  );
}
