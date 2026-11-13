import type { Builder } from './core/builder';

export type SlotType = 'optic' | 'muzzle' | 'under' | 'side' | 'mag' | 'stock' | 'grip';
export type Vec3 = [number, number, number];
export type ColorKey = 'negro' | 'tan' | 'od' | 'gris' | 'artico';

/** Punto de anclaje de una pieza sobre un cuerpo base (unidades: 1 = 100 mm). */
export interface Slot {
  id: string;
  type: SlotType;
  pos: Vec3;
  rot?: Vec3;
  scale?: number;
  /** Dirección y distancia del despiece animado. */
  explode: Vec3;
  /** Adaptador que se monta junto con la pieza (p. ej. montura lateral de AK). */
  adapter?: string;
  /** La posición se estimó porque el modelo GLB no traía el nodo slot_*. */
  guessed?: boolean;
}

export interface Specs {
  calibre?: string;
  peso?: string;
  cañon?: string;
  sistema?: string;
  cadencia?: string;
  velocidad?: string;
  alcance?: string;
  cargador?: string;
  airsoft?: string;
  extra?: string;
  fuente?: string;
}

export interface Platform {
  name: string;
  short: string;
  weight: number;
  build: (b: Builder) => void;
  slots: Slot[];
  defaults: Partial<Record<string, string>>;
  /** Etiquetas de compatibilidad: una pieza encaja si comparte alguna con su `fits`. */
  tags: string[];
  group?: string;
  variant?: string;
  model?: string;
  maker?: string;
  specs?: Specs;
  baseColor?: ColorKey;
  glb?: boolean;
  family?: string;
}

export interface Part {
  id: string;
  name: string;
  type: SlotType;
  weight: number;
  fits?: string[];
  color?: ColorKey;
  glb?: boolean;
  build: (b: Builder) => void;
}

export interface PartInstance { id: string; color: ColorKey }

export interface BuildState {
  v: 3;
  name: string;
  platform: string;
  baseColor: ColorKey;
  parts: Record<string, PartInstance>;
}

export const SLOT_TYPES: SlotType[] = ['optic', 'muzzle', 'under', 'side', 'mag', 'stock', 'grip'];

export const SLOT_LABEL: Record<SlotType, string> = {
  optic: 'Óptica', muzzle: 'Bocacha', under: 'Riel inferior', side: 'Riel lateral', mag: 'Cargador', stock: 'Culata', grip: 'Empuñadura',
};

export const COLORS: Record<ColorKey, string> = { negro: '#2c2e32', tan: '#b49a72', od: '#5c6343', gris: '#7c818a', artico: '#d6d6d1' };
export const COLOR_NAMES: Record<ColorKey, string> = { negro: 'Negro', tan: 'Tierra', od: 'Verde OD', gris: 'Gris lobo', artico: 'Ártico' };
export const isColorKey = (v: unknown): v is ColorKey => typeof v === 'string' && v in COLORS;
