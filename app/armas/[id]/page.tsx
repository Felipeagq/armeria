import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import SiteNav from '@/components/SiteNav';
import SiteFooter from '@/components/SiteFooter';
import { Migas } from '@/components/Migas';
import FichaIndice from '@/components/FichaIndice';
import FichaVariantes from '@/components/FichaVariantes';
import { ARMAS, armaById, armaPhoto, refSpecs } from '@/three/data/armas';
import { datosFicha } from '@/three/data/ficha';
import { seccionesDe } from '@/three/data/ficha-indice';
import { photoUrl } from '@/three/data/photos';

type Props = { params: Promise<{ id: string }> };

export const dynamicParams = false;
export const generateStaticParams = () => ARMAS.map(a => ({ id: a.id }));

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const a = armaById((await params).id);
  if (!a) return {};
  const s = refSpecs(a);
  return { title: `${a.name}: ficha técnica`, description: `${a.name} (${a.maker}): ${[s.calibre, s.sistema, s.cadencia].filter(Boolean).join(', ')}. Datos del arma real y de su réplica de airsoft.` };
}

export default async function ArmaPage({ params }: Props) {
  const a = armaById((await params).id);
  if (!a) notFound();
  const i = ARMAS.indexOf(a);
  const prev = ARMAS[i - 1], next = ARMAS[i + 1];
  const ph = armaPhoto(a);
  const datos = datosFicha(a);
  const secciones = seccionesDe(datos);

  return (
    <>
      <SiteNav current="armas" />
      <main id="main" className="wikimain wide">
        <Migas items={[{ label: 'Armas', href: '/' }, { label: a.group, href: `/?grupo=${encodeURIComponent(a.group)}` }, { label: a.name }]} />
        <div className={`wsheet ${ph ? '' : 'nophoto'}`}>
          {ph && (
            <div className="wside">
              <figure className="spfig wplate">
                <div className={`wframe ${ph.fit ?? 'cutout'}`} style={ph.fit === 'scene' ? ({ '--ph': `url(${photoUrl(ph)})` } as React.CSSProperties) : undefined}>
                  <img src={photoUrl(ph)} width={1600} height={1000} alt={datos.foto?.alt ?? a.name} decoding="async" />
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
            </div>

            <FichaVariantes datos={datos} />

            <div className="wnav">
              {prev ? <Link className="ghost" href={`/armas/${prev.id}/`}>← {prev.name}</Link> : <span />}
              {next ? <Link className="ghost" href={`/armas/${next.id}/`}>{next.name} →</Link> : <span />}
            </div>
          </div>
        </div>
      </main>
      <SiteFooter ancho />
    </>
  );
}
