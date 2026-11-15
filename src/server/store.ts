// Fichas externas (Wikipedia / IA): la caché es la fuente de verdad hasta que una ficha se revisa y se promueve
// al catálogo (scripts/promover-arma.mjs). Memoria (siempre) + archivos en .data/armas/ cuando el disco es escribible.
import { promises as fs } from 'node:fs';
import path from 'node:path';
import type { Specs } from '@/three/types';

export type Generico = 'pistol' | 'rifle' | 'smg';
export interface FotoExterna { url: string; author?: string; license?: string; licenseUrl?: string; source: string }
export interface FichaExterna {
  slug: string;
  origen: 'wikipedia' | 'ia';
  name: string;
  maker?: string;
  tipo?: string;
  specs: Specs;
  resumen?: string;
  photo?: FotoExterna;
  /** Origen de los datos (artículo o modelo) con su licencia. */
  fuente: { label: string; url?: string; license?: string; licenseUrl?: string };
  /** IA: direcciones consultadas. */
  fuentes?: string[];
  confianza?: 'alta' | 'media' | 'baja';
  /** Cuerpo genérico del constructor con el que se puede montar. */
  generico: Generico;
  fetchedAt: string;
  revisado: boolean;
}

const DIR = path.join(process.cwd(), '.data', 'armas');
const mem = new Map<string, FichaExterna>();
/** Nombre de archivo seguro y reversible: los caracteres fuera de [A-Za-z0-9_.-] se codifican como %XX. */
const fileOf = (slug: string) => slug.length <= 200 ? slug.replace(/[^\w.-]/g, c => '%' + c.charCodeAt(0).toString(16).padStart(2, '0')) : null;
const slugOf = (file: string) => decodeURIComponent(file.replace(/%(?![0-9a-f]{2})/gi, '%25'));

export async function getFicha(slug: string): Promise<FichaExterna | undefined> {
  const hit = mem.get(slug); if (hit) return hit;
  const s = fileOf(slug); if (!s) return undefined;
  try {
    const f = JSON.parse(await fs.readFile(path.join(DIR, `${s}.json`), 'utf8')) as FichaExterna;
    mem.set(slug, f); return f;
  } catch { return undefined; }
}

export async function putFicha(f: FichaExterna): Promise<void> {
  mem.set(f.slug, f);
  const s = fileOf(f.slug); if (!s) return;
  try { await fs.mkdir(DIR, { recursive: true }); await fs.writeFile(path.join(DIR, `${s}.json`), JSON.stringify(f, null, 2)); }
  catch { /* disco de solo lectura (producción): queda en memoria */ }
}

/** Todas las fichas conocidas (memoria + disco), para listar coincidencias ya consultadas. */
export async function listFichas(): Promise<FichaExterna[]> {
  try {
    for (const name of await fs.readdir(DIR)) {
      if (!name.endsWith('.json')) continue;
      const slug = slugOf(name.slice(0, -5));
      if (!mem.has(slug)) await getFicha(slug);
    }
  } catch { /* sin directorio */ }
  return [...mem.values()];
}

/** Cuerpo genérico más parecido según tipo y calibre. */
export function adivinarGenerico(tipo = '', calibre = ''): Generico {
  const t = `${tipo} ${calibre}`.toLowerCase();
  if (/subfusil|submachine|machine pistol|pistola ametralladora|smg|pdw/.test(t)) return 'smg';
  if (/pistol|revólver|revolver|handgun|arma corta/.test(t)) return 'pistol';
  if (/\b(9\s?[×x]\s?19|\.45 acp|\.40 s&w|9 ?mm|\.380|10 ?mm auto|\.357)\b/.test(t) && !/rifle|carabin|fusil/.test(t)) return 'pistol';
  return 'rifle';
}

export const slugify = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 80);
