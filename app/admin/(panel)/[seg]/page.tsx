import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { exigirAdmin } from '@/server/auth';
import { ENTIDADES, esSeg } from '@/admin/entidades';
import { listar } from '@/admin/repo';
import { fechaCorta } from '@/admin/util';
import { IconPlus } from '@/components/icons';

export const dynamic = 'force-dynamic';
type Props = { params: Promise<{ seg: string }>; searchParams: Promise<{ q?: string; grupo?: string; archivados?: string; ok?: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { seg } = await params;
  return { title: esSeg(seg) ? ENTIDADES[seg].plural : 'No encontrado' };
}

const norm = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

export default async function ListaPage({ params, searchParams }: Props) {
  const { seg } = await params;
  if (!esSeg(seg)) notFound();
  await exigirAdmin();
  const { q = '', grupo = '', archivados, ok } = await searchParams;
  const e = ENTIDADES[seg];
  const todas = await listar(seg);
  const grupos = [...new Set(todas.map(f => f.grupo))].sort((a, b) => a.localeCompare(b, 'es'));
  const nArchivados = todas.filter(f => f.archivado).length;
  const filas = todas.filter(f =>
    (archivados === '1' || !f.archivado)
    && (!grupo || f.grupo === grupo)
    && (!q || norm(`${f.nombre} ${f.id} ${f.detalle}`).includes(norm(q))));

  return (
    <>
      <div className="admtitulo">
        <h1>{e.plural} <span className="admcuenta">({todas.length - nArchivados}{nArchivados ? ` + ${nArchivados} archivados` : ''})</span></h1>
        <Link className="primary" href={`/admin/${seg}/nueva/`}><IconPlus />{e.nueva}</Link>
      </div>
      {ok === 'error' && <p className="admerror" role="alert">No se pudo completar la operación.</p>}

      <form className="admfiltros" method="get" role="search">
        <input type="search" name="q" defaultValue={q} placeholder={`Buscar ${e.plural.toLowerCase()}…`} aria-label="Buscar" />
        <select name="grupo" defaultValue={grupo} aria-label="Grupo">
          <option value="">Todos los grupos</option>
          {grupos.map(g => <option key={g} value={g}>{g}</option>)}
        </select>
        {nArchivados > 0 && <label className="admcheck"><input type="checkbox" name="archivados" value="1" defaultChecked={archivados === '1'} /><span>Mostrar archivados</span></label>}
        <button className="ghost" type="submit">Filtrar</button>
        {(q || grupo || archivados) && <Link className="admenlace" href={`/admin/${seg}/`}>Limpiar</Link>}
      </form>

      {filas.length === 0
        ? <p className="admayuda">No hay resultados.</p>
        : (
          <ul className="admlistado">
            {filas.map(f => (
              <li key={f.id} className={f.archivado ? 'archivado' : ''}>
                <Link href={`/admin/${seg}/${encodeURIComponent(f.id)}/`}>
                  <span className="admnombre">{f.nombre}</span>
                  <span className="admdetalle">{f.detalle}</span>
                  <span className="admetiquetas">
                    <i>{f.grupo}</i>
                    {f.etiquetas.map(t => <i key={t}>{t}</i>)}
                    {f.avisos.map(t => <i key={t} className="aviso">{t}</i>)}
                    {f.archivado && <i className="archivado">Archivado</i>}
                  </span>
                  <time className="admfecha" dateTime={f.actualizado.toISOString()}>{fechaCorta(f.actualizado)}</time>
                </Link>
              </li>
            ))}
          </ul>
        )}
    </>
  );
}
