'use client';
// Buscador global (Ctrl/Cmd + K, o «/»): armas, accesorios, cartuchos y glosario en un diálogo.
// <dialog> nativo: atrapa el foco, se cierra con Esc y devuelve el foco al botón. El índice se descarga la primera vez que se abre.
import { useEffect, useMemo, useRef, useState, useSyncExternalStore } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { IconSearch } from './icons';

type Tipo = 'arma' | 'accesorio' | 'municion' | 'glosario';
interface Entrada { t: Tipo; h: string; n: string; s: string; k: string }

const TIPOS: Record<Tipo, string> = { arma: 'Arma', accesorio: 'Accesorio', municion: 'Munición', glosario: 'Glosario' };
const ORDEN: Tipo[] = ['arma', 'accesorio', 'municion', 'glosario'];
const SECCIONES: { h: string; n: string; s: string }[] = [
  { h: '/', n: 'Armas', s: 'Fichas técnicas de armas y réplicas de airsoft' },
  { h: '/comparar/', n: 'Comparar', s: 'Dos o tres armas lado a lado' },
  { h: '/accesorios/', n: 'Accesorios', s: 'Miras, bocachas, luces, empuñaduras, cargadores y culatas' },
  { h: '/balas/', n: 'Balas', s: 'Cartuchos y bola de 6 mm' },
  { h: '/sistemas/', n: 'Glosario', s: 'Qué significan los sistemas y términos de las fichas' },
  { h: '/montar/', n: 'Montar en 3D', s: 'Configura un arma con accesorios' },
];

/** Sin tildes ni mayúsculas, y con «5,56×45» comparable con «5.56x45». */
const norm = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/×/g, 'x').replace(/,/g, '.');

let cache: Entrada[] | null = null;
let pendiente: Promise<Entrada[]> | null = null;
function cargar(): Promise<Entrada[]> {
  if (cache) return Promise.resolve(cache);
  pendiente ??= fetch('/api/busqueda/').then(r => { if (!r.ok) throw new Error(String(r.status)); return r.json() as Promise<Entrada[]>; })
    .then(d => (cache = d)).finally(() => { pendiente = null; });
  return pendiente;
}

/** Raíz de una palabra de la consulta: sin la terminación de género y número («holográfica» → «holografic», «supresores» → «supresor»). */
const raiz = (w: string) => (w.length >= 5 && /^[a-z]+$/.test(w) ? w.replace(/(es|os|as|a|o|e|s)$/, '') : w);

/** Todas las palabras de la consulta deben aparecer; antes los que empiezan por ella, luego los que la llevan en el nombre, luego el resto. */
function buscar(datos: Entrada[], q: string): Entrada[] {
  const nq = norm(q.trim()); if (!nq) return [];
  const palabras = nq.split(/\s+/);
  const con: { e: Entrada; p: number }[] = [];
  for (const e of datos) {
    const n = norm(e.n), todo = `${n} ${norm(e.s)} ${norm(e.k)}`;
    if (!palabras.every(w => todo.includes(raiz(w)))) continue;
    con.push({ e, p: n.startsWith(nq) ? 0 : n.includes(nq) ? 1 : palabras.every(w => n.includes(w)) ? 2 : 3 });
  }
  return con.sort((a, b) => a.p - b.p || ORDEN.indexOf(a.e.t) - ORDEN.indexOf(b.e.t)).slice(0, 24).map(x => x.e);
}

export default function BuscadorGlobal() {
  const router = useRouter();
  const dlg = useRef<HTMLDialogElement>(null);
  const campo = useRef<HTMLInputElement>(null);
  const lista = useRef<HTMLUListElement>(null);
  const [q, setQ] = useState('');
  const [datos, setDatos] = useState<Entrada[] | 'error' | null>(cache);
  // Tecla del atajo según el sistema; en el servidor y en la hidratación se muestra «Ctrl K».
  const mac = useSyncExternalStore(() => () => {}, () => /Mac|iPhone|iPad/.test(navigator.platform), () => false);

  const abrir = () => {
    const d = dlg.current; if (!d || d.open) return;
    d.showModal();
    if (!cache) { setDatos(null); cargar().then(setDatos).catch(() => setDatos('error')); }
  };
  const cerrar = () => dlg.current?.close();

  useEffect(() => {
    const on = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement | null;
      const escribiendo = !!t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.tagName === 'SELECT' || t.isContentEditable);
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); abrir(); }
      else if (e.key === '/' && !escribiendo && !e.ctrlKey && !e.metaKey && !e.altKey) { e.preventDefault(); abrir(); }
    };
    window.addEventListener('keydown', on);
    return () => window.removeEventListener('keydown', on);
  }, []);

  const resultados = useMemo(() => (Array.isArray(datos) ? buscar(datos, q) : []), [datos, q]);
  const hayConsulta = q.trim().length > 0;
  const items = hayConsulta ? resultados : SECCIONES.map(s => ({ t: 'seccion' as const, ...s, k: '' }));

  const enlaces = () => [...(lista.current?.querySelectorAll<HTMLAnchorElement>('a') ?? [])];
  const teclaCampo = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') { e.preventDefault(); enlaces()[0]?.focus(); }
    else if (e.key === 'Enter') { const primero = items[0]; if (primero) { e.preventDefault(); cerrar(); router.push(primero.h); } }
  };
  const teclaLista = (e: React.KeyboardEvent) => {
    if (e.key !== 'ArrowDown' && e.key !== 'ArrowUp') return;
    const l = enlaces(), i = l.indexOf(document.activeElement as HTMLAnchorElement);
    e.preventDefault();
    if (e.key === 'ArrowDown') l[Math.min(i + 1, l.length - 1)]?.focus();
    else if (i <= 0) campo.current?.focus(); else l[i - 1]?.focus();
  };

  return (
    <>
      <button type="button" className="wsrch-btn" onClick={abrir} aria-haspopup="dialog" aria-keyshortcuts="Control+K Meta+K" aria-label="Buscar en el sitio">
        <IconSearch aria-hidden /><span>Buscar</span><kbd aria-hidden>{mac ? '⌘ K' : 'Ctrl K'}</kbd>
      </button>
      <dialog ref={dlg} className="wsrch" aria-label="Buscar en el sitio"
        onClose={() => setQ('')}
        onClick={e => { if (e.target === dlg.current) cerrar(); }}>
        <div className="wsrch-field">
          <IconSearch aria-hidden />
          <input ref={campo} type="search" value={q} onChange={e => setQ(e.target.value)} onKeyDown={teclaCampo} autoFocus autoComplete="off" spellCheck={false}
            placeholder="Busca un arma, accesorio, calibre o término…" aria-label="Buscar en el sitio" />
        </div>
        <div className="wsrch-body">
          <p className="sr-only" role="status">{hayConsulta && Array.isArray(datos) ? `${resultados.length} resultados` : ''}</p>
          {hayConsulta && datos === null && <p className="wsrch-msg">Cargando…</p>}
          {hayConsulta && datos === 'error' && <p className="wsrch-msg">No se pudo cargar el buscador. Comprueba tu conexión y vuelve a abrirlo.</p>}
          {hayConsulta && Array.isArray(datos) && !resultados.length && <p className="wsrch-msg">Nada coincide con «{q.trim()}». Prueba con el nombre, el calibre o el fabricante.</p>}
          {!hayConsulta && <p className="wsrch-msg">Ir a</p>}
          {items.length > 0 && (
            <ul ref={lista} onKeyDown={teclaLista}>
              {items.map(it => (
                <li key={it.h}>
                  <Link href={it.h} onClick={cerrar}>
                    <span className="wsrch-t"><b>{it.n}</b><small>{it.s}</small></span>
                    {it.t !== 'seccion' && <i>{TIPOS[it.t]}</i>}
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </dialog>
    </>
  );
}
