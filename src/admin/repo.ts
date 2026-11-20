// Acceso a datos del panel. SOLO SERVIDOR. Cada escritura va en una transacción y deja una fila en `registro_cambios`
// (usuario, acción, antes y después). Borrar = archivar: nada se elimina de verdad y todo se puede restaurar.
import { and, asc, desc, eq, inArray, isNull, sql, type SQL } from 'drizzle-orm';
import { TransactionRollbackError } from 'drizzle-orm/errors';
import { accesorios, armas, getDb, glosario, municion, registroCambios, varianteAccesorio, varianteMunicion, variantes, type Db } from '@/db/client';
import { calibresDe, paisDe } from '@/catalogo/util';
import type { Specs } from '@/catalogo/tipos';
import { ENTIDADES, type Seg, type TipoReg } from './entidades';
import type { ArmaConVariantes, FormAccesorio, FormArma, FormMunicion, FormTermino, OpcionRel } from './tipos';
import type { z } from 'zod';
import type { esquemaAccesorio, esquemaArma, esquemaMunicion, esquemaTermino } from './esquemas';

export type Tx = Parameters<Parameters<Db['transaction']>[0]>[0];
export type Resultado = { ok: true; id: string; cambio: boolean } | { ok: false; errores: string[] };
export const falla = (...errores: string[]): Resultado => ({ ok: false, errores });

export type DatosArma = z.output<typeof esquemaArma>;
export type DatosMunicion = z.output<typeof esquemaMunicion>;
export type DatosAccesorio = z.output<typeof esquemaAccesorio>;
export type DatosTermino = z.output<typeof esquemaTermino>;

export const ahora = () => new Date();
export const igual = (a: unknown, b: unknown) => JSON.stringify(a) === JSON.stringify(b);
const nulo = (s: string) => (s ? s : null);
const ordenados = (a: string[]) => [...a].sort();
/** Quita las marcas de tiempo: no deben contar como «cambio» ni llenar el registro. */
export const sinFechas = <T extends object>(o: T) => Object.fromEntries(Object.entries(o).filter(([k]) => k !== 'creadoEn' && k !== 'actualizadoEn' && k !== 'archivadoEn'));

export async function registrar(tx: Tx, usuario: string, accion: string, tipo: TipoReg, id: string, antes: unknown, despues: unknown) {
  await tx.insert(registroCambios).values({ usuario, accion, entidadTipo: tipo, entidadId: id, antes: antes ?? null, despues: despues ?? null });
}

/* ═════════════ Listados ═════════════ */
export interface FilaLista { id: string; nombre: string; detalle: string; grupo: string; etiquetas: string[]; avisos: string[]; archivado: boolean; actualizado: Date }

export async function listar(seg: Seg): Promise<FilaLista[]> {
  const db = getDb();
  const cuenta = async (q: SQL) => new Map((await db.execute(q) as unknown as { id: string; n: number }[]).map(r => [r.id, Number(r.n)]));
  if (seg === 'armas') {
    const [A, nv] = await Promise.all([
      db.select().from(armas).orderBy(asc(armas.orden), asc(armas.nombre)),
      cuenta(sql`select arma_id as id, count(*)::int as n from variantes where archivado_en is null group by 1`),
    ]);
    return A.map(a => ({
      id: a.id, nombre: a.nombre, detalle: a.fabricante, grupo: a.grupo, archivado: !!a.archivadoEn, actualizado: a.actualizadoEn,
      etiquetas: [`${nv.get(a.id) ?? 0} variante${nv.get(a.id) === 1 ? '' : 's'}`, ...(a.origen !== 'catalogo' ? [a.origen === 'ia' ? 'Ficha IA' : 'Wikipedia'] : [])],
      avisos: a.revisado ? [] : ['Sin revisar (no se muestra en el sitio)'],
    }));
  }
  if (seg === 'municion') {
    const [M, na] = await Promise.all([
      db.select().from(municion).orderBy(asc(municion.orden), asc(municion.nombre)),
      cuenta(sql`select vm.municion_id as id, count(distinct v.arma_id)::int as n from variante_municion vm
        join variantes v on v.id = vm.variante_id and v.archivado_en is null join armas a on a.id = v.arma_id and a.archivado_en is null group by 1`),
    ]);
    return M.map(m => ({
      id: m.id, nombre: m.nombre, detalle: m.eslogan, grupo: m.tipo === 'airsoft' ? 'Airsoft' : 'Real', archivado: !!m.archivadoEn, actualizado: m.actualizadoEn,
      etiquetas: m.tipo === 'airsoft' ? ['Todas las réplicas'] : [`${na.get(m.id) ?? 0} arma${na.get(m.id) === 1 ? '' : 's'}`], avisos: [],
    }));
  }
  if (seg === 'accesorios') {
    const [C, na] = await Promise.all([
      db.select().from(accesorios).orderBy(asc(accesorios.orden), asc(accesorios.nombre)),
      cuenta(sql`select va.accesorio_id as id, count(distinct v.arma_id)::int as n from variante_accesorio va
        join variantes v on v.id = va.variante_id and v.archivado_en is null join armas a on a.id = v.arma_id and a.archivado_en is null group by 1`),
    ]);
    return C.map(c => {
      const n = na.get(c.id) ?? 0;
      return { id: c.id, nombre: c.nombre, detalle: c.resumen, grupo: c.grupo, archivado: !!c.archivadoEn, actualizado: c.actualizadoEn, etiquetas: [`${n} arma${n === 1 ? '' : 's'}`], avisos: n ? [] : ['Sin armas asociadas'] };
    });
  }
  const G = await db.select().from(glosario).orderBy(asc(glosario.orden), asc(glosario.nombre));
  return G.map(g => ({ id: g.id, nombre: g.nombre, detalle: g.corto, grupo: g.grupo, archivado: !!g.archivadoEn, actualizado: g.actualizadoEn, etiquetas: g.sigla ? [g.sigla] : [], avisos: [] }));
}

/* ═════════════ Opciones para las relaciones ═════════════ */
export async function opcionesMunicion(): Promise<OpcionRel[]> {
  const M = await getDb().select().from(municion).where(and(isNull(municion.archivadoEn), eq(municion.tipo, 'real'))).orderBy(asc(municion.orden), asc(municion.nombre));
  return M.map(m => ({ id: m.id, label: m.nombre }));
}
export async function opcionesAccesorios(): Promise<OpcionRel[]> {
  const C = await getDb().select().from(accesorios).where(isNull(accesorios.archivadoEn)).orderBy(asc(accesorios.orden), asc(accesorios.nombre));
  return C.map(c => ({ id: c.id, label: c.nombre, grupo: c.grupo }));
}
/** Armas activas con sus variantes activas: es lo que se ofrece al relacionar un cartucho o accesorio. */
export async function armasConVariantes(): Promise<ArmaConVariantes[]> {
  const db = getDb();
  const [A, V] = await Promise.all([
    db.select({ id: armas.id, nombre: armas.nombre }).from(armas).where(isNull(armas.archivadoEn)).orderBy(asc(armas.orden), asc(armas.nombre)),
    db.select({ id: variantes.id, armaId: variantes.armaId, nombre: variantes.nombre }).from(variantes).where(isNull(variantes.archivadoEn)).orderBy(asc(variantes.orden), asc(variantes.id)),
  ]);
  return A.map(a => ({ id: a.id, nombre: a.nombre, variantes: V.filter(v => v.armaId === a.id).map(v => ({ dbId: v.id, nombre: v.nombre })) })).filter(a => a.variantes.length);
}

/* ═════════════ Lecturas para los formularios ═════════════ */
export interface Leido<T> { form: T; archivadoEn: Date | null; actualizadoEn: Date; origen?: string }

async function variantesOfrecidas(q: Db | Tx): Promise<number[]> {
  const r = await q.select({ id: variantes.id }).from(variantes).innerJoin(armas, eq(armas.id, variantes.armaId)).where(and(isNull(variantes.archivadoEn), isNull(armas.archivadoEn)));
  return r.map(x => x.id);
}

export async function leerArma(id: string): Promise<Leido<FormArma> | null> {
  const db = getDb();
  const [a] = await db.select().from(armas).where(eq(armas.id, id));
  if (!a) return null;
  const vs = await db.select().from(variantes).where(and(eq(variantes.armaId, id), isNull(variantes.archivadoEn))).orderBy(asc(variantes.orden), asc(variantes.id));
  const ids = vs.map(v => v.id);
  const [rm, ra] = ids.length
    ? await Promise.all([db.select().from(varianteMunicion).where(inArray(varianteMunicion.varianteId, ids)), db.select().from(varianteAccesorio).where(inArray(varianteAccesorio.varianteId, ids))])
    : [[], []];
  return {
    archivadoEn: a.archivadoEn, actualizadoEn: a.actualizadoEn, origen: a.origen,
    form: {
      modo: 'editar', id: a.id, nombre: a.nombre, fabricante: a.fabricante, grupo: a.grupo, orden: a.orden, revisado: a.revisado, tipo: a.tipo ?? '', resumen: a.resumen ?? '',
      specsComunes: a.specsComunes,
      variantes: vs.map(v => ({
        dbId: v.id, slug: v.slug, nombre: v.nombre, plataforma3d: v.plataforma3d ?? '', specs: v.specs,
        municion: rm.filter(r => r.varianteId === v.id).map(r => r.municionId), accesorios: ra.filter(r => r.varianteId === v.id).map(r => r.accesorioId),
      })),
    },
  };
}

export async function leerMunicion(id: string): Promise<Leido<FormMunicion> | null> {
  const db = getDb();
  const [m] = await db.select().from(municion).where(eq(municion.id, id));
  if (!m) return null;
  const ofrecidas = new Set(await variantesOfrecidas(db));
  const rel = (await db.select().from(varianteMunicion).where(eq(varianteMunicion.municionId, id))).map(r => r.varianteId).filter(v => ofrecidas.has(v));
  return {
    archivadoEn: m.archivadoEn, actualizadoEn: m.actualizadoEn,
    form: {
      modo: 'editar', id: m.id, nombre: m.nombre, nombreCorto: m.nombreCorto, tipo: m.tipo === 'airsoft' ? 'airsoft' : 'real', eslogan: m.eslogan,
      patronCalibre: m.patronCalibre ?? '', patronFlags: m.patronFlags === 'i' ? 'i' : '', claves: m.claves, hechos: m.hechos, sobre: m.sobre, fuente: m.fuente, orden: m.orden, variantes: rel,
    },
  };
}

export async function leerAccesorio(id: string): Promise<Leido<FormAccesorio> | null> {
  const db = getDb();
  const [a] = await db.select().from(accesorios).where(eq(accesorios.id, id));
  if (!a) return null;
  const ofrecidas = new Set(await variantesOfrecidas(db));
  const rel = (await db.select().from(varianteAccesorio).where(eq(varianteAccesorio.accesorioId, id))).map(r => r.varianteId).filter(v => ofrecidas.has(v));
  return {
    archivadoEn: a.archivadoEn, actualizadoEn: a.actualizadoEn,
    form: {
      modo: 'editar', id: a.id, nombre: a.nombre, grupo: a.grupo, resumen: a.resumen, tecnico: a.tecnico, modelos: a.modelos.map(m => (typeof m === 'string' ? [m, ''] : m)),
      claves: a.claves, datos: a.datos, como: a.como, tipos: a.tipos ?? [], pros: a.pros, contras: a.contras, airsoft: a.airsoft, piezas3d: a.piezas3d, fuente: a.fuente, orden: a.orden, variantes: rel,
    },
  };
}

export async function leerTermino(id: string): Promise<Leido<FormTermino> | null> {
  const [g] = await getDb().select().from(glosario).where(eq(glosario.id, id));
  if (!g) return null;
  return {
    archivadoEn: g.archivadoEn, actualizadoEn: g.actualizadoEn,
    form: { modo: 'editar', id: g.id, nombre: g.nombre, grupo: g.grupo, corto: g.corto, detalle: g.detalle, patron: g.patron, patronFlags: g.patronFlags === 'i' ? 'i' : '', sigla: g.sigla ?? '', apodo: g.apodo ?? '', orden: g.orden },
  };
}

/** Siguiente número de «orden» de una tabla (para que lo nuevo quede al final). */
export async function siguienteOrden(seg: Seg): Promise<number> {
  const t = { armas, municion, accesorios, glosario }[seg];
  const [r] = await getDb().select({ m: sql<number>`coalesce(max(${t.orden}), -1) + 1` }).from(t);
  return Number(r.m);
}

/* ═════════════ Escrituras ═════════════ */
async function existe(q: Db | Tx, seg: Seg, id: string): Promise<boolean> {
  const t = { armas, municion, accesorios, glosario }[seg];
  return (await q.select({ id: t.id }).from(t).where(eq(t.id, id))).length > 0;
}
const textoModo = (modo: 'crear' | 'editar', seg: Seg, id: string, hay: boolean): string | null =>
  modo === 'crear' && hay ? `Ya existe ${ENTIDADES[seg].singular === 'arma' ? 'un arma' : `un ${ENTIDADES[seg].singular}`} con el identificador «${id}» (puede estar archivado: búscalo con «Mostrar archivados»).`
  : modo === 'editar' && !hay ? `No existe ${ENTIDADES[seg].singular === 'arma' ? 'el arma' : `el ${ENTIDADES[seg].singular}`} «${id}».` : null;

/* ── Arma + variantes + relaciones ── */
async function fotoArma(tx: Tx, id: string) {
  const [a] = await tx.select().from(armas).where(eq(armas.id, id));
  if (!a) return null;
  const vs = await tx.select().from(variantes).where(and(eq(variantes.armaId, id), isNull(variantes.archivadoEn))).orderBy(asc(variantes.orden), asc(variantes.id));
  const ids = vs.map(v => v.id);
  const [rm, ra] = ids.length
    ? await Promise.all([tx.select().from(varianteMunicion).where(inArray(varianteMunicion.varianteId, ids)), tx.select().from(varianteAccesorio).where(inArray(varianteAccesorio.varianteId, ids))])
    : [[], []];
  return {
    id: a.id, nombre: a.nombre, fabricante: a.fabricante, grupo: a.grupo, pais: a.pais, orden: a.orden, revisado: a.revisado, origen: a.origen, tipo: a.tipo, resumen: a.resumen,
    specsComunes: a.specsComunes, calibres: a.calibres,
    variantes: vs.map(v => ({
      slug: v.slug, nombre: v.nombre, plataforma3d: v.plataforma3d, specs: v.specs,
      municion: ordenados(rm.filter(r => r.varianteId === v.id).map(r => r.municionId)), accesorios: ordenados(ra.filter(r => r.varianteId === v.id).map(r => r.accesorioId)),
    })),
  };
}

async function desconocidos(tx: Tx, tabla: typeof municion | typeof accesorios, ids: string[]): Promise<string[]> {
  if (!ids.length) return [];
  const ok = new Set((await tx.select({ id: tabla.id }).from(tabla).where(inArray(tabla.id, ids))).map(r => r.id));
  return ids.filter(i => !ok.has(i));
}

export async function guardarArma(d: DatosArma, usuario: string): Promise<Resultado> {
  return getDb().transaction(async (tx): Promise<Resultado> => {
    const hay = await existe(tx, 'armas', d.id);
    const err = textoModo(d.modo, 'armas', d.id, hay);
    if (err) return falla(err);
    const malMun = await desconocidos(tx, municion, [...new Set(d.variantes.flatMap(v => v.municion))]);
    const malAcc = await desconocidos(tx, accesorios, [...new Set(d.variantes.flatMap(v => v.accesorios))]);
    if (malMun.length || malAcc.length) return falla(`Relaciones con elementos que no existen: ${[...malMun, ...malAcc].join(', ')}`);

    const antes = hay ? await fotoArma(tx, d.id) : null;
    const fila = {
      nombre: d.nombre, fabricante: d.fabricante, grupo: d.grupo, pais: paisDe(d.fabricante) ?? null, specsComunes: d.specsComunes as Specs,
      calibres: [...new Set([d.specsComunes.calibre, ...d.variantes.map(v => v.specs.calibre)].flatMap(calibresDe))],
      revisado: d.revisado, tipo: nulo(d.tipo), resumen: nulo(d.resumen), orden: d.modo === 'crear' && d.orden === 0 ? await siguienteOrden('armas') : d.orden,
    };
    if (!hay) await tx.insert(armas).values({ id: d.id, ...fila, origen: 'catalogo' });
    else await tx.update(armas).set({ ...fila, actualizadoEn: ahora() }).where(eq(armas.id, d.id));

    const existentes = await tx.select().from(variantes).where(eq(variantes.armaId, d.id));
    const vistos = new Set<number>();
    for (const [i, v] of d.variantes.entries()) {
      const ex = existentes.find(e => (v.dbId ? e.id === v.dbId : e.slug === v.slug));
      const datos = { nombre: v.nombre, specs: v.specs as Specs, plataforma3d: nulo(v.plataforma3d), orden: i, archivadoEn: null, actualizadoEn: ahora() };
      let vid: number;
      if (ex) { await tx.update(variantes).set(datos).where(eq(variantes.id, ex.id)); vid = ex.id; }
      else vid = (await tx.insert(variantes).values({ armaId: d.id, slug: v.slug, ...datos }).returning({ id: variantes.id }))[0].id;
      vistos.add(vid);
      await tx.delete(varianteMunicion).where(eq(varianteMunicion.varianteId, vid));
      await tx.delete(varianteAccesorio).where(eq(varianteAccesorio.varianteId, vid));
      if (v.municion.length) await tx.insert(varianteMunicion).values([...new Set(v.municion)].map(m => ({ varianteId: vid, municionId: m })));
      if (v.accesorios.length) await tx.insert(varianteAccesorio).values([...new Set(v.accesorios)].map(a => ({ varianteId: vid, accesorioId: a })));
    }
    // Las variantes que ya no están en el formulario se archivan (conservan su id y sus relaciones)
    for (const e of existentes) if (!vistos.has(e.id) && !e.archivadoEn) await tx.update(variantes).set({ archivadoEn: ahora(), actualizadoEn: ahora() }).where(eq(variantes.id, e.id));

    const despues = await fotoArma(tx, d.id);
    if (hay && igual(antes, despues)) { tx.rollback(); }
    await registrar(tx, usuario, hay ? 'editar' : 'crear', 'arma', d.id, antes, despues);
    return { ok: true, id: d.id, cambio: true };
  }).catch(sinCambios(d.id));
}

/* ── Munición y accesorio: ficha + relación con variantes ── */
/** Solo se tocan las relaciones con variantes visibles en el formulario: las de variantes o armas archivadas se conservan. */
async function reemplazarRelMunicion(tx: Tx, municionId: string, elegidas: number[]) {
  const ofrecidas = await variantesOfrecidas(tx);
  if (ofrecidas.length) await tx.delete(varianteMunicion).where(and(eq(varianteMunicion.municionId, municionId), inArray(varianteMunicion.varianteId, ofrecidas)));
  const nuevas = [...new Set(elegidas)].filter(v => ofrecidas.includes(v));
  if (nuevas.length) await tx.insert(varianteMunicion).values(nuevas.map(varianteId => ({ varianteId, municionId })));
}
async function reemplazarRelAccesorio(tx: Tx, accesorioId: string, elegidas: number[]) {
  const ofrecidas = await variantesOfrecidas(tx);
  if (ofrecidas.length) await tx.delete(varianteAccesorio).where(and(eq(varianteAccesorio.accesorioId, accesorioId), inArray(varianteAccesorio.varianteId, ofrecidas)));
  const nuevas = [...new Set(elegidas)].filter(v => ofrecidas.includes(v));
  if (nuevas.length) await tx.insert(varianteAccesorio).values(nuevas.map(varianteId => ({ varianteId, accesorioId })));
}
async function etiquetasVariantes(tx: Tx, ids: number[]): Promise<string[]> {
  if (!ids.length) return [];
  const r = await tx.select({ id: variantes.id, arma: variantes.armaId, slug: variantes.slug }).from(variantes).where(inArray(variantes.id, ids));
  return r.map(x => `${x.arma}/${x.slug}`).sort();
}

async function fotoMunicion(tx: Tx, id: string) {
  const [m] = await tx.select().from(municion).where(eq(municion.id, id));
  if (!m) return null;
  const ofrecidas = new Set(await variantesOfrecidas(tx));
  const rel = (await tx.select().from(varianteMunicion).where(eq(varianteMunicion.municionId, id))).map(r => r.varianteId).filter(v => ofrecidas.has(v));
  return { ...sinFechas(m), usadaPor: await etiquetasVariantes(tx, rel) };
}
export async function guardarMunicion(d: DatosMunicion, usuario: string): Promise<Resultado> {
  return getDb().transaction(async (tx): Promise<Resultado> => {
    const hay = await existe(tx, 'municion', d.id);
    const err = textoModo(d.modo, 'municion', d.id, hay);
    if (err) return falla(err);
    const antes = hay ? await fotoMunicion(tx, d.id) : null;
    const fila = {
      nombre: d.nombre, nombreCorto: d.nombreCorto, tipo: d.tipo, eslogan: d.eslogan, patronCalibre: nulo(d.patronCalibre), patronFlags: d.patronFlags,
      claves: d.claves, hechos: d.hechos, sobre: d.sobre, fuente: d.fuente, orden: d.modo === 'crear' && d.orden === 0 ? await siguienteOrden('municion') : d.orden,
    };
    if (!hay) await tx.insert(municion).values({ id: d.id, ...fila });
    else await tx.update(municion).set({ ...fila, actualizadoEn: ahora() }).where(eq(municion.id, d.id));
    if (d.tipo === 'real') await reemplazarRelMunicion(tx, d.id, d.variantes);
    const despues = await fotoMunicion(tx, d.id);
    if (hay && igual(antes, despues)) { tx.rollback(); }
    await registrar(tx, usuario, hay ? 'editar' : 'crear', 'municion', d.id, antes, despues);
    return { ok: true, id: d.id, cambio: true };
  }).catch(sinCambios(d.id));
}

async function fotoAccesorio(tx: Tx, id: string) {
  const [a] = await tx.select().from(accesorios).where(eq(accesorios.id, id));
  if (!a) return null;
  const ofrecidas = new Set(await variantesOfrecidas(tx));
  const rel = (await tx.select().from(varianteAccesorio).where(eq(varianteAccesorio.accesorioId, id))).map(r => r.varianteId).filter(v => ofrecidas.has(v));
  return { ...sinFechas(a), seMontaEn: await etiquetasVariantes(tx, rel) };
}
export async function guardarAccesorio(d: DatosAccesorio, usuario: string): Promise<Resultado> {
  return getDb().transaction(async (tx): Promise<Resultado> => {
    const hay = await existe(tx, 'accesorios', d.id);
    const err = textoModo(d.modo, 'accesorios', d.id, hay);
    if (err) return falla(err);
    const antes = hay ? await fotoAccesorio(tx, d.id) : null;
    const fila = {
      nombre: d.nombre, grupo: d.grupo, resumen: d.resumen, tecnico: d.tecnico, modelos: d.modelos, claves: d.claves, datos: d.datos, como: d.como,
      tipos: d.tipos.length ? d.tipos : null, pros: d.pros, contras: d.contras, airsoft: d.airsoft, piezas3d: d.piezas3d, fuente: d.fuente,
      orden: d.modo === 'crear' && d.orden === 0 ? await siguienteOrden('accesorios') : d.orden,
    };
    if (!hay) await tx.insert(accesorios).values({ id: d.id, ...fila });
    else await tx.update(accesorios).set({ ...fila, actualizadoEn: ahora() }).where(eq(accesorios.id, d.id));
    await reemplazarRelAccesorio(tx, d.id, d.variantes);
    const despues = await fotoAccesorio(tx, d.id);
    if (hay && igual(antes, despues)) { tx.rollback(); }
    await registrar(tx, usuario, hay ? 'editar' : 'crear', 'accesorio', d.id, antes, despues);
    return { ok: true, id: d.id, cambio: true };
  }).catch(sinCambios(d.id));
}

export async function guardarTermino(d: DatosTermino, usuario: string): Promise<Resultado> {
  return getDb().transaction(async (tx): Promise<Resultado> => {
    const hay = await existe(tx, 'glosario', d.id);
    const err = textoModo(d.modo, 'glosario', d.id, hay);
    if (err) return falla(err);
    const leer = async () => { const [g] = await tx.select().from(glosario).where(eq(glosario.id, d.id)); return g ? sinFechas(g) : null; };
    const antes = hay ? await leer() : null;
    const fila = {
      nombre: d.nombre, grupo: d.grupo, corto: d.corto, detalle: d.detalle, patron: d.patron, patronFlags: d.patronFlags, sigla: nulo(d.sigla), apodo: nulo(d.apodo),
      orden: d.modo === 'crear' && d.orden === 0 ? await siguienteOrden('glosario') : d.orden,
    };
    if (!hay) await tx.insert(glosario).values({ id: d.id, ...fila });
    else await tx.update(glosario).set({ ...fila, actualizadoEn: ahora() }).where(eq(glosario.id, d.id));
    const despues = await leer();
    if (hay && igual(antes, despues)) { tx.rollback(); }
    await registrar(tx, usuario, hay ? 'editar' : 'crear', 'glosario', d.id, antes, despues);
    return { ok: true, id: d.id, cambio: true };
  }).catch(sinCambios(d.id));
}

/** `tx.rollback()` lanza una excepción: así se descarta la transacción cuando no cambió nada (sin escribir registro). */
export const sinCambios = (id: string) => (e: unknown): Resultado => {
  if (e instanceof TransactionRollbackError) return { ok: true, id, cambio: false };
  throw e;
};

/* ═════════════ Archivar / restaurar ═════════════ */
export async function cambiarArchivo(seg: Seg, id: string, archivar: boolean, usuario: string): Promise<Resultado> {
  const t = { armas, municion, accesorios, glosario }[seg] as typeof armas;
  return getDb().transaction(async (tx): Promise<Resultado> => {
    const [fila] = await tx.select({ archivadoEn: t.archivadoEn }).from(t).where(eq(t.id, id));
    if (!fila) return falla(`No existe «${id}».`);
    if (archivar === !!fila.archivadoEn) return { ok: true, id, cambio: false };
    const marca = archivar ? ahora() : null;
    await tx.update(t).set({ archivadoEn: marca, actualizadoEn: ahora() }).where(eq(t.id, id));
    await registrar(tx, usuario, archivar ? 'archivar' : 'restaurar', ENTIDADES[seg].tipo, id, { archivado: !archivar }, { archivado: archivar });
    return { ok: true, id, cambio: true };
  });
}

/* ═════════════ Registro de cambios ═════════════ */
export interface FilaRegistro { id: number; fecha: Date; usuario: string; accion: string; entidadTipo: string; entidadId: string; antes: unknown; despues: unknown }
export async function leerRegistro(o: { tipo?: TipoReg; entidadId?: string; pagina?: number; porPagina?: number }): Promise<{ filas: FilaRegistro[]; total: number }> {
  const db = getDb();
  const porPagina = o.porPagina ?? 40;
  const filtro = and(o.tipo ? eq(registroCambios.entidadTipo, o.tipo) : undefined, o.entidadId ? eq(registroCambios.entidadId, o.entidadId) : undefined);
  const [filas, [{ n }]] = await Promise.all([
    db.select().from(registroCambios).where(filtro).orderBy(desc(registroCambios.fecha), desc(registroCambios.id)).limit(porPagina).offset(((o.pagina ?? 1) - 1) * porPagina),
    db.select({ n: sql<number>`count(*)::int` }).from(registroCambios).where(filtro),
  ]);
  return { filas, total: Number(n) };
}

/* ═════════════ Resumen del panel ═════════════ */
export async function resumenPanel() {
  const db = getDb();
  const cuenta = async (t: string) => { const [r] = await db.execute(sql.raw(`select count(*) filter (where archivado_en is null)::int as activos, count(*) filter (where archivado_en is not null)::int as archivados from ${t}`)) as unknown as { activos: number; archivados: number }[]; return r; };
  const [a, m, c, g, sinArmas, sinRevisar] = await Promise.all([
    cuenta('armas'), cuenta('municion'), cuenta('accesorios'), cuenta('glosario'),
    db.execute(sql`select a.id, a.nombre from accesorios a where a.archivado_en is null and not exists (
      select 1 from variante_accesorio va join variantes v on v.id = va.variante_id and v.archivado_en is null join armas ar on ar.id = v.arma_id and ar.archivado_en is null where va.accesorio_id = a.id) order by a.orden`) as unknown as Promise<{ id: string; nombre: string }[]>,
    db.execute(sql`select count(*)::int as n from armas where archivado_en is null and not revisado`) as unknown as Promise<{ n: number }[]>,
  ]);
  return { armas: a, municion: m, accesorios: c, glosario: g, accesoriosSinArmas: sinArmas, armasSinRevisar: Number(sinRevisar[0]?.n ?? 0) };
}
