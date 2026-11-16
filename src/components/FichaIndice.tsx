'use client';
// Índice de la ficha de un arma: en escritorio, una lista fija bajo la foto; en móvil y tableta, una barra de chips fija arriba.
// Los enlaces son anclas normales (funcionan sin JS); el cliente solo resalta la sección que se está leyendo.
import { useEffect, useRef, useState } from 'react';

export interface ItemIndice { id: string; label: string; n?: number; /** Título del grupo; se muestra en la lista lateral cuando cambia. */ grupo?: string }

export default function FichaIndice({ items, variante }: { items: ItemIndice[]; variante: 'lateral' | 'chips' }) {
  const [activo, setActivo] = useState(items[0]?.id);
  const barra = useRef<HTMLElement>(null);
  const bloqueoHasta = useRef(0); // al pulsar un enlace, el resaltado se queda ahí mientras dura el desplazamiento

  // Sección activa: la última cuyo título ya pasó el 30 % superior de la ventana; al llegar al final de la página, la última.
  useEffect(() => {
    let raf = 0;
    const calcular = () => {
      raf = 0;
      if (performance.now() < bloqueoHasta.current) return;
      let actual = items[0]?.id;
      for (const it of items) {
        const el = document.getElementById(it.id);
        if (el && el.getBoundingClientRect().top <= window.innerHeight * 0.3) actual = it.id;
      }
      if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4) actual = items[items.length - 1]?.id;
      setActivo(actual);
    };
    const pedir = () => { if (!raf) raf = requestAnimationFrame(calcular); };
    pedir();
    window.addEventListener('scroll', pedir, { passive: true });
    window.addEventListener('resize', pedir);
    return () => { window.removeEventListener('scroll', pedir); window.removeEventListener('resize', pedir); if (raf) cancelAnimationFrame(raf); };
  }, [items]);

  // En la barra de chips, mantener a la vista el chip activo (la barra se desplaza en horizontal).
  useEffect(() => {
    if (variante !== 'chips') return;
    const nav = barra.current; const a = nav?.querySelector<HTMLElement>('[aria-current]');
    if (nav && a) nav.scrollTo({ left: a.offsetLeft - (nav.clientWidth - a.offsetWidth) / 2 });
  }, [activo, variante]);

  if (items.length < 2) return null;
  const cur = (id: string) => (id === activo ? 'location' as const : undefined);
  const elegir = (id: string, instante: number) => { bloqueoHasta.current = instante + 1000; setActivo(id); }; // instante: e.timeStamp, en la misma escala que performance.now()

  return variante === 'lateral' ? (
    <nav className="wtoc" aria-label="En esta ficha">
      <ol>
        {items.map((it, i) => (
          <li key={it.id}>
            {it.grupo && it.grupo !== items[i - 1]?.grupo && <p className="wtoc-g">{it.grupo}</p>}
            <a href={`#${it.id}`} aria-current={cur(it.id)} onClick={e => elegir(it.id, e.timeStamp)}>{it.label}{it.n !== undefined && <span>{it.n}</span>}</a>
          </li>
        ))}
      </ol>
    </nav>
  ) : (
    <nav className="wtoc-chips" aria-label="Secciones de la ficha" ref={barra}>
      {items.map(it => (
        <a className="wchip" key={it.id} href={`#${it.id}`} aria-current={cur(it.id)} onClick={e => elegir(it.id, e.timeStamp)}>{it.label}{it.n !== undefined && <b>{it.n}</b>}</a>
      ))}
    </nav>
  );
}
