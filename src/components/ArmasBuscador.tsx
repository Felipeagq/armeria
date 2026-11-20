'use client';
// Portada: búsqueda en vivo, filtros (calibre, familia, país, 3D), orden y selección para comparar.
// El estado vive en la URL (?q=&calibre=&grupo=&pais=&3d=1&orden=&cmp=a,b): se lee al montar y se escribe con
// replaceState, así se puede compartir y al volver desde una ficha la lista queda como estaba. Aquí no entra three.
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useMemo, useState } from 'react';
import type { ArmaCard } from '@/catalogo/tipos';
import { ArmasLista } from './ArmasLista';
import { IconSearch } from './icons';
import { ENABLE_3D } from '@/config';

type Orden = 'familia' | 'nombre' | 'fabricante' | 'pais';
const ORDENES: [Orden, string][] = [['familia', 'Por familia'], ['nombre', 'Nombre (A–Z)'], ['fabricante', 'Fabricante'], ['pais', 'País']];
const MAX_CMP = 3;

interface Estado { q: string; calibre: string; grupo: string; pais: string; solo3d: boolean; orden: Orden; cmp: string[] }

const norm = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
const calLabel = (k: string) => (/^\d/.test(k) ? `${k} mm` : k);

function Select({ label, value, onChange, children }: { label: string; value: string; onChange: (v: string) => void; children: React.ReactNode }) {
  return (
    <label className="wsel">
      <span className="sr-only">{label}</span>
      <select value={value} data-on={value ? '' : undefined} onChange={e => onChange(e.target.value)}>{children}</select>
    </label>
  );
}

export default function ArmasBuscador({ cards, groups }: { cards: ArmaCard[]; groups: readonly string[] }) {
  const sp = useSearchParams();
  const [e, setE] = useState<Estado>(() => {
    const o = sp.get('orden');
    return {
      q: sp.get('q') ?? '', calibre: sp.get('calibre') ?? '', grupo: sp.get('grupo') ?? '', pais: sp.get('pais') ?? '',
      solo3d: sp.get('3d') === '1', orden: (ORDENES.some(([k]) => k === o) ? o : 'familia') as Orden,
      cmp: (sp.get('cmp') ?? '').split(',').filter(id => cards.some(c => c.id === id)).slice(0, MAX_CMP),
    };
  });

  /** Aplica un cambio y lo refleja en la URL sin añadir entradas al historial. */
  const set = (patch: Partial<Estado>) => {
    const n = { ...e, ...patch }; setE(n);
    const u = new URL(window.location.href);
    const put = (k: string, v: string) => { if (v) u.searchParams.set(k, v); else u.searchParams.delete(k); };
    put('q', n.q.trim()); put('calibre', n.calibre); put('grupo', n.grupo); put('pais', n.pais);
    put('3d', n.solo3d ? '1' : ''); put('orden', n.orden === 'familia' ? '' : n.orden); put('cmp', n.cmp.join(','));
    window.history.replaceState(null, '', u.pathname + u.search + u.hash);
  };

  const opciones = useMemo(() => {
    const contar = (f: (c: ArmaCard) => string[]) => {
      const m = new Map<string, number>();
      for (const c of cards) for (const v of new Set(f(c))) m.set(v, (m.get(v) ?? 0) + 1);
      return [...m].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0], 'es'));
    };
    return { calibres: contar(c => c.calibres), paises: contar(c => (c.pais ? [c.pais] : [])), grupos: contar(c => [c.group]) };
  }, [cards]);

  const nq = norm(e.q.trim());
  const list = useMemo(() => {
    const r = cards.filter(c =>
      (!nq || norm(`${c.name} ${c.maker} ${c.variants.join(' ')} ${c.calibre ?? ''}`).includes(nq)) &&
      (!e.calibre || c.calibres.includes(e.calibre)) && (!e.grupo || c.group === e.grupo) &&
      (!e.pais || c.pais === e.pais) && (!ENABLE_3D || !e.solo3d || c.has3d));
    if (e.orden === 'familia') return r;
    const key = (c: ArmaCard) => (e.orden === 'nombre' ? c.name : e.orden === 'fabricante' ? c.maker : c.pais ?? '~');
    return [...r].sort((a, b) => key(a).localeCompare(key(b), 'es', { numeric: true }) || a.name.localeCompare(b.name, 'es', { numeric: true }));
  }, [cards, nq, e.calibre, e.grupo, e.pais, e.solo3d, e.orden]);

  const activos = [e.calibre, e.grupo, e.pais].filter(Boolean).length + (ENABLE_3D && e.solo3d ? 1 : 0);
  const fuera = `/armas/buscar/?q=${encodeURIComponent(e.q.trim())}`;
  const toggle = (id: string) => set({ cmp: e.cmp.includes(id) ? e.cmp.filter(x => x !== id) : [...e.cmp, id].slice(0, MAX_CMP) });
  const limpiar = () => set({ calibre: '', grupo: '', pais: '', solo3d: false });

  return (
    <>
      <form className="wsearch" action="/armas/buscar/" method="get" role="search">
        <label className="search"><IconSearch />
          <input type="search" name="q" aria-label="Buscar arma" placeholder="Buscar arma, fabricante o calibre…" value={e.q} onChange={ev => set({ q: ev.target.value })} autoComplete="off" enterKeyHint="search" />
        </label>
      </form>

      <div className="wfilters" role="group" aria-label="Filtros">
        <Select label="Calibre" value={e.calibre} onChange={v => set({ calibre: v })}>
          <option value="">Calibre</option>
          {opciones.calibres.map(([k, n]) => <option key={k} value={k}>{calLabel(k)} ({n})</option>)}
        </Select>
        <Select label="Familia" value={e.grupo} onChange={v => set({ grupo: v })}>
          <option value="">Familia</option>
          {groups.filter(g => opciones.grupos.some(([k]) => k === g)).concat(opciones.grupos.map(([k]) => k).filter(k => !groups.includes(k))).map(g => <option key={g} value={g}>{g}</option>)}
        </Select>
        <Select label="País" value={e.pais} onChange={v => set({ pais: v })}>
          <option value="">País</option>
          {opciones.paises.map(([k, n]) => <option key={k} value={k}>{k} ({n})</option>)}
        </Select>
        {ENABLE_3D && <button type="button" className="wchip" aria-pressed={e.solo3d} onClick={() => set({ solo3d: !e.solo3d })}>Montable en 3D</button>}
        <Select label="Ordenar por" value={e.orden === 'familia' ? '' : e.orden} onChange={v => set({ orden: (v || 'familia') as Orden })}>
          {ORDENES.map(([k, l]) => <option key={k} value={k === 'familia' ? '' : k}>{k === 'familia' ? 'Orden: por familia' : `Orden: ${l.toLowerCase()}`}</option>)}
        </Select>
        {activos > 0 && <button type="button" className="wclear" onClick={limpiar}>Quitar filtros ({activos})</button>}
      </div>

      <p className="sr-only" role="status">{list.length} {list.length === 1 ? 'arma' : 'armas'}</p>
      <ArmasLista cards={list} groups={groups} flat={e.orden !== 'familia'} cmp={{ selected: e.cmp, max: MAX_CMP, toggle }} />

      {!list.length && (
        <p className="muted wempty">
          Ningún arma del catálogo coincide{activos ? ' con esos filtros' : ''}.{' '}
          {activos > 0 && <button type="button" className="wlink" onClick={limpiar}>Quitar filtros</button>}
          {activos > 0 && nq ? ' · ' : ''}
          {nq && <Link href={fuera}>Buscar «{e.q.trim()}» en Wikipedia o generar la ficha</Link>}
        </p>
      )}
      {nq && list.length > 0 && <p className="whint">¿No es lo que buscas? <Link href={fuera}>Buscar «{e.q.trim()}» fuera del catálogo</Link></p>}

      {e.cmp.length > 0 && (
        <div className="wcmpbar" role="region" aria-label="Comparación">
          <span aria-live="polite">{e.cmp.length < 2 ? 'Elige otra arma para comparar' : `${e.cmp.length} armas para comparar`}</span>
          <button type="button" className="ghost sm" onClick={() => set({ cmp: [] })}>Vaciar</button>
          {e.cmp.length >= 2
            ? <Link className="primary" href={`/comparar/?a=${e.cmp.join(',')}`}>Comparar</Link>
            : <span className="primary" aria-disabled="true">Comparar</span>}
        </div>
      )}
    </>
  );
}
