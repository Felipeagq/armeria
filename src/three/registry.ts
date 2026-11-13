// Registro central de plataformas y piezas (procedurales + GLB importados en tiempo de ejecución).
import type * as THREE from 'three';
import { PLATFORMS as GENERIC_PLATFORMS } from './data/platforms';
import { PARTS as GENERIC_PARTS } from './data/parts';
import { MODELS, REAL_PLATFORMS, RIFLE_PARTS, ADAPTERS } from './data/rifles';
import { instantiate, prepareBase, preparePart, type ModelRecord } from './glb/models';
import type { Part, Platform } from './types';

export { MODELS, ADAPTERS };
export const DEFAULT_PLATFORM = 'hk416_a5';
export const GROUPS = ['Familia AR-15', 'Familia Kalashnikov', 'Otros', 'Genéricos', 'Importados'] as const;

export const PLATFORMS: Record<string, Platform> = { ...GENERIC_PLATFORMS, ...REAL_PLATFORMS };
export const PARTS: Part[] = [...GENERIC_PARTS, ...RIFLE_PARTS];

let byId: Record<string, Part> = {};
const reindex = () => { byId = Object.fromEntries(PARTS.map(p => [p.id, p])); };
reindex();

export const partById = (id: string): Part | undefined => byId[id];
export const tagsOf = (pid: string) => PLATFORMS[pid]?.tags ?? [];
export const fitsPlatform = (p: Part, pid: string) => !p.fits || p.fits.some(t => tagsOf(pid).includes(t));
export const tintable = (p?: Part) => !p?.glb;

export function compatibleParts(pid: string) {
  const types = new Set(PLATFORMS[pid].slots.map(s => s.type));
  return PARTS.filter(p => types.has(p.type) && fitsPlatform(p, pid));
}

/* ── Selector de modelos ───────────────────────────────────────────── */
export interface PickerEntry { group: string; name: string; maker: string; ids: string[]; labels: string[] }
export function pickerEntries(): PickerEntry[] {
  const entries: PickerEntry[] = MODELS.map(m => ({ group: m.group, name: m.name, maker: m.maker, ids: m.variants.map(v => `${m.id}_${v.id}`), labels: m.variants.map(v => v.name) }));
  for (const [id, p] of Object.entries(PLATFORMS)) {
    if (!p.model) entries.push({ group: p.group ?? 'Importados', name: p.name, maker: p.glb ? 'Modelo GLB importado' : 'Plataforma de ejemplo', ids: [id], labels: ['Usar'] });
  }
  return entries;
}

/* ── Modelos GLB ───────────────────────────────────────────────────── */
type Listener = (part: Part) => void;
const partListeners = new Set<Listener>();
/** Se notifica cuando una pieza nueva o reemplazada necesita miniatura. */
export const onPartRegistered = (fn: Listener) => { partListeners.add(fn); return () => partListeners.delete(fn); };

export function registerModel(rec: ModelRecord, scene: THREE.Object3D) {
  const opts = { units: rec.units ?? 'auto', forward: rec.forward ?? '+x', slotType: rec.slot } as const;
  if (rec.kind === 'base') {
    const prep = prepareBase(scene, opts);
    const fam = rec.family && PLATFORMS[rec.family] ? rec.family : 'rifle';
    PLATFORMS[rec.id] = {
      name: rec.name, short: rec.name.length > 14 ? rec.name.slice(0, 13) + '…' : rec.name, weight: rec.weight ?? 0, glb: true,
      family: fam, tags: [...new Set([...PLATFORMS[fam].tags, 'pistol', 'long'])], group: 'Importados', slots: prep.slots, defaults: {},
      build: b => { b.g.add(instantiate(prep.model)); },
    };
    return prep;
  }
  const prep = preparePart(scene, opts);
  const build: Part['build'] = b => { b.g.add(instantiate(prep.model)); };
  const replaced = rec.replaces ? byId[rec.replaces] : undefined;
  if (replaced) {
    replaced.build = build; replaced.glb = true; if (rec.name) replaced.name = rec.name;
    partListeners.forEach(fn => fn(replaced));
  } else if (rec.slot) {
    const idx = PARTS.findIndex(p => p.id === rec.id); if (idx >= 0) PARTS.splice(idx, 1);
    const fits = rec.platforms?.length ? [...new Set(rec.platforms.map(v => (v === 'pistol' ? 'pistol' : 'long')))] : undefined;
    const part: Part = { id: rec.id, name: rec.name, type: rec.slot, fits, weight: rec.weight ?? 0, glb: true, build };
    PARTS.push(part); reindex();
    partListeners.forEach(fn => fn(part));
  }
  return prep;
}

export function unregisterModel(id: string) {
  if (PLATFORMS[id]?.glb) delete PLATFORMS[id];
  const idx = PARTS.findIndex(p => p.id === id);
  if (idx >= 0) { PARTS.splice(idx, 1); reindex(); }
}
