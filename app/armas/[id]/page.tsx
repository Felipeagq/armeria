import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import SiteNav from '@/components/SiteNav';
import { AccesoriosCompat } from '@/components/AccesoriosCompat';
import FichaIndice, { type ItemIndice } from '@/components/FichaIndice';
import { SistemaNotas } from '@/components/SistemaNotas';
import { accesoriosPara } from '@/three/data/accesorios-compat';
import { ammoForCalibre, energiaEnBoca } from '@/three/data/ammo';
import { ARMAS, SPEC_LABELS, armaById, armaPhoto, has3d, refSpecs, specRowsOf } from '@/three/data/armas';
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

/** Datos de una variante que se muestran como cifras (el resto, «Notas», va aparte). */
const STAT_KEYS: (keyof Specs)[] = ['calibre', 'peso', 'cañon', 'sistema', 'cadencia', 'velocidad', 'alcance', 'cargador', 'airsoft'];

/** Datos que se destacan arriba. */
const KEY_FACTS: [keyof Specs, string][] = [['calibre', 'Calibre'], ['peso', 'Peso'], ['cadencia', 'Cadencia'], ['alcance', 'Alcance eficaz']];

/** Separa la cifra principal de su matiz: «3,12–3,85 kg vacío (11"–20")» → «3,12–3,85 kg» + «vacío (11"–20")». Sin cifra al principio, devuelve null. */
function partirCifra(v: string): { cifra: string; matiz: string } | null {
  const m = v.match(/^((?:Hasta\s+)?≈?\s*\d[\d.,]*(?:\s?[–×x-]\s?\d[\d.,]*)*(?:\s?(?:mm|kg|g|m\/s|m|J|disp\.\/min))?)(?=\s|$|·|\()\s*(.*)$/);
  return m && m[1].trim() ? { cifra: m[1].trim(), matiz: m[2].trim() } : null;
}

function Rows({ specs, skip = [] }: { specs: Specs; skip?: string[] }) {
  return <dl>{specRowsOf(specs).filter(([k]) => !skip.includes(k)).map(([k, label]) => <div className="sr" key={k}><dt>{label}</dt><dd>{specs[k]}{(k === 'sistema' || k === 'airsoft') && <SistemaNotas texto={specs[k]} campo={k} />}</dd></div>)}</dl>;
}

export default async function ArmaPage({ params }: Props) {
  const a = armaById((await params).id);
  if (!a) notFound();
  const i = ARMAS.indexOf(a);
  const prev = ARMAS[i - 1], next = ARMAS[i + 1];
  const ph = armaPhoto(a);
  const ref = refSpecs(a);
  const ammo = ammoForCalibre(ref.calibre);
  // Un dato sin cifra («Depende del cañón y la munición») no cabe en una tesela: queda en la tabla.
  const keys = KEY_FACTS.filter(([k]) => ref[k] && (k !== 'alcance' || partirCifra(String(ref[k]))));
  const energia = energiaEnBoca(ref.velocidad, ammo[0]);
  const montable = has3d(a);
  const stats = SPEC_LABELS.filter(([k]) => STAT_KEYS.includes(k) && a.variants.some(v => v.specs[k]));
  const hayNotas = a.variants.some(v => v.specs.extra);
  const hayVariantes = a.variants.some(v => specRowsOf(v.specs).length || v.platform);
  const nAcc = accesoriosPara(a).length;
  const secciones: ItemIndice[] = [
    { id: 'sec-datos', label: 'Datos' },
    ...(ref.airsoft ? [{ id: 'sec-replica', label: 'Réplica de airsoft' }] : []),
    ...(hayVariantes ? [{ id: 'sec-variantes', label: 'Variantes', n: a.variants.length }] : []),
    ...(ammo.length ? [{ id: 'sec-municion', label: 'Munición' }] : []),
    ...(nAcc ? [{ id: 'sec-accesorios', label: 'Accesorios', n: nAcc }] : []),
  ];

  return (
    <>
      <SiteNav current="armas" />
      <main id="main" className="wikimain wide">
        <p className="crumbs"><Link href="/">← Armas</Link></p>
        <div className={`wsheet ${ph ? '' : 'nophoto'}`}>
          {ph && (
            <div className="wside">
            <figure className="spfig wplate">
              <div className={`wframe ${ph.fit ?? 'cutout'}`} style={ph.fit === 'scene' ? ({ '--ph': `url(${photoUrl(ph)})` } as React.CSSProperties) : undefined}>
                <img src={photoUrl(ph)} width={1600} height={1000} alt={`${a.name}: foto ${ph.kind === 'real' ? 'del arma real' : 'de la réplica de airsoft'}`} decoding="async" />
              </div>
              <figcaption>
                {ph.kind === 'real' ? 'Arma real' : 'Réplica de airsoft'}.{ph.author && ` ${ph.author}.`}
                {ph.license && <> {ph.licenseUrl ? <a href={ph.licenseUrl} target="_blank" rel="noopener noreferrer">{ph.license}</a> : ph.license}.</>}
                {ph.source && <> <a href={ph.source} target="_blank" rel="noopener noreferrer">Wikimedia Commons</a></>}
              </figcaption>
            </figure>
            <FichaIndice variante="lateral" items={secciones} />
            </div>
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

            {(keys.length > 0 || energia) && (
              <div className="fkeys plate" style={{ '--fk': Math.min(keys.length + (energia ? 1 : 0), 3) } as React.CSSProperties}>
                {keys.map(([k, label]) => {
                  const c = k === 'calibre' ? ammo[0] : undefined;
                  const t = String(ref[k]); const pc = partirCifra(t);
                  const valor = pc ? <b className="num">{pc.cifra}{pc.matiz && <small>{pc.matiz}</small>}</b> : <b>{t}</b>;
                  return c
                    ? <Link className="fkey fkey-link" key={k} href={`/balas/${c.id}/`} title={`Ver la ficha de ${c.name}`}><span>{label}</span>{valor}</Link>
                    : <div className="fkey" key={k}><span>{label}</span>{valor}</div>;
                })}
                {energia && <div className="fkey" title="Energía en boca: ½·m·v², con la masa del proyectil del cartucho y la velocidad inicial de esta arma"><span>Energía en boca</span><b className="num">{energia.valor}<small>{energia.base}</small></b></div>}
              </div>
            )}

            <FichaIndice variante="chips" items={secciones} />

            <h2 id="sec-datos">Datos</h2>
            <div className="fspecs"><Rows specs={a.common} skip={[...keys.map(([k]) => k), 'airsoft']} /></div>

            {ref.airsoft && (<>
              <h2 id="sec-replica">Réplica de airsoft</h2>
              <div className="wrep">
                <p>{ref.airsoft}</p>
                <SistemaNotas texto={ref.airsoft} campo="airsoft" />
              </div>
            </>)}

            {hayVariantes && (<>
              <h2 id="sec-variantes">Variantes</h2>
              <div className="wvs" data-multi={a.variants.length > 1 || undefined} style={{ '--n': a.variants.length, '--rows': 2 + stats.length + (hayNotas ? 1 : 0) } as React.CSSProperties}>
                {a.variants.map(v => (
                  <section className="wv" key={v.id} id={v.id} aria-labelledby={`v-${v.id}`}>
                    <div className="wv-head">
                      <h3 id={`v-${v.id}`}>{v.name}</h3>
                      {!v.platform && <i className="wtag">Solo ficha</i>}
                    </div>
                    {stats.map(([k, label]) => {
                      const t = v.specs[k] ? String(v.specs[k]) : '';
                      const pc = t ? partirCifra(t) : null;
                      return t
                        ? <div className="wv-stat" key={k}>
                            <span className="wv-k">{label}</span>
                            {pc ? <><b>{pc.cifra}</b>{pc.matiz && <small>{pc.matiz}</small>}</> : <b className="txt">{t}</b>}
                            {(k === 'sistema' || k === 'airsoft') && <SistemaNotas texto={t} campo={k} />}
                          </div>
                        : <div className="wv-stat none" key={k} aria-hidden="true"><span className="wv-k">{label}</span><b>—</b></div>;
                    })}
                    {hayNotas && (v.specs.extra
                      ? <p className="wv-note"><span className="wv-k">Notas</span>{v.specs.extra}</p>
                      : <div className="wv-note none" aria-hidden="true" />)}
                    <div className={`wv-act${v.platform ? '' : ' none'}`}>{v.platform && <Link className="ghost sm" href={`/montar/?m=${v.platform}`} aria-label={`Montar en 3D: ${a.name} ${v.name}`}>Montar en 3D</Link>}</div>
                  </section>
                ))}
              </div>
            </>)}
            <p className="src">Datos del arma real. Fuente: {a.common.fuente ?? 'sin indicar'}. Los valores varían según configuración y munición.</p>

            {ammo.length > 0 && (<>
              <h2 id="sec-municion">Munición</h2>
              <ul className="wammo">
                {ammo.map(c => (
                  <li key={c.id}>
                    <Link href={`/balas/${c.id}/`}>
                      <span className="wi-thumb"><img src={`/ammo/${c.photo.file}`} alt="" width={160} height={120} loading="lazy" decoding="async" /></span>
                      <span className="wa-name">{c.name}</span>
                      <span className="wa-tag">{c.tagline}</span>
                      <span className="wa-key">{c.key.map(([l, v]) => <span key={l}><i>{l}</i>{v}</span>)}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </>)}

            <AccesoriosCompat arma={a} />

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
