import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import SiteNav from '@/components/SiteNav';
import { AMMO, ammoById, modelsUsing } from '@/three/data/ammo';

type Props = { params: Promise<{ id: string }> };

export const dynamicParams = false;
export const generateStaticParams = () => AMMO.map(c => ({ id: c.id }));

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const c = ammoById((await params).id);
  if (!c) return {};
  return { title: `${c.name} — Munición | Armería 3D`, description: `${c.name}: ${c.tagline} Dimensiones, carga típica y armas del catálogo que la usan.` };
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
      <main className="wikimain">
        <p className="crumbs"><Link href="/balas/">← Munición</Link></p>
        <figure className="spfig wfig">
          <img src={`/ammo/${ph.file}`} alt={ph.alt} decoding="async" />
          <figcaption>
            {ph.caption} · {ph.author} ·{' '}
            {ph.licenseUrl ? <a href={ph.licenseUrl} target="_blank" rel="noopener noreferrer">{ph.license}</a> : ph.license} ·{' '}
            <a href={ph.source} target="_blank" rel="noopener noreferrer">Wikimedia Commons</a>
          </figcaption>
        </figure>
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
        <ul className="wlist">{models.map(m => <li key={m.id}>{m.name}<span>{m.maker}</span></li>)}</ul>
        <p className="muted" style={{ marginTop: 10 }}>Abre el <Link href="/" style={{ color: 'var(--accent2)' }}>constructor 3D</Link> para ver cada arma y su ficha técnica.</p>

        <div className="wnav">
          {prev ? <Link className="ghost" href={`/balas/${prev.id}/`}>← {prev.short}</Link> : <span />}
          {next ? <Link className="ghost" href={`/balas/${next.id}/`}>{next.short} →</Link> : <span />}
        </div>
      </main>
    </>
  );
}
