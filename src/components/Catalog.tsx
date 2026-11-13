'use client';
import { useMemo } from 'react';
import { useStore } from '@/state/store';
import { compatibleParts } from '@/three/registry';
import { getViewer } from '@/three/engine/viewerRef';
import { SLOT_LABEL, type Part } from '@/three/types';
import { usePartThumb } from './useThumb';
import { IconSearch } from './icons';

const CATS = [
  { type: 'all', label: 'Todas' }, { type: 'optic', label: 'Ópticas' }, { type: 'muzzle', label: 'Bocachas y supresores' },
  { type: 'under', label: 'Riel inferior' }, { type: 'side', label: 'Riel lateral' }, { type: 'mag', label: 'Cargadores' },
  { type: 'stock', label: 'Culatas' }, { type: 'grip', label: 'Empuñaduras' },
];
const norm = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
const markers = (type: string | null) => getViewer()?.showMarkers(type);

function Card({ part, installed }: { part: Part; installed: boolean }) {
  const thumb = usePartThumb(part.id);
  const install = useStore(s => s.install);
  return (
    <button className="card" title={`Añadir ${part.name}`} onClick={() => install(part.id)} onMouseEnter={() => markers(part.type)}>
      {installed && <span className="badge">Instalada</span>}
      {part.glb && <span className="badge glb">GLB</span>}
      <div className="thumb">{thumb ? <img src={thumb} alt="" /> : <div className="ph" />}</div>
      <div className="nm">{part.name}</div>
      <div className="mt">{SLOT_LABEL[part.type]}{part.weight ? ` · ${part.weight} g` : ''}</div>
    </button>
  );
}

export default function Catalog() {
  const platform = useStore(s => s.build.platform);
  const parts = useStore(s => s.build.parts);
  const activeCat = useStore(s => s.activeCat);
  const search = useStore(s => s.search);
  const registryVersion = useStore(s => s.registryVersion);
  const { setCat, setSearch } = useStore.getState();

  const comp = useMemo(() => compatibleParts(platform), [platform, registryVersion]); // eslint-disable-line react-hooks/exhaustive-deps
  const counts = useMemo(() => {
    const c: Record<string, number> = { all: comp.length };
    for (const p of comp) c[p.type] = (c[p.type] ?? 0) + 1;
    return c;
  }, [comp]);
  const cat = activeCat !== 'all' && !counts[activeCat] ? 'all' : activeCat;
  const q = norm(search.trim());
  const installed = new Set(Object.values(parts).map(i => i.id));
  const list = comp.filter(p => (cat === 'all' || p.type === cat) && (!q || norm(`${p.name} ${SLOT_LABEL[p.type]}`).includes(q)));

  return (
    <aside className="catalog">
      <div className="pad">
        <label className="search"><IconSearch /><input placeholder="Buscar piezas" autoComplete="off" value={search} onChange={e => setSearch(e.target.value)} /></label>
      </div>
      <div className="cats" onMouseLeave={() => markers(null)}>
        {CATS.map(c => (
          <button key={c.type} className={`chip ${c.type === cat ? 'on' : ''}`} disabled={!counts[c.type]} onClick={() => setCat(c.type)} onMouseEnter={() => markers(c.type)}>
            {c.label}<b>{counts[c.type] ?? 0}</b>
          </button>
        ))}
      </div>
      <div className="grid" onMouseLeave={() => markers(null)}>
        {list.length ? list.map(p => <Card key={p.id} part={p} installed={installed.has(p.id)} />)
          : <div className="empty">No hay piezas que coincidan{q ? ` con «${search}»` : ''}.</div>}
      </div>
    </aside>
  );
}
