// Catálogo leído de PostgreSQL. SOLO SERVIDOR (usa la BD): los componentes de cliente reciben datos ya serializados.
// La lectura completa se guarda en la caché de datos de Next con la etiqueta «catalogo» (y caduca cada hora por si acaso):
// el panel admin llama a revalidateTag('catalogo') al guardar y las páginas se regeneran con lo nuevo.
// Los ítems archivados no se leen, así que no aparecen en el sitio público.
import { unstable_cache } from 'next/cache';
import { cache } from 'react';
import { asc, isNull } from 'drizzle-orm';
import { accesorios, armas, getDb, glosario, imagenes, municion, varianteAccesorio, varianteMunicion, variantes } from '@/db/client';
import type { Accesorio, Arma, ArmaCard, ArmaComp, CampoGlosario, Cartucho, Foto, GrupoAcc, GrupoSistema, Par, Specs, Termino } from './tipos';
import { calibresDe, campoDe, paisDe, refSpecs } from './util';

export const ETIQUETA_CATALOGO = 'catalogo';

/* ───────── Lectura (JSON puro, apto para la caché de datos) ───────── */
interface FilaImagen { entidadTipo: string; entidadId: string; rol: string; orden: number; url: string; alt: string; titulo: string | null; autor: string | null; licencia: string | null; licenciaUrl: string | null; fuenteUrl: string | null; ajuste: string | null; tipoFoto: string | null; miniaturaUrl: string | null }
interface Snapshot {
  armas: { id: string; nombre: string; fabricante: string; grupo: string; specsComunes: Specs; origen: string; revisado: boolean }[];
  variantes: { id: number; armaId: string; slug: string; nombre: string; specs: Specs; plataforma3d: string | null }[];
  municion: { id: string; nombre: string; nombreCorto: string; tipo: string; eslogan: string; patronCalibre: string | null; patronFlags: string; claves: Par[]; hechos: Par[]; sobre: string[]; fuente: string }[];
  accesorios: { id: string; nombre: string; grupo: string; resumen: string; tecnico: string[]; modelos: Accesorio['modelos']; claves: Par[]; datos: Par[]; como: string[]; tipos: Par[] | null; pros: string[]; contras: string[]; airsoft: string; piezas3d: string[]; fuente: string }[];
  glosario: { id: string; nombre: string; grupo: string; corto: string; detalle: string; patron: string; patronFlags: string; sigla: string | null; apodo: string | null }[];
  imagenes: FilaImagen[];
  relMunicion: [number, string][];
  relAccesorio: [number, string][];
}

async function leerSnapshot(): Promise<Snapshot> {
  const db = getDb();
  const [A, V, M, C, G, I, RM, RA] = await Promise.all([
    db.select().from(armas).where(isNull(armas.archivadoEn)).orderBy(asc(armas.orden), asc(armas.nombre)),
    db.select().from(variantes).where(isNull(variantes.archivadoEn)).orderBy(asc(variantes.orden), asc(variantes.id)),
    db.select().from(municion).where(isNull(municion.archivadoEn)).orderBy(asc(municion.orden), asc(municion.nombre)),
    db.select().from(accesorios).where(isNull(accesorios.archivadoEn)).orderBy(asc(accesorios.orden), asc(accesorios.nombre)),
    db.select().from(glosario).where(isNull(glosario.archivadoEn)).orderBy(asc(glosario.orden), asc(glosario.nombre)),
    db.select().from(imagenes).where(isNull(imagenes.archivadoEn)).orderBy(asc(imagenes.entidadTipo), asc(imagenes.entidadId), asc(imagenes.orden), asc(imagenes.id)),
    db.select().from(varianteMunicion),
    db.select().from(varianteAccesorio),
  ]);
  return {
    armas: A.map(a => ({ id: a.id, nombre: a.nombre, fabricante: a.fabricante, grupo: a.grupo, specsComunes: a.specsComunes, origen: a.origen, revisado: a.revisado })),
    variantes: V.map(v => ({ id: v.id, armaId: v.armaId, slug: v.slug, nombre: v.nombre, specs: v.specs, plataforma3d: v.plataforma3d })),
    municion: M.map(m => ({ id: m.id, nombre: m.nombre, nombreCorto: m.nombreCorto, tipo: m.tipo, eslogan: m.eslogan, patronCalibre: m.patronCalibre, patronFlags: m.patronFlags, claves: m.claves, hechos: m.hechos, sobre: m.sobre, fuente: m.fuente })),
    accesorios: C.map(a => ({ id: a.id, nombre: a.nombre, grupo: a.grupo, resumen: a.resumen, tecnico: a.tecnico, modelos: a.modelos, claves: a.claves, datos: a.datos, como: a.como, tipos: a.tipos, pros: a.pros, contras: a.contras, airsoft: a.airsoft, piezas3d: a.piezas3d, fuente: a.fuente })),
    glosario: G.map(g => ({ id: g.id, nombre: g.nombre, grupo: g.grupo, corto: g.corto, detalle: g.detalle, patron: g.patron, patronFlags: g.patronFlags, sigla: g.sigla, apodo: g.apodo })),
    imagenes: I.map(i => ({ entidadTipo: i.entidadTipo, entidadId: i.entidadId, rol: i.rol, orden: i.orden, url: i.url, alt: i.alt, titulo: i.titulo, autor: i.autor, licencia: i.licencia, licenciaUrl: i.licenciaUrl, fuenteUrl: i.fuenteUrl, ajuste: i.ajuste, tipoFoto: i.tipoFoto, miniaturaUrl: i.miniaturaUrl })),
    relMunicion: RM.map(r => [r.varianteId, r.municionId]),
    relAccesorio: RA.map(r => [r.varianteId, r.accesorioId]),
  };
}
const snapshotCacheado = unstable_cache(leerSnapshot, ['catalogo-snapshot-v1'], { tags: [ETIQUETA_CATALOGO], revalidate: 3600 });

/** Una expresión mala en la BD (el panel no deja guardarla, pero podría llegar por otra vía) no debe tumbar el sitio: no coincide con nada. */
const regex = (src: string, flags: string): RegExp | undefined => { try { return new RegExp(src, flags); } catch { return undefined; } };
const NUNCA = /(?!)/;

/* ───────── Catálogo en memoria ───────── */
const foto = (i: FilaImagen): Foto => ({
  url: i.url, alt: i.alt, titulo: i.titulo ?? undefined, autor: i.autor ?? undefined, licencia: i.licencia ?? undefined, licenciaUrl: i.licenciaUrl ?? undefined,
  fuenteUrl: i.fuenteUrl ?? undefined, ajuste: (i.ajuste as Foto['ajuste']) ?? undefined, tipoFoto: (i.tipoFoto as Foto['tipoFoto']) ?? undefined, miniUrl: i.miniaturaUrl ?? undefined,
});

export class Catalogo {
  /** Armas del catálogo (incluye las fichas externas ya revisadas); las externas sin revisar quedan en `externas`. */
  readonly armas: Arma[];
  readonly externas: Arma[];
  readonly ammo: Cartucho[];
  readonly accesorios: Accesorio[];
  readonly sistemas: Termino[];
  private readonly relMun = new Map<number, string[]>();
  private readonly relAcc = new Map<number, string[]>();

  constructor(s: Snapshot) {
    const imgs = new Map<string, { principal?: Foto; galeria: Foto[] }>();
    for (const i of s.imagenes) {
      const k = `${i.entidadTipo}:${i.entidadId}`;
      const e = imgs.get(k) ?? { galeria: [] }; imgs.set(k, e);
      if (i.rol === 'principal') e.principal ??= foto(i); else e.galeria.push(foto(i));
    }
    const de = (tipo: string, id: string) => imgs.get(`${tipo}:${id}`) ?? { galeria: [] };

    const todas: Arma[] = s.armas.map(a => ({
      id: a.id, name: a.nombre, maker: a.fabricante, group: a.grupo, common: a.specsComunes,
      origen: a.origen as Arma['origen'], revisado: a.revisado,
      variants: s.variantes.filter(v => v.armaId === a.id).map(v => ({ id: v.slug, dbId: v.id, name: v.nombre, specs: v.specs, platform: v.plataforma3d ?? undefined })),
      foto: de('arma', a.id).principal, galeria: de('arma', a.id).galeria,
    }));
    this.armas = todas.filter(a => a.revisado);
    this.externas = todas.filter(a => !a.revisado);
    this.ammo = s.municion.map(m => ({
      id: m.id, name: m.nombre, short: m.nombreCorto, kind: m.tipo as Cartucho['kind'], tagline: m.eslogan,
      match: m.patronCalibre ? regex(m.patronCalibre, m.patronFlags) : undefined,
      facts: m.hechos, about: m.sobre, key: m.claves, fuente: m.fuente, foto: de('municion', m.id).principal, galeria: de('municion', m.id).galeria,
    }));
    this.accesorios = s.accesorios.map(a => ({
      id: a.id, nombre: a.nombre, grupo: a.grupo as GrupoAcc, resumen: a.resumen, tecnico: a.tecnico, modelos: a.modelos, clave: a.claves, datos: a.datos, como: a.como,
      variantes: a.tipos ?? undefined, pros: a.pros, contras: a.contras, airsoft: a.airsoft, partes: a.piezas3d, fuente: a.fuente,
      foto: de('accesorio', a.id).principal, galeria: de('accesorio', a.id).galeria,
    }));
    this.sistemas = s.glosario.map(g => ({
      id: g.id, nombre: g.nombre, grupo: g.grupo as GrupoSistema, corto: g.corto, detalle: g.detalle, patron: regex(g.patron, g.patronFlags) ?? NUNCA,
      sigla: g.sigla ?? undefined, apodo: g.apodo ?? undefined,
    }));
    for (const [v, m] of s.relMunicion) this.relMun.set(v, [...(this.relMun.get(v) ?? []), m]);
    for (const [v, a] of s.relAccesorio) this.relAcc.set(v, [...(this.relAcc.get(v) ?? []), a]);
  }

  armaById = (id: string) => this.armas.find(a => a.id === id);
  externaById = (id: string) => this.externas.find(a => a.id === id);
  ammoById = (id: string) => this.ammo.find(c => c.id === id);
  accById = (id: string) => this.accesorios.find(a => a.id === id);
  accDelGrupo = (g: string) => this.accesorios.filter(a => a.grupo === g);

  /** Cartuchos que menciona el texto de calibre de un arma (p. ej. «5,56×45 mm NATO · .300 BLK»). */
  ammoForCalibre = (calibre?: string): Cartucho[] => (calibre ? this.ammo.filter(c => c.match?.test(calibre)) : []);

  /** Términos del glosario presentes en el texto de un campo («Sistema / cerrojo» por defecto, «Réplica airsoft» o el texto de un accesorio), en el orden del glosario. */
  sistemasDe = (texto?: string, campo: CampoGlosario = 'sistema'): Termino[] =>
    (texto ? this.sistemas.filter(s => campoDe(s.grupo) === campo && s.patron.test(texto)) : []);

  /** Cartuchos de una variante (relación editable), en el orden de la lista de munición. */
  cartuchosDe(v: { dbId: number }): Cartucho[] {
    const ids = new Set(this.relMun.get(v.dbId) ?? []);
    return this.ammo.filter(c => ids.has(c.id));
  }
  /** Accesorios que encajan en una variante; si no tiene relaciones propias, los de las demás variantes del arma. */
  accesoriosDe(a: Arma, v: { dbId: number }): Accesorio[] {
    const propios = this.relAcc.get(v.dbId);
    const ids = new Set(propios?.length ? propios : a.variants.flatMap(x => this.relAcc.get(x.dbId) ?? []));
    return this.accesorios.filter(x => ids.has(x.id));
  }
  /** Armas del catálogo en las que encaja un accesorio (alguna de sus variantes). */
  armasConAccesorio(acc: Accesorio): Arma[] {
    return this.armas.filter(a => a.variants.some(v => this.relAcc.get(v.dbId)?.includes(acc.id)));
  }
  /** Armas del catálogo que tienen accesorios compatibles (el «todas» de las fichas de accesorios). */
  get armasConAccesorios(): Arma[] { return this.armas.filter(a => a.variants.some(v => this.relAcc.get(v.dbId)?.length)); }
  /** Armas que usan un cartucho (las réplicas de airsoft usan todas la bola de 6 mm). */
  modelsUsing(c: Cartucho): Arma[] {
    return c.kind === 'airsoft' ? this.armas : this.armas.filter(a => a.variants.some(v => this.relMun.get(v.dbId)?.includes(c.id)));
  }

  /** Datos de la portada (serializables, sin la ficha completa). */
  cards(): ArmaCard[] {
    return this.armas.map(a => {
      const s = refSpecs(a);
      const calibres = [...new Set([a.common.calibre, ...a.variants.map(v => v.specs.calibre)].flatMap(calibresDe))];
      return { id: a.id, name: a.name, maker: a.maker, group: a.group, photo: a.foto?.url ?? null, calibre: s.calibre, cadencia: s.cadencia, variants: a.variants.map(v => v.name), has3d: a.variants.some(v => v.platform), calibres, pais: paisDe(a.maker) };
    });
  }
  /** Arma con sus variantes por separado: el comparador combina `common` + variante en el cliente. */
  comps(): ArmaComp[] {
    return this.armas.map(a => ({
      id: a.id, name: a.name, maker: a.maker, group: a.group, photo: a.foto?.url ?? null, common: a.common,
      variants: a.variants.map(v => ({ id: v.id, name: v.name, specs: v.specs, modelo3d: !!v.platform })),
    }));
  }
}

/** Catálogo completo de la petición actual (una sola lectura por petición; la BD solo se consulta si caducó la caché). */
export const getCatalogo = cache(async (): Promise<Catalogo> => new Catalogo(await snapshotCacheado()));
