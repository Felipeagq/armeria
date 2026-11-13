'use client';
import { useEffect, useRef, useState, useSyncExternalStore } from 'react';
import { useStore } from '@/state/store';
import { totalWeight } from '@/state/build';
import { Viewer, type ViewName } from '@/three/engine/Viewer';
import { setViewer } from '@/three/engine/viewerRef';

/** Móvil: no hay visor 3D (la app es una enciclopedia). Misma condición que el modo «pestañas» de globals.css. */
const COMPACT = '(max-width:640px), (max-height:520px) and (max-width:960px)';
const isCompact = () => window.matchMedia(COMPACT).matches;
const useCompact = () => useSyncExternalStore(
  cb => { const mq = window.matchMedia(COMPACT); mq.addEventListener('change', cb); return () => mq.removeEventListener('change', cb); },
  isCompact,
  () => false,
);

const fmtWeight = (w: number) => (!w ? '—' : w >= 1000 ? `${(w / 1000).toFixed(2)} kg` : `${w} g`);

export default function Viewport() {
  const stageRef = useRef<HTMLElement>(null);
  const viewerRef = useRef<Viewer | null>(null);
  const [hint, setHint] = useState(true);

  const build = useStore(s => s.build);
  const added = useStore(s => s.added);
  const selected = useStore(s => s.selected);
  const hovered = useStore(s => s.hovered);
  const explode = useStore(s => s.explode);
  const spin = useStore(s => s.spin);
  const quality = useStore(s => s.quality);
  const lengthMm = useStore(s => s.lengthMm);
  const registryVersion = useStore(s => s.registryVersion);
  const { toggleExplode, toggleSpin, setQuality } = useStore.getState();
  const lastPlatform = useRef<string | null>(null);
  const compact = useCompact();

  // Ciclo de vida del visor. En móvil no se crea (ni WebGL ni render); isCompact() evita crearlo un instante durante la hidratación.
  useEffect(() => {
    const el = stageRef.current; if (!el || compact || isCompact()) return;
    const v = new Viewer(el, {
      // Al tocar una pieza en el visor se muestra «En el lienzo» (en móvil, donde están sus colores)
      onPick: id => { const s = useStore.getState(); s.select(s.selected === id && id ? null : id); if (id && s.panel !== 'ficha') s.setPanel('build'); setHint(false); },
      onHover: id => useStore.getState().hover(id),
      onBounds: mm => useStore.getState().setLength(mm),
    });
    viewerRef.current = v; setViewer(v);
    const t = setTimeout(() => setHint(false), 9000);
    return () => { clearTimeout(t); setViewer(null); v.dispose(); viewerRef.current = null; lastPlatform.current = null; };
  }, [compact]);

  // Reconstruir cuando cambia el build (o se registran modelos GLB)
  useEffect(() => {
    const v = viewerRef.current; if (!v) return;
    v.setBuild(build, added);
    v.setHighlight(useStore.getState().selected, useStore.getState().hovered);
    if (lastPlatform.current !== build.platform) { v.setView('three', lastPlatform.current === null); lastPlatform.current = build.platform; }
  }, [build, added, registryVersion, compact]);

  useEffect(() => { viewerRef.current?.setHighlight(selected, hovered); }, [selected, hovered, compact]);
  useEffect(() => { viewerRef.current?.setExplode(explode); }, [explode, compact]);
  useEffect(() => { viewerRef.current?.setAutoRotate(spin); }, [spin, compact]);
  useEffect(() => { viewerRef.current?.setQuality(quality); }, [quality, compact]);

  const view = (n: ViewName) => viewerRef.current?.setView(n);

  return (
    <section className="stage" ref={stageRef} onPointerDown={() => setHint(false)} onWheel={() => setHint(false)}>
      <div className="hint" style={{ opacity: hint ? 1 : 0 }}>
        <span className="h-mouse">Arrastra para orbitar · Rueda para zoom · Clic derecho para desplazar · Clic en una pieza para seleccionarla</span>
        <span className="h-touch">Arrastra para orbitar · Pellizca para zoom · Dos dedos para desplazar · Toca una pieza para seleccionarla</span>
      </div>
      <div className="hud">
        <div className="glass stats">
          <div className="stat"><div className="k">Longitud</div><div className="v">{lengthMm ? `${lengthMm} mm` : '—'}</div></div>
          <div className="stat"><div className="k">Peso est.</div><div className="v">{fmtWeight(totalWeight(build))}</div></div>
          <div className="stat"><div className="k">Accesorios</div><div className="v">{Object.keys(build.parts).length}</div></div>
        </div>
        <div className="glass tools">
          <button className="tbtn" onClick={() => view('side')}>Lateral <kbd>1</kbd></button>
          <button className="tbtn" onClick={() => view('three')}>3/4 <kbd>2</kbd></button>
          <button className="tbtn" onClick={() => view('top')}>Superior <kbd>3</kbd></button>
          <div className="tsep" />
          <button className={`tbtn ${explode ? 'on' : ''}`} onClick={toggleExplode}>Despiece <kbd>E</kbd></button>
          <button className={`tbtn ${spin ? 'on' : ''}`} onClick={toggleSpin}>Girar <kbd>R</kbd></button>
          <div className="tsep" />
          <button className={`tbtn ${quality === 'high' ? 'on' : ''}`} title="Oclusión ambiental y resolución completa" onClick={() => setQuality(quality === 'high' ? 'normal' : 'high')}>
            {quality === 'high' ? 'Calidad alta' : 'Calidad normal'}
          </button>
        </div>
      </div>
    </section>
  );
}
