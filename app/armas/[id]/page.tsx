import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import SiteNav from '@/components/SiteNav';
import { SistemaNotas } from '@/components/SistemaNotas';
import { ammoForCalibre } from '@/three/data/ammo';
import { ARMAS, armaById, armaPhoto, has3d, refSpecs, specRowsOf } from '@/three/data/armas';
import { photoUrl } from '@/three/data/photos';
import type { Specs } from '@/three/types';

type Props = { params: Promise<{ id: string }> };

export const dynamicParams = false;
export const generateStaticParams = () => ARMAS.map(a => ({ id: a.id }));

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const a = armaById((await params).id);
  if (!a) return {};
  const s = refSpecs(a);
  return { title: `${a.name}: ficha técnica`, description: `${a.name} (${a.maker}): ${[s.calibre, s.sistema, s.cadencia].filter(Boolean).join(', ')}. Datos del arma real y de su réplica de airsoft.` };
}

/** Datos que se destacan arriba. */
const KEY_FACTS: [keyof Specs, string][] = [['calibre', 'Calibre'], ['peso', 'Peso'], ['cadencia', 'Cadencia']];

function Rows({ specs, skip = [] }: { specs: Specs; skip?: string[] }) {
  return <dl>{specRowsOf(specs).filter(([k]) => !skip.includes(k)).map(([k, label]) => <div className="sr" key={k}><dt>{label}</dt><dd>{specs[k]}{k === 'sistema' && <SistemaNotas texto={specs[k]} />}</dd></div>)}</dl>;
}

export default async function ArmaPage({ params }: Props) {
  const a = armaById((await params).id);
  if (!a) notFound();
  const i = ARMAS.indexOf(a);
  const prev = ARMAS[i - 1], next = ARMAS[i + 1];
  const ph = armaPhoto(a);
  const ref = refSpecs(a);
  const ammo = ammoForCalibre(ref.calibre);
  const keys = KEY_FACTS.filter(([k]) => ref[k]);
  const montable = has3d(a);

  return (
    <>
      <SiteNav current="armas" />
      <main id="main" className="wikimain wide">
        <p className="crumbs"><Link href="/">← Armas</Link></p>
        <div className={`wsheet ${ph ? '' : 'nophoto'}`}>
          {ph && (
            <figure className="spfig wplate">
              <img src={photoUrl(ph)} width={1600} height={1000} alt={`${a.name}: foto ${ph.kind === 'real' ? 'del arma real' : 'de la réplica de airsoft'}`} decoding="async" />
              <figcaption>
                {ph.kind === 'real' ? 'Arma real' : 'Réplica de airsoft'}.{ph.author && ` ${ph.author}.`}
                {ph.license && <> {ph.licenseUrl ? <a href={ph.licenseUrl} target="_blank" rel="noopener noreferrer">{ph.license}</a> : ph.license}.</>}
                {ph.source && <> <a href={ph.source} target="_blank" rel="noopener noreferrer">Wikimedia Commons</a></>}
              </figcaption>
            </figure>
          )}
          <div className="wbody">
            <div className="whead">
              <div>
                <h1>{a.name}</h1>
                <p className="wikilead">{a.maker}</p>
              </div>
              <div className="wactions">
                <Link className="ghost" href={`/comparar/?a=${a.id}`}>Comparar</Link>
                {montable && <Link className="primary" href={`/montar/?m=${a.variants.find(v => v.platform)!.platform}`}>Montar en 3D</Link>}
              </div>
            </div>

            {keys.length > 0 && (
              <div className="fkeys">
                {keys.map(([k, label]) => {
                  const c = k === 'calibre' ? ammo[0] : undefined;
                  return c
                    ? <Link className="fkey fkey-link" key={k} href={`/balas/${c.id}/`} title={`Ver la ficha de ${c.name}`}><span>{label}</span><b>{ref[k]}</b></Link>
                    : <div className="fkey" key={k}><span>{label}</span><b>{ref[k]}</b></div>;
                })}
              </div>
            )}

            <h2>Datos</h2>
            <div className="fspecs"><Rows specs={a.common} skip={keys.map(([k]) => k)} /></div>

            <h2>Variantes</h2>
            {a.variants.map(v => (
              <section className="wvar" key={v.id} id={v.id}>
                <h3>
                  <span>{v.name}</span>
                  {v.platform
                    ? <Link className="ghost sm" href={`/montar/?m=${v.platform}`}>Montar en 3D</Link>
                    : <i className="wtag">Solo ficha</i>}
                </h3>
                <div className="fspecs"><Rows specs={v.specs} /></div>
              </section>
            ))}
            <p className="src">Datos del arma real. Fuente: {a.common.fuente ?? 'sin indicar'}. Los valores varían según configuración y munición.</p>

            {ammo.length > 0 && (<>
              <h2>Munición</h2>
              <ul className="wlist">{ammo.map(c => <li key={c.id}><Link href={`/balas/${c.id}/`}>{c.name}</Link><span>{c.tagline}</span></li>)}</ul>
            </>)}

            <div className="wnav">
              {prev ? <Link className="ghost" href={`/armas/${prev.id}/`}>← {prev.name}</Link> : <span />}
              {next ? <Link className="ghost" href={`/armas/${next.id}/`}>{next.name} →</Link> : <span />}
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
