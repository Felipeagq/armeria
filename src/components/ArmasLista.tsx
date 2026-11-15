// Lista de armas (portada). Sin hooks ni 'use client': el servidor la usa como contenido inicial completo y el buscador
// de cliente la reutiliza ya filtrada. `cmp` solo lo pasa el cliente (activa los botones de comparar).
import Link from 'next/link';
import type { ArmaCard } from '@/three/data/armas';
import { IconCheck, IconGun, IconPlus } from './icons';

export interface CmpProps { selected: string[]; max: number; toggle: (id: string) => void }

function Fila({ c, cmp }: { c: ArmaCard; cmp?: CmpProps }) {
  const on = !!cmp?.selected.includes(c.id);
  const full = !!cmp && !on && cmp.selected.length >= cmp.max;
  return (
    <li className="wi">
      <Link href={`/armas/${c.id}/`}>
        <span className="wi-thumb">{c.photo ? <img src={c.photo} alt="" width={160} height={100} loading="lazy" decoding="async" /> : <IconGun />}</span>
        <span className="wi-name">{c.name}{c.has3d && <i className="wtag" title="Se puede montar en 3D">3D</i>}</span>
        <span className="wi-maker">{c.maker}</span>
        {c.calibre && <span className="wi-spec">{c.calibre}</span>}
      </Link>
      {cmp && (
        <button type="button" className="wi-cmp" aria-pressed={on} disabled={full} onClick={() => cmp.toggle(c.id)}
          aria-label={`${on ? 'Quitar de la comparación' : 'Añadir a la comparación'}: ${c.name}`}
          title={full ? `Máximo ${cmp.max} armas` : on ? 'Quitar de la comparación' : 'Comparar'}>
          {on ? <IconCheck /> : <IconPlus />}
        </button>
      )}
    </li>
  );
}

export function ArmasLista({ cards, groups, flat, cmp }: { cards: ArmaCard[]; groups: readonly string[]; flat?: boolean; cmp?: CmpProps }) {
  const cls = `windex${cmp ? ' cmp' : ''}`;
  if (flat) return <ul className={cls}>{cards.map(c => <Fila key={c.id} c={c} cmp={cmp} />)}</ul>;
  const order = [...new Set([...groups, ...cards.map(c => c.group)])];
  return (
    <>
      {order.map(g => {
        const items = cards.filter(c => c.group === g); if (!items.length) return null;
        return (
          <section key={g} aria-label={g}>
            <h2>{g}</h2>
            <ul className={cls}>{items.map(c => <Fila key={c.id} c={c} cmp={cmp} />)}</ul>
          </section>
        );
      })}
    </>
  );
}
