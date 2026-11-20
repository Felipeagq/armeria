import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import SiteNav from '@/components/SiteNav';
import SiteFooter from '@/components/SiteFooter';
import { Migas } from '@/components/Migas';
import FichaVariantes from '@/components/FichaVariantes';
import Galeria from '@/components/Galeria';
import { IconChevron } from '@/components/icons';
import { getCatalogo } from '@/catalogo/datos';
import { datosFicha } from '@/catalogo/ficha';
import { refSpecs } from '@/catalogo/util';

type Props = { params: Promise<{ id: string }> };

// Las armas nuevas creadas desde el panel no existen en el build: se generan al primer acceso (y quedan en caché).
export const dynamicParams = true;
export const generateStaticParams = async () => (await getCatalogo()).armas.map(a => ({ id: a.id }));

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const a = (await getCatalogo()).armaById((await params).id);
  if (!a) return {};
  const s = refSpecs(a);
  return { title: `${a.name}: ficha técnica`, description: `${a.name} (${a.maker}): ${[s.calibre, s.sistema, s.cadencia].filter(Boolean).join(', ')}. Datos del arma real y de su réplica de airsoft.` };
}

export default async function ArmaPage({ params }: Props) {
  const cat = await getCatalogo();
  const a = cat.armaById((await params).id);
  if (!a) notFound();
  const i = cat.armas.indexOf(a);
  const prev = cat.armas[i - 1], next = cat.armas[i + 1];
  const ph = a.foto;
  const datos = datosFicha(cat, a);

  const placa = ph && (
    <figure className="spfig wplate dx-plate" data-tipo={ph.tipoFoto ?? 'real'}>
      <div className="dx-frame">
        <div className={`wframe ${ph.ajuste ?? 'cutout'}`} style={ph.ajuste === 'scene' ? ({ '--ph': `url(${ph.url})` } as React.CSSProperties) : undefined}>
          <img src={ph.url} width={1600} height={1000} alt={ph.alt || a.name} decoding="async" fetchPriority="high" />
        </div>
        <span className="dx-tag">{ph.tipoFoto === 'airsoft' ? 'Réplica de airsoft' : 'Arma real'}</span>
      </div>
      <figcaption>
        {ph.autor && `${ph.autor}. `}
        {ph.licencia && <>{ph.licenciaUrl ? <a href={ph.licenciaUrl} target="_blank" rel="noopener noreferrer">{ph.licencia}</a> : ph.licencia}.</>}
        {ph.fuenteUrl && <> <a href={ph.fuenteUrl} target="_blank" rel="noopener noreferrer">Wikimedia Commons</a></>}
      </figcaption>
    </figure>
  );

  return (
    <>
      <SiteNav current="armas" />
      <main id="main" className="wikimain dx">
        <Migas items={[{ label: 'Armas', href: '/' }, { label: a.group, href: `/?grupo=${encodeURIComponent(a.group)}` }, { label: a.name }]} />

        <FichaVariantes datos={datos} nombre={a.name} fabricante={a.maker} placa={placa} />

        <Galeria fotos={a.galeria} nombre={a.name} />

        <div className="wnav">
          {prev ? <Link className="ghost" href={`/armas/${prev.id}/`}><IconChevron className="ic-prev" />{prev.name}</Link> : <span />}
          {next ? <Link className="ghost" href={`/armas/${next.id}/`}>{next.name}<IconChevron className="ic-next" /></Link> : <span />}
        </div>
      </main>
      <SiteFooter ancho />
    </>
  );
}
