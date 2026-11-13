'use client';
// Estado global de la UI con zustand: build actual, historial, selección y preferencias de vista.
import { create } from 'zustand';
import { PLATFORMS, fitsPlatform, partById } from '@/three/registry';
import type { BuildState, ColorKey } from '@/three/types';
import { defaultState, migrateParts, save, validState } from './build';

export type Quality = 'high' | 'normal';
export type ViewName = 'side' | 'three' | 'top';
type Modal = null | 'export' | 'picker' | 'models' | 'import';
/** Panel visible bajo el visor en pantallas pequeñas (en escritorio se ven los dos). */
export type Panel = 'parts' | 'build';

interface Store {
  build: BuildState;
  past: string[];
  future: string[];
  /** Ranura recién instalada (anima su entrada). */
  added: string | null;
  selected: string | null;
  hovered: string | null;
  activeCat: string;
  search: string;
  explode: boolean;
  spin: boolean;
  quality: Quality;
  panel: Panel;
  modal: Modal;
  lengthMm: number;
  registryVersion: number;
  toast: { msg: string; id: number } | null;

  hydrate: (raw: unknown) => void;
  install: (partId: string) => void;
  remove: (slotId: string) => void;
  setColor: (slotId: string, color: ColorKey) => void;
  setPlatform: (pid: string) => void;
  rename: (name: string) => void;
  reset: () => void;
  undo: () => void;
  redo: () => void;
  select: (id: string | null) => void;
  hover: (id: string | null) => void;
  setCat: (cat: string) => void;
  setSearch: (q: string) => void;
  toggleExplode: () => void;
  toggleSpin: () => void;
  setQuality: (q: Quality) => void;
  setPanel: (p: Panel) => void;
  openModal: (m: Modal) => void;
  setLength: (mm: number) => void;
  bumpRegistry: () => void;
  notify: (msg: string) => void;
}

const MAX_HISTORY = 80;
const snap = (b: BuildState) => JSON.stringify(b);

export const useStore = create<Store>((set, get) => {
  /** Aplica un cambio guardando el estado anterior en el historial. */
  const commit = (next: BuildState, extra: Partial<Store> = {}) => {
    const { build, past } = get();
    save(next);
    set({ build: next, past: [...past, snap(build)].slice(-MAX_HISTORY), future: [], added: null, ...extra });
  };
  const restore = (json: string) => {
    const b = validState(JSON.parse(json)) ?? get().build;
    save(b);
    return b;
  };

  return {
    build: defaultState(),
    past: [], future: [], added: null,
    selected: null, hovered: null,
    activeCat: 'all', search: '',
    explode: false, spin: false, quality: 'high', panel: 'parts',
    modal: null, lengthMm: 0, registryVersion: 0, toast: null,

    hydrate: raw => {
      const b = validState(raw);
      if (b) set({ build: b });
      else if (!PLATFORMS[get().build.platform]) set({ build: defaultState(), selected: null });
      try { const q = localStorage.getItem('armeria3d:quality'); if (q === 'normal' || q === 'high') set({ quality: q }); } catch { /* */ }
    },

    install: partId => {
      const { build } = get();
      const part = partById(partId); const P = PLATFORMS[build.platform];
      const slot = part && P.slots.find(s => s.type === part.type);
      if (!part || !slot || !fitsPlatform(part, build.platform)) { get().notify('Esta pieza no tiene ranura en este cuerpo'); return; }
      if (build.parts[slot.id]?.id === partId) { set({ selected: slot.id }); return; }
      const prev = build.parts[slot.id];
      commit({ ...build, parts: { ...build.parts, [slot.id]: { id: partId, color: part.color ?? prev?.color ?? 'negro' } } }, { selected: slot.id, added: slot.id });
      get().notify(prev ? `${partById(prev.id)?.name} → ${part.name}` : `${part.name} instalada`);
    },

    remove: slotId => {
      const { build, selected } = get(); const inst = build.parts[slotId]; if (!inst) return;
      const parts = { ...build.parts }; delete parts[slotId];
      commit({ ...build, parts }, { selected: selected === slotId ? null : selected });
      get().notify(`${partById(inst.id)?.name ?? 'Pieza'} retirada`);
    },

    setColor: (slotId, color) => {
      const { build } = get();
      if (slotId === 'base') { if (build.baseColor !== color) commit({ ...build, baseColor: color }); return; }
      const inst = build.parts[slotId]; if (!inst || inst.color === color) return;
      commit({ ...build, parts: { ...build.parts, [slotId]: { ...inst, color } } });
    },

    setPlatform: pid => {
      const { build } = get(); if (pid === build.platform || !PLATFORMS[pid]) return;
      commit({ ...build, platform: pid, parts: migrateParts(build, pid), baseColor: PLATFORMS[pid].baseColor ?? build.baseColor },
        { selected: null, hovered: null, activeCat: 'all' });
    },

    rename: name => {
      const build = { ...get().build, name: name.trim().slice(0, 48) || 'Build sin título' };
      save(build); set({ build });
    },

    reset: () => {
      const { build } = get();
      commit({ ...defaultState(build.platform), name: build.name }, { selected: null });
      get().notify('Build restablecido · Ctrl+Z para deshacer');
    },

    undo: () => {
      const { past, future, build } = get(); if (!past.length) return;
      set({ build: restore(past[past.length - 1]), past: past.slice(0, -1), future: [...future, snap(build)], selected: null, added: null });
    },
    redo: () => {
      const { past, future, build } = get(); if (!future.length) return;
      set({ build: restore(future[future.length - 1]), future: future.slice(0, -1), past: [...past, snap(build)], selected: null, added: null });
    },

    select: id => set({ selected: id }),
    hover: id => { if (get().hovered !== id) set({ hovered: id }); },
    setCat: activeCat => set({ activeCat }),
    setSearch: search => set({ search }),
    toggleExplode: () => set(s => ({ explode: !s.explode })),
    toggleSpin: () => set(s => ({ spin: !s.spin })),
    setQuality: quality => { try { localStorage.setItem('armeria3d:quality', quality); } catch { /* */ } set({ quality }); },
    setPanel: panel => set({ panel }),
    openModal: modal => set({ modal }),
    setLength: lengthMm => set({ lengthMm }),
    bumpRegistry: () => set(s => ({ registryVersion: s.registryVersion + 1 })),
    notify: msg => set({ toast: { msg, id: Date.now() } }),
  };
});
