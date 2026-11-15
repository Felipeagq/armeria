// Enciclopedia de armas: la ficha es la entidad principal. Un arma puede tener o no modelo 3D
// para el constructor (`platform` en la variante): las fichas sin 3D se consultan igual.
// Este módulo no toca WebGL ni `window`: se usa en páginas de servidor y en el constructor.
import type { Specs } from '../types';
import { MODELS, REAL_PLATFORMS } from './rifles';
import { PHOTOS, photoUrl, type Photo } from './photos';
import EXTERNAS from './armas-externas.json';
import { SPEC_LABELS, specRowsOf } from './spec-labels';

export { SPEC_LABELS, specRowsOf };

export interface ArmaVariante {
  id: string;
  name: string;
  /** Datos propios de la variante (los comunes van en `Arma.common`). */
  specs: Specs;
  /** Id de la plataforma del constructor 3D, si la variante tiene modelo. */
  platform?: string;
}
export interface Arma {
  id: string;
  name: string;
  maker: string;
  group: string;
  common: Specs;
  variants: ArmaVariante[];
}

/** Grupos en el orden en que se muestran. */
export const ARMA_GROUPS = ['Familia AR-15', 'Familia Kalashnikov', 'Otros', 'Pistolas', 'Subfusiles'] as const;

/* ── Fichas sin modelo 3D ───────────────────────────────────────────
   Armas que se consultan pero (todavía) no se montan. Mismo formato que MODELS, sin geometría. */
const FICHAS: Arma[] = [
  { id: 'glock17', name: 'Glock 17', maker: 'Glock GmbH · Austria', group: 'Pistolas',
    common: {
      calibre: '9×19 mm Parabellum', sistema: 'Retroceso corto (Browning modificado) · percutor lanzado («striker») con seguro Safe Action',
      cadencia: 'Semiautomática', cargador: '17 cartuchos (bicolumna); también 19, 24, 31 y 33', alcance: '≈ 50 m',
      airsoft: 'Réplicas GBB (gas) muy extendidas: Tokyo Marui, Umarex/VFC (licencia oficial), WE; también AEP eléctricas',
      fuente: 'Wikipedia (Glock), Glock GmbH',
    },
    variants: [
      { id: 'gen5', name: 'Gen5', specs: { peso: '≈ 630 g sin cargador · ≈ 905 g cargada', cañon: '114 mm (4,49")', velocidad: '≈ 375 m/s (9 mm NATO)', extra: 'Longitud total 202 mm; empuñadura sin muescas; retén de corredera ambidiestro' } },
      { id: 'gen4', name: 'Gen4', specs: { peso: '≈ 625 g sin cargador', cañon: '114 mm (4,49")', velocidad: '≈ 375 m/s (9 mm NATO)', extra: 'Lomos de empuñadura intercambiables; muelle recuperador doble' } },
    ] },
];

/** Fichas externas (Wikipedia / IA) ya revisadas y promovidas con scripts/promover-arma.mjs. */
const GRUPO_EXT: Record<string, string> = { pistol: 'Pistolas', smg: 'Subfusiles', rifle: 'Otros' };
const PROMOVIDAS: Arma[] = (EXTERNAS as { slug: string; name: string; maker?: string; tipo?: string; generico: string; specs: Specs; photoUrl?: string }[]).map(f => ({
  id: f.slug, name: f.name, maker: f.maker ?? '', group: GRUPO_EXT[f.generico] ?? 'Otros', common: f.specs, variants: [{ id: 'std', name: f.tipo ?? 'Estándar', specs: {} }],
}));

/** Catálogo completo: modelos del constructor (con 3D) + fichas sin 3D. */
export const ARMAS: Arma[] = [
  ...MODELS.map<Arma>(m => ({
    id: m.id, name: m.name, maker: m.maker, group: m.group, common: m.common,
    variants: m.variants.map(v => { const pid = `${m.id}_${v.id}`; return { id: v.id, name: v.name, specs: v.specs, platform: pid in REAL_PLATFORMS ? pid : undefined }; }),
  })),
  ...FICHAS,
  ...PROMOVIDAS,
];

export const armaById = (id: string) => ARMAS.find(a => a.id === id);
export const has3d = (a: Arma) => a.variants.some(v => v.platform);
/** Foto del arma (clave del modelo en PHOTOS). */
export const armaPhoto = (a: Arma): Photo | undefined => PHOTOS[a.id];
/** Specs «de referencia» de un arma: las comunes completadas con la primera variante. */
export const refSpecs = (a: Arma): Specs => ({ ...a.variants[0]?.specs, ...a.common });

/* ── Datos serializables para el cliente (buscador y comparador; sin three) ── */

/** Calibres normalizados de un texto libre: «5,56×45 mm NATO · .300 BLK» → ['5,56×45', '.300 BLK']. */
export function calibresDe(txt?: string): string[] {
  if (!txt) return [];
  const out = new Set<string>();
  for (const m of txt.matchAll(/(\d+(?:[.,]\d+)?)\s*[×x]\s*(\d+)/gi)) out.add(`${m[1].replace('.', ',')}×${m[2]}`);
  for (const m of txt.matchAll(/\.\d{2,3}\s?[A-Z][A-Za-z&]*/g)) out.add(m[0].replace(/\s+/, ' '));
  return [...out];
}
/** País: el último segmento tras «·» del fabricante, sin paréntesis («Colt Canada · Reino Unido (UKSF)» → «Reino Unido»). */
export function paisDe(maker: string): string | undefined {
  const parts = maker.split('·'); if (parts.length < 2) return undefined;
  return parts[parts.length - 1].replace(/\(.*?\)/g, '').trim() || undefined;
}

export interface ArmaCard {
  id: string; name: string; maker: string; group: string;
  photo: string | null; calibre?: string; cadencia?: string;
  variants: string[]; has3d: boolean;
  /** Calibres normalizados (para filtrar) y país del fabricante. */
  calibres: string[]; pais?: string;
}
export const armaCards = (): ArmaCard[] => ARMAS.map(a => {
  const s = refSpecs(a); const ph = armaPhoto(a);
  const calibres = [...new Set([a.common.calibre, ...a.variants.map(v => v.specs.calibre)].flatMap(calibresDe))];
  return { id: a.id, name: a.name, maker: a.maker, group: a.group, photo: ph ? photoUrl(ph) : null, calibre: s.calibre, cadencia: s.cadencia, variants: a.variants.map(v => v.name), has3d: has3d(a), calibres, pais: paisDe(a.maker) };
});

/** Arma con sus variantes por separado: el comparador combina `common` + variante en el cliente. */
export interface ArmaComp {
  id: string; name: string; maker: string; group: string; photo: string | null;
  common: Specs;
  variants: { id: string; name: string; specs: Specs; modelo3d: boolean }[];
}
export const armaComps = (): ArmaComp[] => ARMAS.map(a => {
  const ph = armaPhoto(a);
  return { id: a.id, name: a.name, maker: a.maker, group: a.group, photo: ph ? photoUrl(ph) : null, common: a.common,
    variants: a.variants.map(v => ({ id: v.id, name: v.name, specs: v.specs, modelo3d: !!v.platform })) };
});
