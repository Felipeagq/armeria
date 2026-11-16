import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import SiteNav from '@/components/SiteNav';
import SiteFooter from '@/components/SiteFooter';
import { Migas } from '@/components/Migas';
import { ACCESORIOS, accById, slugGrupo } from '@/three/data/accesorios';
import { armasCon, demo3d, genericosCon, TOTAL_3D } from '@/three/data/accesorios-compat';

type Props = { params: Promise<{ id: string }> };

export const dynamicParams = false;
export const generateStaticParams = () => ACCESORIOS.map(a => ({ id: a.id }));

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const a = accById((await params).id);
  if (!a) return {};
  return { title: `${a.nombre}: ficha técnica`, description: `${a.nombre}: ${a.resumen} Datos técnicos, ventajas, límites y armas del catálogo en las que se monta.` };
}

export default async function AccesorioPage({ params }: Props) {
  const a = accById((await params).id);
  if (!a) notFound();
  const i = ACCESORIOS.indexOf(a);
  const prev = ACCESORIOS[i - 1], next = ACCESORIOS[i + 1];
  const armas = armasCon(a);
  const genericos = genericosCon(a);
  const demo = demo3d(a);
  const ph = a.foto;

  return (
    <>
      <SiteNav current="accesorios" />
      <main id="main" className="wikimain wide">
        <Migas items={[{ label: 'Accesorios', href: '/accesorios/' }, { label: a.grupo, href: `/accesorios/#${slugGrupo(a.grupo)}` }, { label: a.nombre }]} />
        <div className={`wsheet ${ph ? '' : 'nophoto'}`}>
          {ph && (
            <figure className="spfig wplate">
              <img src={`/accesorios/${ph.file}`} width={1600} height={1000} alt={ph.alt} decoding="async" />
              <figcaption>
                {ph.alt}.{ph.author && ` ${ph.author}.`}
                {ph.license && <> {ph.licenseUrl ? <a href={ph.licenseUrl} target="_blank" rel="noopener noreferrer">{ph.license}</a> : ph.license}.</>}
                {ph.source && <> <a href={ph.source} target="_blank" rel="noopener noreferrer">Wikimedia Commons</a></>}
              </figcaption>
            </figure>
          )}
          <div className="wbody">
            <div className="whead">
              <div>
                <p className="crumbs wkind">{a.grupo}</p>
                <h1>{a.nombre}</h1>
                <p className="wikilead">{a.resumen}</p>
              </div>
              {demo && <div className="wactions"><Link className="primary" href={`/montar/?m=${demo.plataforma}&p=${demo.pieza}`}>Probar en 3D</Link></div>}
            </div>

            <div className="fkeys">{a.clave.map(([k, v]) => <div className="fkey" key={k}><span>{k}</span><b>{v}</b></div>)}</div>

            <h2>Datos</h2>
            <div className="fspecs">
              <dl>{a.datos.map(([k, v]) => <div className="sr" key={k}><dt>{k}</dt><dd>{v}</dd></div>)}</dl>
              <p className="src">Fuente: {a.fuente}. Valores típicos; varían según el fabricante y el modelo.</p>
            </div>

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

            {a.ejemplos && (<>
              <h2>Ejemplos reales</h2>
              <div className="wprose"><p>{a.ejemplos}</p></div>
            </>)}

            <h2>En airsoft</h2>
            <div className="wprose"><p>{a.airsoft}</p></div>

            <h2>Se monta en</h2>
            {armas.length === TOTAL_3D && <div className="wprose"><p>Todas las armas del catálogo con modelo 3D ({TOTAL_3D}){genericos.length > 0 && ' y estos cuerpos genéricos del constructor:'}{genericos.length === 0 && '.'}</p></div>}
            {(armas.length !== TOTAL_3D || genericos.length > 0) && (
              <ul className="wlist">
                {armas.length !== TOTAL_3D && armas.map(m => <li key={m.id}><Link href={`/armas/${m.id}/`}>{m.name}</Link><span>{m.maker}</span></li>)}
                {genericos.map(g => <li key={g.id}><Link href={`/montar/?m=${g.id}`}>{g.nombre}</Link><span>Cuerpo genérico del constructor 3D</span></li>)}
              </ul>
            )}

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
