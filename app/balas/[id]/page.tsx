import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import SiteNav from '@/components/SiteNav';
import SiteFooter from '@/components/SiteFooter';
import { Migas } from '@/components/Migas';
import { AMMO, ammoById, modelsUsing } from '@/three/data/ammo';

type Props = { params: Promise<{ id: string }> };

export const dynamicParams = false;
export const generateStaticParams = () => AMMO.map(c => ({ id: c.id }));

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const c = ammoById((await params).id);
  if (!c) return {};
  return { title: `${c.name}: munición`, description: `${c.name}: ${c.tagline} Dimensiones, carga típica y armas del catálogo que la usan.` };
}

export default async function BalaPage({ params }: Props) {
  const c = ammoById((await params).id);
  if (!c) notFound();
  const i = AMMO.indexOf(c);
  const prev = AMMO[i - 1], next = AMMO[i + 1];
  const ph = c.photo;
  const models = modelsUsing(c);

  return (
    <>
      <SiteNav current="balas" />
      <main id="main" className="wikimain wide">
        <Migas items={[{ label: 'Munición', href: '/balas/' }, { label: c.name }]} />
        <div className="wsheet">
          <figure className="spfig wplate">
            <img src={`/ammo/${ph.file}`} width={1600} height={1000} alt={ph.alt} decoding="async" />
            <figcaption>
              {ph.caption}. {ph.author}.{' '}
              {ph.licenseUrl ? <a href={ph.licenseUrl} target="_blank" rel="noopener noreferrer">{ph.license}</a> : ph.license}.{' '}
              <a href={ph.source} target="_blank" rel="noopener noreferrer">Wikimedia Commons</a>
            </figcaption>
          </figure>
          <div className="wbody">
            <h1>{c.name}</h1>
            <p className="wikilead">{c.tagline}</p>
            <div className="fkeys">{c.key.map(([k, v]) => <div className="fkey" key={k}><span>{k}</span><b>{v}</b></div>)}</div>

            <h2>Datos</h2>
            <div className="fspecs">
              <dl>{c.facts.map(([k, v]) => <div className="sr" key={k}><dt>{k}</dt><dd>{v}</dd></div>)}</dl>
              <p className="src">Fuente: {c.fuente}. Valores de la carga estándar; varían según fabricante, lote y longitud de cañón.</p>
            </div>

            <h2>Sobre este cartucho</h2>
            <div className="wprose">{c.about.map((p, k) => <p key={k}>{p}</p>)}</div>

            <h2>{c.kind === 'airsoft' ? 'Réplicas del catálogo' : 'Armas del catálogo que lo usan'}</h2>
            {models.length
              ? <ul className="wlist">{models.map(m => <li key={m.id}><Link href={`/armas/${m.id}/`}>{m.name}</Link><span>{m.maker}</span></li>)}</ul>
              : <div className="wprose"><p>Ninguna arma del catálogo usa este cartucho todavía. <Link href="/armas/buscar/">Busca un arma</Link> para consultarla.</p></div>}

            <div className="wnav">
              {prev ? <Link className="ghost" href={`/balas/${prev.id}/`}>← {prev.short}</Link> : <span />}
              {next ? <Link className="ghost" href={`/balas/${next.id}/`}>{next.short} →</Link> : <span />}
            </div>
          </div>
        </div>
      </main>
      <SiteFooter ancho />
    </>
  );
}
