// Inventario de TODAS las imágenes actuales (locales y externas) con su metadato y el destino en S3.
// Lo usan scripts/subir-imagenes.ts (sube los archivos) y scripts/seed.ts (guarda los enlaces en la BD).
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { ARMAS, armaPhoto } from '../src/three/data/armas';
import { AMMO } from '../src/three/data/ammo';
import { ACCESORIOS } from '../src/three/data/accesorios';
import galeria from '../src/three/data/galeria.json';
import type { FichaExterna } from '../src/server/store';
import { urlImagenS3 } from '../src/server/s3';

export type EntidadTipo = 'arma' | 'municion' | 'accesorio';
export interface ImagenInv {
  entidadTipo: EntidadTipo;
  entidadId: string;
  rol: 'principal' | 'galeria';
  orden: number;
  origen: 's3' | 'externo';
  /** Archivo local (solo origen s3) y ruta pública sin carpeta («armas/principal/m4.png»). */
  local?: string;
  ruta?: string;
  miniLocal?: string;
  miniRuta?: string;
  url: string;
  miniUrl?: string;
  alt: string;
  titulo?: string;
  autor?: string;
  licencia?: string;
  licenciaUrl?: string;
  fuenteUrl?: string;
  ajuste?: 'scene' | 'cutout';
  tipoFoto?: 'real' | 'airsoft';
}

const RAIZ = process.cwd();
const pub = (...p: string[]) => path.join(RAIZ, 'public', ...p);
const DIR: Record<EntidadTipo, string> = { arma: 'armas', municion: 'municion', accesorio: 'accesorios' };
const TIPO_GALERIA: Record<string, EntidadTipo> = { armas: 'arma', balas: 'municion', accesorios: 'accesorio' };
const EXT = /\.(jpe?g|png|webp|avif)$/i;

export const faltantes: string[] = [];
function local(tipo: EntidadTipo, rol: 'principal' | 'galeria', archivo: string, ruta: string): Pick<ImagenInv, 'origen' | 'local' | 'ruta' | 'url'> | null {
  if (!existsSync(archivo)) { faltantes.push(archivo); return null; }
  const r = `${DIR[tipo]}/${rol}/${ruta}`;
  return { origen: 's3', local: archivo, ruta: r, url: urlImagenS3(r) };
}

export function inventarioImagenes(): ImagenInv[] {
  const out: ImagenInv[] = [];

  // Armas: foto principal
  for (const a of ARMAS) {
    const ph = armaPhoto(a); if (!ph) continue;
    const base = local('arma', 'principal', pub('photos', ph.file), ph.file); if (!base) continue;
    out.push({ ...base, entidadTipo: 'arma', entidadId: a.id, rol: 'principal', orden: 0,
      alt: `${a.name}: foto ${ph.kind === 'real' ? 'del arma real' : 'de la réplica de airsoft'}`,
      autor: ph.author, licencia: ph.license, licenciaUrl: ph.licenseUrl, fuenteUrl: ph.source, ajuste: ph.fit ?? 'cutout', tipoFoto: ph.kind });
  }
  // Munición: foto principal
  for (const c of AMMO) {
    const base = local('municion', 'principal', pub('ammo', c.photo.file), c.photo.file); if (!base) continue;
    out.push({ ...base, entidadTipo: 'municion', entidadId: c.id, rol: 'principal', orden: 0, alt: c.photo.alt, titulo: c.photo.caption,
      autor: c.photo.author, licencia: c.photo.license, licenciaUrl: c.photo.licenseUrl, fuenteUrl: c.photo.source });
  }
  // Accesorios: foto principal (+ miniatura de 360 px si existe)
  for (const a of ACCESORIOS) {
    const f = a.foto; if (!f) continue;
    const base = local('accesorio', 'principal', pub('accesorios', f.file), f.file); if (!base) continue;
    const mini = pub('accesorios', 't', f.file);
    const m = existsSync(mini) ? { miniLocal: mini, miniRuta: `accesorios/principal/t/${f.file}`, miniUrl: urlImagenS3(`accesorios/principal/t/${f.file}`) } : {};
    out.push({ ...base, ...m, entidadTipo: 'accesorio', entidadId: a.id, rol: 'principal', orden: 0, alt: f.alt,
      autor: f.author, licencia: f.license, licenciaUrl: f.licenseUrl, fuenteUrl: f.source });
  }
  // Galerías de apoyo (galeria.json) y las que se hayan dejado a mano como «<id>-extra-N.<ext>»
  const nombre = (t: EntidadTipo, id: string) => (t === 'arma' ? ARMAS.find(a => a.id === id)?.name : t === 'municion' ? AMMO.find(c => c.id === id)?.name : ACCESORIOS.find(a => a.id === id)?.nombre) ?? id;
  for (const [clave, lista] of Object.entries(galeria as Record<string, { file: string; title: string; author?: string; license?: string; licenseUrl?: string; source?: string }[]>)) {
    const [dirG, id] = clave.split('/'); const tipo = TIPO_GALERIA[dirG]; if (!tipo) continue;
    lista.forEach((g, n) => {
      const archivo = path.basename(g.file);
      const base = local(tipo, 'galeria', pub('galeria', g.file), archivo); if (!base) return;
      out.push({ ...base, entidadTipo: tipo, entidadId: id, rol: 'galeria', orden: n + 1, alt: `${nombre(tipo, id)}: ${g.title}`, titulo: g.title,
        autor: g.author, licencia: g.license, licenciaUrl: g.licenseUrl, fuenteUrl: g.source });
    });
  }
  for (const dirG of Object.keys(TIPO_GALERIA)) {
    const dir = pub('galeria', dirG); if (!existsSync(dir)) continue;
    const tipo = TIPO_GALERIA[dirG];
    const registrados = new Set(out.filter(o => o.rol === 'galeria').map(o => o.local));
    for (const f of readdirSync(dir)) {
      const m = /^(.+)-extra-(\d+).*\.(jpe?g|png|webp|avif)$/i.exec(f); if (!m || !EXT.test(f)) continue;
      const archivo = path.join(dir, f); if (registrados.has(archivo)) continue;
      const base = local(tipo, 'galeria', archivo, f); if (!base) continue;
      out.push({ ...base, entidadTipo: tipo, entidadId: m[1], rol: 'galeria', orden: 100 + Number(m[2]), alt: nombre(tipo, m[1]) });
    }
  }
  // Fichas externas (caché de Wikipedia en .data/armas): la foto es un enlace externo
  for (const ficha of fichasExternas()) {
    if (!ficha.photo?.url) continue;
    out.push({ entidadTipo: 'arma', entidadId: ficha.slug, rol: 'principal', orden: 0, origen: 'externo', url: ficha.photo.url, alt: ficha.name,
      autor: ficha.photo.author, licencia: ficha.photo.license, licenciaUrl: ficha.photo.licenseUrl, fuenteUrl: ficha.photo.source });
  }
  return out;
}

/** Fichas externas guardadas en .data/armas (caché de Wikipedia / IA, aún sin promover al catálogo). */
export function fichasExternas(): FichaExterna[] {
  const dir = path.join(RAIZ, '.data', 'armas');
  if (!existsSync(dir)) return [];
  return readdirSync(dir).filter(x => x.endsWith('.json')).sort().map(f => JSON.parse(readFileSync(path.join(dir, f), 'utf8')) as FichaExterna);
}
