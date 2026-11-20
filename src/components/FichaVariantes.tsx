'use client';
// Cuerpo de la ficha de un arma: una variante activa gobierna las cifras, la ficha técnica, la munición y los accesorios.
// La variante elegida se guarda en la URL (?v=id): al compartir el enlace se ve la misma. Sin JS, se muestra la primera.
import { useSyncExternalStore, type KeyboardEvent, type ReactNode } from 'react';
import Link from 'next/link';
import FichaIndice from './FichaIndice';
import { SistemaNotas } from './SistemaNotas';
import type { DatosFicha, ParCifra as Par, VistaVariante } from '@/catalogo/tipos';
import { filasComparar, hayReplica, seccionesDe, textoPar, valorFila } from '@/catalogo/ficha-indice';
import { ENABLE_3D } from '@/config';

const EVENTO = 'ficha-variante';
const suscribir = (cb: () => void) => {
  window.addEventListener('popstate', cb); window.addEventListener(EVENTO, cb);
  return () => { window.removeEventListener('popstate', cb); window.removeEventListener(EVENTO, cb); };
};
const leerVariante = () => new URLSearchParams(window.location.search).get('v') ?? '';

function Cifra({ p }: { p: Par }) {
  return p.txt ? <b className="txt">{p.c}</b> : <><b>{p.c}</b>{p.m && <small>{p.m}</small>}</>;
}

export default function FichaVariantes({ datos, nombre, fabricante, placa }: { datos: DatosFicha; nombre: string; fabricante: string; /** Placa de espécimen (foto principal), ya renderizada en el servidor. */ placa?: ReactNode }) {
  const vs = datos.variantes;
  const pedida = useSyncExternalStore(suscribir, leerVariante, () => '');
  const v: VistaVariante = vs.find(x => x.id === pedida) ?? vs[0];
  const varias = vs.length > 1;

  const elegir = (id: string) => {
    const u = new URL(window.location.href); u.searchParams.set('v', id);
    window.history.replaceState(null, '', u); window.dispatchEvent(new Event(EVENTO));
  };
  const teclas = (e: KeyboardEvent<HTMLDivElement>) => {
    const d = ({ ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 } as Record<string, number>)[e.key]; if (!d) return;
    e.preventDefault();
    const i = (vs.indexOf(v) + d + vs.length) % vs.length;
    elegir(vs[i].id); e.currentTarget.querySelectorAll<HTMLElement>('[role=radio]')[i]?.focus();
  };

  // Seis cifras en dos filas. Un alcance sin cifra («Depende del cañón») no cabe en una tesela: pasa a la ficha técnica.
  const teselas: { l: string; p?: Par; href?: string; title?: string }[] = [
    { l: 'Calibre', p: v.calibre, href: v.cartucho ? `/balas/${v.cartucho.id}/` : undefined },
    { l: 'Cañón', p: v.canon },
    { l: 'Peso', p: v.peso },
    { l: 'Cadencia', p: v.cadencia },
    { l: 'Alcance eficaz', p: v.alcance && !v.alcance.txt ? v.alcance : undefined },
    { l: 'Energía en boca', p: v.energia, title: 'Energía en boca: ½·m·v², con la masa del proyectil del cartucho y la velocidad inicial de esta variante' },
  ];
  const alcanceTxt = v.alcance?.txt ? v.alcance : undefined;
  const filas = filasComparar(vs);
  const secciones = seccionesDe(datos);
  const terminos = datos.terminosAirsoft;

  return (
    <>
      <div className={`dx-hero${placa ? '' : ' nophoto'}`}>
        {placa}
        <div className="dx-readout">
          <h1>{nombre}</h1>
          <p className="dx-maker">{fabricante}</p>
          {varias ? (
            <div className="fv-var">
              <span id="fv-var-l">Variante</span>
              <div className="fv-seg" role="radiogroup" aria-labelledby="fv-var-l" onKeyDown={teclas}>
                {vs.map(x => (
                  <button key={x.id} type="button" role="radio" aria-checked={x === v} tabIndex={x === v ? 0 : -1} onClick={() => elegir(x.id)}>{x.nombre}</button>
                ))}
              </div>
            </div>
          ) : v.nombre !== 'Estándar' && <p className="fv-one">{v.nombre}</p>}

          <div className="fv-keys">
            {teselas.filter(t => t.p).map(t => {
              const cuerpo = <><span className="l">{t.l}</span><span className="v"><Cifra p={t.p!} /></span></>;
              return t.href
                ? <Link key={t.l} className="fv-k link" href={t.href} title={`Ver la ficha de ${v.cartucho?.nombre}`}>{cuerpo}</Link>
                : <div key={t.l} className="fv-k" title={t.title}>{cuerpo}</div>;
            })}
          </div>

          <div className="fv-act">
            {ENABLE_3D && v.plataforma && <Link className="primary" href={`/montar/?m=${v.plataforma}`}>{varias ? `Montar ${v.nombre} en 3D` : 'Montar en 3D'}</Link>}
            <Link className="ghost" href={`/comparar/?a=${datos.id}`}>Comparar</Link>
          </div>
        </div>
      </div>

      <FichaIndice variante="chips" items={secciones} />

      <section className="fv-zone" aria-labelledby="fv-real">
        <h2 id="fv-real">Arma real</h2>
        <p className="fv-lead">Datos {varias ? 'de la variante elegida' : 'del arma real'}.{datos.fuente && ` Fuente: ${datos.fuente}.`}</p>
        <div className={`fv-blk${v.cartucho ? ' fv-two' : ''}`}>
          <div>
            <h3 id="sec-ficha">Ficha técnica</h3>
            <div className="fspecs"><dl>
              {v.velocidad && <div className="sr"><dt>Velocidad inicial</dt><dd>{textoPar(v.velocidad)}</dd></div>}
              {alcanceTxt && <div className="sr"><dt>Alcance eficaz</dt><dd>{alcanceTxt.c}</dd></div>}
              {v.cargador && <div className="sr"><dt>Cargador</dt><dd>{textoPar(v.cargador)}</dd></div>}
              {v.sistema && <div className="sr"><dt>Sistema / cerrojo</dt><dd>{v.sistema}<SistemaNotas items={v.terminosSistema} /></dd></div>}
              {v.notas && <div className="sr"><dt>Notas</dt><dd>{v.notas}</dd></div>}
            </dl></div>
          </div>
          {v.cartucho && (
            <div>
              <h3 id="sec-municion">Munición</h3>
              <Link className="fv-ammo" href={`/balas/${v.cartucho.id}/`}>
                <span className="wi-thumb"><img src={v.cartucho.foto} alt="" width={160} height={120} loading="lazy" decoding="async" /></span>
                <b>{v.cartucho.nombre}</b>
                <span className="t">{v.cartucho.lema}</span>
                <span className="k">{v.cartucho.clave.map(([l, x]) => <span key={l}><i>{l}</i>{x}</span>)}</span>
              </Link>
            </div>
          )}
        </div>
        {filas.length > 0 && (
          <div className="fv-blk">
            <h3 id="sec-comparar">Comparar variantes</h3>
            <div className="fv-tw" role="region" aria-label="Tabla de comparación de variantes" tabIndex={0}>
              <table className="fv-cmp">
                <thead><tr><th scope="col"><span className="sr-only">Dato</span></th>{vs.map(x => <th key={x.id} scope="col" className={x === v ? 'on' : undefined}>{x.nombre}</th>)}</tr></thead>
                <tbody>
                  {filas.map(([etiqueta, k]) => (
                    <tr key={k}><th scope="row">{etiqueta}</th>{vs.map(x => <td key={x.id} className={x === v ? 'on' : undefined}>{valorFila(x, k) || <span className="muted">—</span>}</td>)}</tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="src">Solo las filas que difieren. Los valores varían según configuración y munición.</p>
          </div>
        )}
      </section>

      {hayReplica(datos) && (
        <section className="fv-zone" aria-labelledby="fv-rep">
          <h2 id="fv-rep">Réplica de airsoft</h2>
          <p className="fv-lead">Cómo se traduce al airsoft y qué se le puede montar.</p>
          {datos.airsoft && (
            <div className="fv-blk">
              <h3 id="sec-sistema">Sistema</h3>
              <p className="fv-air">{datos.airsoft}</p>
              {terminos.length > 0 && (
                <div className="fv-sys">
                  {terminos.map(s => (
                    <div key={s.id} className="fv-sysi">
                      <b>{s.sigla ?? s.nombre}</b>{s.apodo && <span>{s.apodo}</span>}
                      <details><summary>Cómo funciona</summary><p>{s.corto} <Link href={`/sistemas/#${s.id}`} aria-label={`Más sobre ${s.nombre}`}>Más</Link></p></details>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
          {ENABLE_3D && v.plataforma && (
            <div className="fv-build">
              <div className="fv-vp">
                {datos.foto && (
                  <div className={`wframe ${datos.foto.fit ?? 'cutout'}`} style={datos.foto.fit === 'scene' ? ({ '--ph': `url(${datos.foto.src})` } as React.CSSProperties) : undefined}>
                    <img src={datos.foto.src} alt="" width={1600} height={1000} loading="lazy" decoding="async" />
                  </div>
                )}
              </div>
              <div className="tx">
                <h3>Monta el {datos.nombre} en 3D</h3>
                <p>{v.puntos.length > 0 ? `Elige ${v.puntos.slice(0, -1).join(', ').toLowerCase()}${v.puntos.length > 1 ? ' y ' : ''}${v.puntos[v.puntos.length - 1].toLowerCase()} sobre el modelo.` : 'Elige piezas sobre el modelo.'}{v.nAcc > 0 && ` ${v.nAcc} accesorios compatibles.`}</p>
                <Link className="primary" href={`/montar/?m=${v.plataforma}`}>Abrir el constructor</Link>
              </div>
            </div>
          )}
          {v.acc.length > 0 && (
            <div className="fv-blk">
              <h3 id="sec-accesorios">Accesorios compatibles<span className="n">{v.nAcc}</span></h3>
              <div className="fv-acc">
                {v.acc.map(g => (
                  <div className="row" key={g.g}>
                    <div className="cat">{g.g}<span>{g.items.length}</span></div>
                    <div className="fv-chips">
                      {g.items.map(i => (
                        <Link key={i.id} className="fv-chip" href={`/accesorios/${i.id}/`}>
                          {i.foto && <span className="th"><img src={i.foto} alt="" width={24} height={24} loading="lazy" decoding="async" /></span>}{i.n}
                        </Link>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
              <p className="src">{ENABLE_3D ? 'Los que se pueden montar en el constructor 3D' : 'Los que encajan en este arma'}{varias ? ' con la variante elegida' : ''}. Cada ficha reúne sus datos técnicos.</p>
            </div>
          )}
        </section>
      )}
    </>
  );
}
