'use client';
// Vista «Ficha» (móvil): foto grande + datos clave + ficha completa del modelo seleccionado.
// En escritorio y tableta no se muestra (CSS); allí la ficha vive dentro del inspector.
import { useStore } from '@/state/store';
import { PLATFORMS } from '@/three/registry';
import type { Specs } from '@/three/types';
import { PhotoFigure, SpecRows, SpecSource } from './Specs';

/** Datos que se destacan arriba, en teselas grandes. */
const KEY_FACTS: [keyof Specs, string][] = [['calibre', 'Calibre'], ['peso', 'Peso'], ['cadencia', 'Cadencia']];

export default function Ficha() {
  const pid = useStore(s => s.build.platform);
  const P = PLATFORMS[pid];
  const { setPanel, openModal } = useStore.getState();
  if (!P) return null;
  const keys = KEY_FACTS.filter(([k]) => P.specs?.[k]);

  return (
    <aside className="ficha" aria-label={`Ficha técnica: ${P.name}`}>
      <PhotoFigure pid={pid} name={P.name} />
      <div className="fhead">
        <h2>{P.name}</h2>
        {P.maker && <p className="fmaker">{P.maker}</p>}
      </div>
      {P.specs ? (<>
        {keys.length > 0 && (
          <div className="fkeys">
            {keys.map(([k, label]) => <div className="fkey" key={k}><span>{label}</span><b>{P.specs?.[k]}</b></div>)}
          </div>
        )}
        <div className="fspecs"><SpecRows P={P} /><SpecSource P={P} /></div>
      </>) : (
        <p className="fnote">Este modelo no tiene ficha técnica (modelo importado o de ejemplo).</p>
      )}
      <div className="factions">
        <button className="ghost" onClick={() => openModal('picker')}>Cambiar modelo</button>
        <button className="ghost" onClick={() => setPanel('parts')}>Ver piezas compatibles</button>
      </div>
    </aside>
  );
}
