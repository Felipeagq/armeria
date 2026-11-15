'use client';
// Comparador: de 2 a 3 armas (o variantes de una misma arma) en columnas. En móvil la tabla se convierte en una lista
// por campo. La selección vive en la URL (?a=hk416:a5,m4&dif=1): se lee al montar y se escribe con replaceState.
// Solo recibe datos serializados: aquí no entra three.
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useState } from 'react';
import type { ArmaComp } from '@/three/data/armas';
import { SPEC_LABELS } from '@/three/data/spec-labels';
import type { Specs } from '@/three/types';
import { IconClose, IconGun } from './icons';

const MAX = 3;
interface Col { id: string; v: string }

/** Comparaciones de ejemplo (solo se ofrecen las que existen en el catálogo). */
const EJEMPLOS: string[][] = [['m4', 'hk416'], ['ak74m', 'ak12'], ['hk416:a5', 'hk416:a8'], ['scar', 'g36', 'bren2']];

function parse(raw: string | null, armas: ArmaComp[]): Col[] {
  const out: Col[] = [];
  for (const tok of (raw ?? '').split(',')) {
    let a = armas.find(x => x.id === tok), v = '';
    if (!a) { const i = tok.lastIndexOf(':'); if (i > 0) { a = armas.find(x => x.id === tok.slice(0, i)); v = tok.slice(i + 1); } }
    if (!a) continue;
    const vid = a.variants.some(x => x.id === v) ? v : a.variants[0].id;
    if (out.some(c => c.id === a.id && c.v === vid)) continue;
    out.push({ id: a.id, v: vid });
    if (out.length === MAX) break;
  }
  return out;
}
const same = (a: string, b: string) => a.trim().toLowerCase() === b.trim().toLowerCase();

export default function Comparador({ armas }: { armas: ArmaComp[] }) {
  const sp = useSearchParams();
  const [cols, setCols] = useState<Col[]>(() => parse(sp.get('a'), armas));
  const [dif, setDif] = useState(() => sp.get('dif') === '1');
  const byId = (id: string) => armas.find(a => a.id === id);

  const commit = (c: Col[], d: boolean) => {
    setCols(c); setDif(d);
    const u = new URL(window.location.href);
    const enc = c.map(x => (byId(x.id)?.variants[0].id === x.v ? x.id : `${x.id}:${x.v}`)).join(',');
    if (enc) u.searchParams.set('a', enc); else u.searchParams.delete('a');
    if (d) u.searchParams.set('dif', '1'); else u.searchParams.delete('dif');
    window.history.replaceState(null, '', u.pathname + u.search + u.hash);
  };

  const datos = cols.flatMap(c => {
    const a = byId(c.id); const vr = a?.variants.find(x => x.id === c.v);
    return a && vr ? [{ c, a, vr, s: { ...a.common, ...vr.specs } as Specs }] : [];
  });
  const filas = [
    ...SPEC_LABELS.map(([k, l]) => ({ k: String(k), l, vals: datos.map(d => d.s[k] ?? '') })),
    { k: '3d', l: 'Constructor 3D', vals: datos.map(d => (d.vr.modelo3d ? 'Sí' : 'No')) },
  ].filter(f => f.vals.some(Boolean))
   .filter(f => !dif || datos.length < 2 || f.vals.some(v => !same(v, f.vals[0])));

  const grupos = [...new Set(armas.map(a => a.group))];
  const nombre = (id: string) => { const [a, v] = id.split(':'); const ar = byId(a); const vr = ar?.variants.find(x => x.id === v); return ar ? (vr && ar.variants.length > 1 ? `${ar.name} ${vr.name}` : ar.name) : null; };
  const ejemplos = EJEMPLOS.filter(g => g.every(id => byId(id.split(':')[0])));

  return (
    <>
      <div className="wcmp-bar">
        {cols.length < MAX && (
          <label className="wsel">
            <span className="sr-only">Añadir arma</span>
            <select value="" onChange={ev => { const a = byId(ev.target.value); if (a) commit([...cols, { id: a.id, v: a.variants[0].id }], dif); }}>
              <option value="">{cols.length ? 'Añadir arma…' : 'Elegir arma…'}</option>
              {grupos.map(g => <optgroup key={g} label={g}>{armas.filter(a => a.group === g).map(a => <option key={a.id} value={a.id}>{a.name}</option>)}</optgroup>)}
            </select>
          </label>
        )}
        {datos.length > 1 && <button type="button" className="wchip" aria-pressed={dif} onClick={() => commit(cols, !dif)}>Solo diferencias</button>}
        {cols.length > 0 && <button type="button" className="wclear" onClick={() => commit([], false)}>Vaciar</button>}
      </div>

      {datos.length === 0 && (
        <div className="wcmp-empty">
          <p className="muted">Elige de dos a tres armas, o dos variantes de la misma, para ver sus datos lado a lado.</p>
          {ejemplos.length > 0 && (<>
            <h2>Comparaciones habituales</h2>
            <ul className="wlist">
              {ejemplos.map(g => (
                <li key={g.join(',')}><Link href={`/comparar/?a=${g.join(',')}`}>{g.map(nombre).join(' frente a ')}</Link></li>
              ))}
            </ul>
          </>)}
        </div>
      )}

      {datos.length > 0 && (
        <table className="wcmp">
          <caption className="sr-only">Comparación de {datos.map(d => d.a.name).join(', ')}</caption>
          <thead>
            <tr>
              <td className="wcmp-corner" />
              {datos.map(({ c, a }, i) => (
                <th scope="col" key={`${c.id}:${c.v}`} className="wcmp-col">
                  <div className="wcmp-head">
                    <span className="wi-thumb">{a.photo ? <img src={a.photo} alt="" width={160} height={100} loading="lazy" decoding="async" /> : <IconGun />}</span>
                    <div className="wcmp-id">
                      <Link href={`/armas/${a.id}/`} className="wcmp-name">{a.name}</Link>
                      <span className="wcmp-maker">{a.maker}</span>
                      {a.variants.length > 1 && (
                        <label className="wsel sm">
                          <span className="sr-only">Variante de {a.name}</span>
                          <select value={c.v} onChange={ev => commit(cols.map((x, j) => (j === i ? { ...x, v: ev.target.value } : x)), dif)}>
                            {a.variants.map(v => <option key={v.id} value={v.id}>{v.name}</option>)}
                          </select>
                        </label>
                      )}
                    </div>
                    <button type="button" className="iconbtn" aria-label={`Quitar ${a.name}`} onClick={() => commit(cols.filter((_, j) => j !== i), dif)}><IconClose /></button>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filas.map(f => (
              <tr key={f.k}>
                <th scope="row">{f.l}{f.k === 'sistema' && <Link className="wcmp-help" href="/sistemas/">¿Qué significa?</Link>}</th>
                {f.vals.map((v, i) => (
                  <td key={i} data-label={datos[i].a.name}>{v || <span className="wcmp-na">Sin dato</span>}</td>
                ))}
              </tr>
            ))}
            {!filas.length && <tr><td className="wcmp-none" colSpan={datos.length + 1}>Estas armas no difieren en ningún dato de la ficha.</td></tr>}
          </tbody>
        </table>
      )}
      {datos.length === 1 && <p className="muted wcmp-hint">Añade otra arma para compararla.</p>}
    </>
  );
}
