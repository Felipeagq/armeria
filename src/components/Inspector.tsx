'use client';
import { useState } from 'react';
import { useStore } from '@/state/store';
import { PLATFORMS, partById, tintable } from '@/three/registry';
import { COLOR_NAMES, COLORS, SLOT_LABEL, type ColorKey, type Platform, type Specs } from '@/three/types';
import { getViewer } from '@/three/engine/viewerRef';
import { usePartThumb } from './useThumb';
import { IconClose, IconGun } from './icons';

const SPEC_LABELS: [keyof Specs, string][] = [
  ['calibre', 'Calibre'], ['peso', 'Peso'], ['cañon', 'Cañón'], ['sistema', 'Sistema / cerrojo'], ['cadencia', 'Cadencia'],
  ['velocidad', 'Velocidad inicial'], ['alcance', 'Alcance eficaz'], ['cargador', 'Cargador'], ['airsoft', 'Réplica airsoft'], ['extra', 'Notas'],
];

function SpecsPanel({ P }: { P: Platform }) {
  const [open, setOpen] = useState(true);
  if (!P.specs) return null;
  return (
    <details className="specs" open={open} onToggle={e => setOpen(e.currentTarget.open)}>
      <summary><span>Ficha técnica</span><em>{P.maker}</em></summary>
      <dl>
        {SPEC_LABELS.filter(([k]) => P.specs?.[k]).map(([k, label]) => (
          <div className="sr" key={k}><dt>{label}</dt><dd>{P.specs?.[k]}</dd></div>
        ))}
      </dl>
      <p className="src">Datos del arma real. Fuente: {P.specs.fuente ?? '—'}. Los valores varían según configuración y munición.</p>
    </details>
  );
}

function Swatches({ slotId, current }: { slotId: string; current: ColorKey }) {
  const setColor = useStore(s => s.setColor);
  return (
    <div className="sw"><span>Color</span>
      {(Object.keys(COLORS) as ColorKey[]).map(k => (
        <button key={k} className={`dot ${k === current ? 'on' : ''}`} style={{ background: COLORS[k] }} title={COLOR_NAMES[k]} aria-label={COLOR_NAMES[k]}
          onClick={e => { e.stopPropagation(); setColor(slotId, k); }} />
      ))}
    </div>
  );
}
const GlbNote = () => <div className="sw"><span>Modelo GLB · usa sus propios materiales</span></div>;

function PartRow({ slotId, partId, color }: { slotId: string; partId: string; color: ColorKey }) {
  const p = partById(partId);
  const thumb = usePartThumb(partId);
  const selected = useStore(s => s.selected === slotId);
  const { select, hover, remove } = useStore.getState();
  if (!p) return null;
  return (
    <div className={`item ${selected ? 'sel' : ''}`} onClick={() => select(selected ? null : slotId)} onMouseEnter={() => hover(slotId)} onMouseLeave={() => hover(null)}>
      <div className="th">{thumb && <img src={thumb} alt="" />}</div>
      <div><div className="nm">{p.name}</div><div className="sl">{SLOT_LABEL[p.type]}{p.weight ? ` · ${p.weight} g` : ''}</div></div>
      <button className="x" title="Quitar" aria-label={`Quitar ${p.name}`} onClick={e => { e.stopPropagation(); remove(slotId); }}><IconClose /></button>
      {tintable(p) ? <Swatches slotId={slotId} current={color} /> : <GlbNote />}
    </div>
  );
}

export default function Inspector() {
  const build = useStore(s => s.build);
  const baseSelected = useStore(s => s.selected === 'base');
  useStore(s => s.registryVersion);
  const { select, hover, setCat, setSearch, setPanel } = useStore.getState();
  const P = PLATFORMS[build.platform];
  const n = Object.keys(build.parts).length;

  const focusCategory = (type: string) => {
    setCat(type); setSearch(''); setPanel('parts'); // en móvil, saltar al catálogo
    getViewer()?.showMarkers(type); setTimeout(() => getViewer()?.showMarkers(null), 1600);
  };

  return (
    <aside className="inspector">
      <div className="ihead"><h3>En el lienzo</h3><span className="count">{n + 1} piezas</span></div>
      <div className="ilist">
        <SpecsPanel P={P} />
        <div className={`item ${baseSelected ? 'sel' : ''}`} onClick={() => select(baseSelected ? null : 'base')} onMouseEnter={() => hover('base')} onMouseLeave={() => hover(null)}>
          <div className="th"><IconGun /></div>
          <div><div className="nm">{P.name}</div><div className="sl">Cuerpo{P.weight ? ` · ${P.weight} g` : ''}</div></div><div />
          {P.glb ? <GlbNote /> : <Swatches slotId="base" current={build.baseColor} />}
        </div>
        {P.slots.map(slot => {
          const inst = build.parts[slot.id];
          if (!inst) {
            return (
              <div className="slot-empty" key={slot.id}>
                <span>{SLOT_LABEL[slot.type]} vacía{slot.guessed && <em title="Posición estimada: el modelo no trae el nodo de anclaje"> ≈</em>}</span>
                <button onClick={() => focusCategory(slot.type)}>+ Añadir</button>
              </div>
            );
          }
          return <PartRow key={slot.id} slotId={slot.id} partId={inst.id} color={inst.color} />;
        })}
      </div>
      <div className="foot">Piezas estilizadas para réplicas de airsoft. Pesos y medidas aproximados. Tu build se guarda en este navegador. Arrastra un archivo .glb al lienzo para importar tus propios modelos.</div>
    </aside>
  );
}
