import type { Metadata } from 'next';
import Link from 'next/link';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import SiteNav from '@/components/SiteNav';
import SiteFooter from '@/components/SiteFooter';
import { Migas } from '@/components/Migas';
import BotonIA from '@/components/BotonIA';
import { buscar } from '@/server/cascada';
import { generarFicha, iaDisponible, iaSlug, permitir } from '@/server/ia';
import { getFicha, putFicha } from '@/server/store';
import { refSpecs } from '@/catalogo/util';
import { IconGun, IconSearch } from '@/components/icons';

export const dynamic = 'force-dynamic';
export const metadata: Metadata = { title: 'Buscar arma', robots: { index: false } };

type Props = { searchParams: Promise<{ q?: string; error?: string }> };

async function generar(formData: FormData) {
  'use server';
  const q = String(formData.get('q') ?? '').trim().slice(0, 80);
  if (!q) redirect('/armas/buscar/');
  const volver = (error: string) => redirect(`/armas/buscar/?q=${encodeURIComponent(q)}&error=${encodeURIComponent(error)}`);
  if (!iaDisponible()) volver('La búsqueda con IA no está activada en este servidor.');
  const slug = iaSlug(q);
  if (await getFicha(slug)) redirect(`/armas/ext/${encodeURIComponent(slug)}/`);
  const ip = (await headers()).get('x-forwarded-for')?.split(',')[0].trim() || 'local';
  const permiso = permitir(ip); if (!permiso.ok) volver(permiso.motivo);
  let ficha;
  try { ficha = await generarFicha(q); } catch (e) { console.error('IA:', (e as Error).message); volver('La consulta con IA falló. Inténtalo de nuevo en unos minutos.'); }
  if (!ficha) volver(`La IA no ha podido identificar «${q}» como un arma real.`);
  await putFicha(ficha!);
  redirect(`/armas/ext/${encodeURIComponent(ficha!.slug)}/`);
}

export default async function BuscarPage({ searchParams }: Props) {
  const { q = '', error } = await searchParams;
  const r = await buscar(q);
  const nada = !r.catalogo.length && !r.guardadas.length && !r.wikipedia.length;
  const ia = iaDisponible();
  return (
    <>
      <SiteNav current="armas" />
      <main id="main" className="wikimain">
        <Migas items={[{ label: 'Armas', href: '/' }, { label: 'Buscar' }]} />
        <h1>Buscar arma</h1>
        <form className="wsearch" action="/armas/buscar/" method="get" role="search">
          <label className="search"><IconSearch /><input type="search" name="q" defaultValue={q} aria-label="Nombre del arma" placeholder="Nombre del arma, p. ej. Glock 17, TTI Viper, CZ 75…" autoComplete="off" enterKeyHint="search" /></label>
        </form>
        {error && <p className="wnote err">{error}</p>}
        {q && (<>
          {r.catalogo.length > 0 && (<>
            <h2>En el catálogo</h2>
            <ul className="wres">{r.catalogo.map(a => { const s = refSpecs(a); return (
              <li key={a.id}><Link href={`/armas/${a.id}/`}><b>{a.name}</b><span>{[a.maker, s.calibre].filter(Boolean).join(', ')}</span></Link><i className="wbadge ok">Catálogo</i></li>
            ); })}</ul>
          </>)}
          {r.guardadas.length > 0 && (<>
            <h2>Consultadas anteriormente</h2>
            <ul className="wres">{r.guardadas.map(f => (
              <li key={f.slug}><Link href={`/armas/ext/${encodeURIComponent(f.slug)}/`}><b>{f.name}</b><span>{[f.maker, f.specs.calibre].filter(Boolean).join(', ')}</span></Link>{f.origen === 'ia' && <i className="wbadge ia">IA, sin verificar</i>}</li>
            ))}</ul>
          </>)}
          {r.wikipedia.length > 0 && (<>
            <h2>En Wikipedia</h2>
            <ul className="wres">{r.wikipedia.map(c => (
              <li key={c.slug}>
                <Link href={`/armas/ext/${encodeURIComponent(c.slug)}/`}>
                  {c.thumb ? <img src={c.thumb} alt="" width={72} height={48} loading="lazy" /> : <span className="wres-ph"><IconGun /></span>}
                  <b>{c.title}</b><span>{c.descripcion ?? 'Artículo de arma'}{c.lang === 'en' ? ' (en inglés)' : ''}</span>
                </Link>
              </li>
            ))}</ul>
            <p className="src">Los datos se leen de la infobox del artículo al abrir la ficha. Texto bajo licencia CC BY-SA; cada ficha enlaza su artículo.</p>
          </>)}
          <h2>{nada ? 'Sin resultados' : '¿No es lo que buscas?'}</h2>
          {nada && <p className="muted">«{q}» no está en el catálogo ni tiene artículo con ficha de arma en Wikipedia (español o inglés).</p>}
          {ia ? (
            <form action={generar} className="wia">
              <input type="hidden" name="q" value={q} />
              <BotonIA label={`Generar ficha de «${q}» con IA`} />
              <p className="src">Un modelo con búsqueda web rellena la ficha y cita sus fuentes. Tarda 10–40 s. El resultado se marca como <b>sin verificar</b> hasta que se revise.</p>
            </form>
          ) : (
            <p className="muted">La búsqueda asistida por IA no está activada en este servidor (variable <code>ANTHROPIC_API_KEY</code>).</p>
          )}
        </>)}
      </main>
      <SiteFooter />
    </>
  );
}
