import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import SiteNav from '@/components/SiteNav';
import { SistemaNotas } from '@/components/SistemaNotas';
import { ammoForCalibre } from '@/three/data/ammo';
import { specRowsOf } from '@/three/data/armas';
import { getFicha, putFicha, type FichaExterna } from '@/server/store';
import { fichaDesdeWikipedia, parseWikiSlug } from '@/server/wikipedia';
import type { Specs } from '@/three/types';

export const dynamic = 'force-dynamic';
type Props = { params: Promise<{ slug: string }> };

/** Caché primero; si es un artículo de Wikipedia aún no consultado, se lee y se guarda. Las fichas IA solo existen si ya se generaron. */
async function resolver(slugRaw: string): Promise<FichaExterna | null> {
  const slug = decodeURIComponent(slugRaw);
  const hit = await getFicha(slug); if (hit) return hit;
  const w = parseWikiSlug(slug); if (!w) return null;
  const f = await fichaDesdeWikipedia(w.lang, w.title); if (!f) return null;
  await putFicha(f);
  if (f.slug !== slug) await putFicha({ ...f, slug }); // redirección de Wikipedia: ambos nombres resuelven
  return f;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const f = await resolver((await params).slug);
  if (!f) return { title: 'Ficha no encontrada' };
  return { title: `${f.name}: ficha técnica`, description: f.resumen ?? `${f.name}: ficha técnica (${f.origen === 'ia' ? 'generada con IA, sin verificar' : 'Wikipedia'}).`, robots: f.revisado ? undefined : { index: false } };
}

const KEY_FACTS: [keyof Specs, string][] = [['calibre', 'Calibre'], ['peso', 'Peso'], ['cadencia', 'Cadencia']];
const GEN_LABEL = { pistol: 'pistola', rifle: 'carabina', smg: 'subfusil' } as const;

export default async function FichaExternaPage({ params }: Props) {
  const f = await resolver((await params).slug);
  if (!f) notFound();
  const ammo = ammoForCalibre(f.specs.calibre);
  const keys = KEY_FACTS.filter(([k]) => f.specs[k]);
  const ia = f.origen === 'ia';
  return (
    <>
      <SiteNav current="armas" />
      <main id="main" className="wikimain wide">
        <p className="crumbs"><Link href="/">← Armas</Link> <span aria-hidden>/</span> <Link href={`/armas/buscar/?q=${encodeURIComponent(f.name)}`}>Buscar</Link></p>
        <div className={`wsheet ${f.photo ? '' : 'nophoto'}`}>
          {f.photo && (
            <figure className="spfig wplate">
              <img src={f.photo.url} width={1200} height={800} alt={f.name} decoding="async" />
              <figcaption>
                {f.photo.author ? `${f.photo.author}. ` : ''}
                {f.photo.licenseUrl ? <a href={f.photo.licenseUrl} target="_blank" rel="noopener noreferrer">{f.photo.license}</a> : f.photo.license}.{' '}
                <a href={f.photo.source} target="_blank" rel="noopener noreferrer">Wikimedia Commons</a>
              </figcaption>
            </figure>
          )}
          <div className="wbody">
            <div className="whead">
              <div>
                <h1>{f.name}</h1>
                <p className="wikilead">{[f.maker, f.tipo].filter(Boolean).join(', ')}</p>
              </div>
              <Link className="primary" href={`/montar/?m=${f.generico}&name=${encodeURIComponent(f.name)}`} title="Abre el constructor con un cuerpo genérico; la silueta no es la de este modelo">Montar con cuerpo de {GEN_LABEL[f.generico]}</Link>
            </div>
            <p className={`wnote ${ia ? 'warn' : ''}`} role={ia ? 'note' : undefined}>
              <i className={`wbadge ${f.origen}`}>{ia ? 'Generado con IA, sin verificar' : 'Wikipedia'}</i>
              <span>
                {ia
                  ? <>Ficha rellenada por un modelo a partir de búsqueda web{f.confianza ? ` (confianza ${f.confianza})` : ''}. Puede contener errores: contrasta los datos con las fuentes.</>
                  : <>Datos de la infobox de <a href={f.fuente.url} target="_blank" rel="noopener noreferrer">{f.fuente.label}</a>, texto bajo <a href={f.fuente.licenseUrl} target="_blank" rel="noopener noreferrer">{f.fuente.license}</a>. No revisados por Armería 3D.</>}
              </span>
            </p>

            {keys.length > 0 && (
              <div className="fkeys">
                {keys.map(([k, label]) => {
                  const c = k === 'calibre' ? ammo[0] : undefined;
                  return c
                    ? <Link className="fkey fkey-link" key={k} href={`/balas/${c.id}/`} title={`Ver la ficha de ${c.name}`}><span>{label}</span><b>{f.specs[k]}</b></Link>
                    : <div className="fkey" key={k}><span>{label}</span><b>{f.specs[k]}</b></div>;
                })}
              </div>
            )}

            {f.resumen && (<><h2>Resumen</h2><div className="wprose"><p>{f.resumen}</p></div></>)}

            <h2>Datos</h2>
            <div className="fspecs">
              <dl>{specRowsOf(f.specs).filter(([k]) => !keys.some(([key]) => key === k)).map(([k, label]) => <div className="sr" key={k}><dt>{label}</dt><dd>{f.specs[k]}{(k === 'sistema' || k === 'airsoft') && <SistemaNotas texto={f.specs[k]} campo={k} />}</dd></div>)}</dl>
              {!specRowsOf(f.specs).length && <p className="muted">La fuente no aporta datos técnicos estructurados.</p>}
              <p className="src">Fuente: {f.specs.fuente}. Consultado el {new Date(f.fetchedAt).toLocaleDateString('es-ES')}. Los valores varían según configuración y munición.</p>
            </div>

            {ia && f.fuentes && f.fuentes.length > 0 && (<>
              <h2>Fuentes consultadas</h2>
              <ul className="wlist">{f.fuentes.map(u => <li key={u}><a href={u} target="_blank" rel="noopener noreferrer nofollow">{u.replace(/^https?:\/\/(www\.)?/, '').slice(0, 90)}</a></li>)}</ul>
            </>)}

            {ammo.length > 0 && (<>
              <h2>Munición</h2>
              <ul className="wlist">{ammo.map(c => <li key={c.id}><Link href={`/balas/${c.id}/`}>{c.name}</Link><span>{c.tagline}</span></li>)}</ul>
            </>)}
          </div>
        </div>
      </main>
    </>
  );
}
