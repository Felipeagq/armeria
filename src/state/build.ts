// Lógica pura del build (sin React): valores por defecto, validación y migración entre plataformas.
import { DEFAULT_PLATFORM, PLATFORMS, fitsPlatform, partById } from '@/three/registry';
import { isColorKey, type BuildState, type PartInstance } from '@/three/types';

export const STORE_KEY = 'armeria3d:v3';
const DEFAULT_NAME = 'Build sin título';

export function defaultState(pid: string = DEFAULT_PLATFORM): BuildState {
  if (!PLATFORMS[pid]) pid = DEFAULT_PLATFORM;
  const P = PLATFORMS[pid];
  const parts: Record<string, PartInstance> = {};
  for (const [slot, id] of Object.entries(P.defaults)) {
    const part = id ? partById(id) : undefined;
    if (part) parts[slot] = { id: part.id, color: part.color ?? 'negro' };
  }
  return { v: 3, name: DEFAULT_NAME, platform: pid, baseColor: P.baseColor ?? 'negro', parts };
}

/** Valida datos no confiables (localStorage, historial) y descarta lo que no encaje. */
export function validState(raw: unknown): BuildState | null {
  if (!raw || typeof raw !== 'object') return null;
  const s = raw as Partial<BuildState>;
  if (typeof s.platform !== 'string' || !PLATFORMS[s.platform] || !s.parts || typeof s.parts !== 'object') return null;
  const P = PLATFORMS[s.platform];
  const parts: Record<string, PartInstance> = {};
  for (const slot of P.slots) {
    const inst = (s.parts as Record<string, Partial<PartInstance>>)[slot.id];
    const part = inst && typeof inst.id === 'string' ? partById(inst.id) : undefined;
    if (part && part.type === slot.type && fitsPlatform(part, s.platform)) parts[slot.id] = { id: part.id, color: isColorKey(inst?.color) ? inst.color : 'negro' };
  }
  return {
    v: 3,
    name: typeof s.name === 'string' && s.name.trim() ? s.name.slice(0, 48) : DEFAULT_NAME,
    platform: s.platform,
    baseColor: isColorKey(s.baseColor) ? s.baseColor : 'negro',
    parts,
  };
}

/**
 * Lleva las piezas compatibles a la nueva plataforma. Una pieza que venía de serie en la
 * plataforma anterior se sustituye por la de serie de la nueva (p. ej. el freno del AK-74).
 */
export function migrateParts(state: BuildState, pid: string): Record<string, PartInstance> {
  const P = PLATFORMS[pid], oldDefaults = PLATFORMS[state.platform]?.defaults ?? {};
  const next: Record<string, PartInstance> = {};
  for (const slot of P.slots) {
    const o = state.parts[slot.id]; const part = o ? partById(o.id) : undefined;
    const newDefault = P.defaults[slot.id];
    const wasDefault = !!o && oldDefaults[slot.id] === o.id && !!newDefault;
    if (o && part && part.type === slot.type && fitsPlatform(part, pid) && !wasDefault) next[slot.id] = o;
    else if (newDefault) { const d = partById(newDefault); if (d) next[slot.id] = { id: d.id, color: d.color ?? 'negro' }; }
  }
  return next;
}

export function totalWeight(state: BuildState) {
  const P = PLATFORMS[state.platform];
  if (!P?.weight) return 0;
  return P.weight + Object.values(state.parts).reduce((a, i) => a + (partById(i.id)?.weight ?? 0), 0);
}

export function loadSaved(): unknown {
  try { return JSON.parse(localStorage.getItem(STORE_KEY) ?? 'null'); } catch { return null; }
}
export function save(state: BuildState) {
  try { localStorage.setItem(STORE_KEY, JSON.stringify(state)); } catch { /* almacenamiento no disponible */ }
}
