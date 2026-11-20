import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import SiteNav from '@/components/SiteNav';
import SiteFooter from '@/components/SiteFooter';
import { Migas } from '@/components/Migas';
import Galeria from '@/components/Galeria';
import { SistemaNotas } from '@/components/SistemaNotas';
import { MoaPuntos } from '@/components/MoaPuntos';
import { getCatalogo } from '@/catalogo/datos';
import { terminoLite } from '@/catalogo/ficha';
import { slugGrupo, textoAcc } from '@/catalogo/util';
import { ENABLE_3D } from '@/config';

type Props = { params: Promise<{ id: string }> };

// Los accesorios nuevos creados desde el panel no existen en el build: se generan al primer acceso (y quedan en caché).
export const dynamicParams = true;
export const generateStaticParams = async () => (await getCatalogo()).accesorios.map(a => ({ id: a.id }));

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const a = (await getCatalogo()).accById((await params).id);
  if (!a) return {};
  return { title: `${a.nombre}: ficha técnica`, description: `${a.nombre} (${a.tecnico[0]}): ${a.resumen} Datos técnicos, ventajas, límites y armas del catálogo en las que se monta.` };
}

export default async function AccesorioPage({ params }: Props) {
  const cat = await getCatalogo();
  const a = cat.accById((await params).id);
  if (!a) notFound();
  const i = cat.accesorios.indexOf(a);
  const prev = cat.accesorios[i - 1], next = cat.accesorios[i + 1];
  const armas = cat.armasConAccesorio(a);
  const totalConAcc = cat.armasConAccesorios.length;
  // Enlace de prueba al constructor 3D (solo con el interruptor encendido): una plataforma donde encaja, mejor el HK416 A5
  const plataformas = armas.flatMap(x => x.variants.flatMap(v => (v.platform ? [v.platform] : [])));
  const plataforma = plataformas.includes('hk416_a5') ? 'hk416_a5' : plataformas[0];
  const demo = plataforma && a.partes[0] ? { plataforma, pieza: a.partes[0] } : undefined;
  const ph = a.foto;
  const terminos = cat.sistemasDe(textoAcc(a), 'accesorio');
  const conMoa = a.grupo === 'Ópticas' && /\bMOA\b/.test(textoAcc(a));

  return (
    <>
      <SiteNav current="accesorios" />
      <main id="main" className="wikimain wide">
        <Migas items={[{ label: 'Accesorios', href: '/accesorios/' }, { label: a.grupo, href: `/accesorios/#${slugGrupo(a.grupo)}` }, { label: a.nombre }]} />
        <div className={`wsheet ${ph ? '' : 'nophoto'}`}>
          {ph && (
            <figure className="spfig wplate">
              <div className="dx-frame">
                <div className="wframe scene" style={{ '--ph': `url(${ph.url})` } as React.CSSProperties}><img src={ph.url} width={1600} height={1000} alt={ph.alt} decoding="async" fetchPriority="high" /></div>
              </div>
              <figcaption>
                {ph.alt}.{ph.autor && ` ${ph.autor}.`}
                {ph.licencia && <> {ph.licenciaUrl ? <a href={ph.licenciaUrl} target="_blank" rel="noopener noreferrer">{ph.licencia}</a> : ph.licencia}.</>}
                {ph.fuenteUrl && <> <a href={ph.fuenteUrl} target="_blank" rel="noopener noreferrer">Wikimedia Commons</a></>}
              </figcaption>
            </figure>
          )}
          <div className="wbody">
            <div className="whead">
              <div>
                <h1>{a.nombre}</h1>
                <p className="wtec"><span>En inglés</span> <span lang="en">{a.tecnico.join(' · ')}</span></p>
                <p className="wikilead">{a.resumen}</p>
              </div>
              {ENABLE_3D && demo && <div className="wactions"><Link className="primary" href={`/montar/?m=${demo.plataforma}&p=${demo.pieza}`}>Probar en 3D</Link></div>}
            </div>

            <div className="fkeys">{a.clave.map(([k, v]) => <div className="fkey" key={k}><span>{k}</span><b>{v}</b></div>)}</div>

            <h2>Datos</h2>
            <div className="fspecs">
              <dl>{a.datos.map(([k, v]) => <div className="sr" key={k}><dt>{k}</dt><dd>{v}</dd></div>)}</dl>
              <p className="src">Fuente: {a.fuente}. Valores típicos; varían según el fabricante y el modelo.</p>
            </div>

            {terminos.length > 0 && (<>
              <h2>Términos de esta ficha</h2>
              <SistemaNotas items={terminos.map(terminoLite)} />
            </>)}

            {conMoa && (<>
              <h2>El punto, a escala (MOA)</h2>
              <MoaPuntos />
            </>)}

            <h2>Cómo funciona</h2>
            <div className="wprose">{a.como.map((p, k) => <p key={k}>{p}</p>)}</div>

            {a.variantes && (<>
              <h2>Tipos</h2>
              <div className="fspecs"><dl>{a.variantes.map(([k, v]) => <div className="sr" key={k}><dt>{k}</dt><dd>{v}</dd></div>)}</dl></div>
            </>)}

            <h2>Ventajas y límites</h2>
            <div className="wpc">
              <div><h3>Ventajas</h3><ul className="wlist">{a.pros.map(t => <li key={t}>{t}</li>)}</ul></div>
              <div><h3>Límites</h3><ul className="wlist">{a.contras.map(t => <li key={t}>{t}</li>)}</ul></div>
            </div>

            {a.modelos.length > 0 && (<>
              <h2>Modelos reales</h2>
              <ul className="wmodelos" lang="en">{a.modelos.map(m => { const [n, nota] = typeof m === 'string' ? [m, ''] : m; return <li key={n}><b>{n}</b>{nota && <span lang="es">{nota}</span>}</li>; })}</ul>
            </>)}

            <h2>En airsoft</h2>
            <div className="wprose"><p>{a.airsoft}</p></div>

            <h2>Se monta en</h2>
            {armas.length === 0
              ? <div className="wprose"><p>Todavía no hay armas del catálogo asociadas a este accesorio.</p></div>
              : armas.length === totalConAcc
                ? <div className="wprose"><p>Todas las armas del catálogo con piezas compatibles ({totalConAcc}).</p></div>
                : <ul className="wlist">{armas.map(m => <li key={m.id}><Link href={`/armas/${m.id}/`}>{m.name}</Link><span>{m.maker}</span></li>)}</ul>}

            <Galeria fotos={a.galeria} nombre={a.nombre} />

            <div className="wnav">
              {prev ? <Link className="ghost" href={`/accesorios/${prev.id}/`}>← {prev.nombre}</Link> : <span />}
              {next ? <Link className="ghost" href={`/accesorios/${next.id}/`}>{next.nombre} →</Link> : <span />}
            </div>
          </div>
        </div>
      </main>
      <SiteFooter ancho />
    </>
  );
}
