// Siembra la base de datos con TODO el contenido que hoy vive en el código (armas y variantes, fichas externas de .data/armas,
// munición, accesorios, glosario, imágenes y las relaciones variante↔munición y variante↔accesorio).
//   npm run db:seed              inserta solo lo que falta (NO pisa lo que hayas editado en el panel ni lo archivado)
//   npm run db:seed -- --force   reescribe el contenido con lo que hay en el código (no desarchiva)
//   npm run db:seed -- --dry     calcula y cuenta, sin escribir
// Antes: npm run db:migrate y npm run db:imagenes (sube los archivos a S3).
import { getTableColumns, sql } from 'drizzle-orm';
import type { PgTable, PgUpdateSetSource } from 'drizzle-orm/pg-core';
import { ARMAS, calibresDe, paisDe } from '../src/three/data/armas';
import { AMMO, ammoForCalibre } from '../src/three/data/ammo';
import { ACCESORIOS } from '../src/three/data/accesorios';
import { accesoriosDePlataforma } from '../src/three/data/accesorios-compat';
import { SISTEMAS } from '../src/three/data/sistemas';
import { accesorios, armas, cerrarDb, getDb, glosario, imagenes, municion, varianteAccesorio, varianteMunicion, variantes } from '../src/db/client';
import { claveS3 } from '../src/server/s3';
import { fichasExternas, inventarioImagenes } from './_imagenes';

try { process.loadEnvFile('.env'); } catch { /* sin .env: se usa el entorno */ }
const FORCE = process.argv.includes('--force');
const DRY = process.argv.includes('--dry');

/** `set` de un upsert: todas las columnas con el valor nuevo, salvo las que no deben cambiar. */
function reescribir<T extends PgTable>(tabla: T, excluir: string[]): PgUpdateSetSource<T> {
  const cols = getTableColumns(tabla);
  const set = Object.fromEntries(Object.entries(cols).filter(([k]) => !excluir.includes(k)).map(([k, c]) => [k, sql.raw(`excluded."${c.name}"`)]));
  return { ...set, actualizadoEn: sql`now()` } as unknown as PgUpdateSetSource<T>;
}
const trozos = <T,>(a: T[], n = 100) => Array.from({ length: Math.ceil(a.length / n) }, (_, i) => a.slice(i * n, (i + 1) * n));
const GRUPO_EXT: Record<string, string> = { pistol: 'Pistolas', smg: 'Subfusiles', rifle: 'Otros' };
const CONSERVAR = ['id', 'creadoEn', 'archivadoEn'];

async function main() {
  const db = getDb();
  const ext = fichasExternas();

  // ── Filas a partir del código ──
  const filasArmas = [
    ...ARMAS.map((a, i) => ({
      id: a.id, nombre: a.name, fabricante: a.maker, grupo: a.group, pais: paisDe(a.maker) ?? null, specsComunes: a.common,
      calibres: [...new Set([a.common.calibre, ...a.variants.map(v => v.specs.calibre)].flatMap(calibresDe))],
      origen: 'catalogo' as const, revisado: true, orden: i,
    })),
    ...ext.filter(f => !ARMAS.some(a => a.id === f.slug)).map((f, i) => ({
      id: f.slug, nombre: f.name, fabricante: f.maker ?? '', grupo: GRUPO_EXT[f.generico] ?? 'Otros', pais: paisDe(f.maker ?? '') ?? null, specsComunes: f.specs,
      calibres: [...new Set(calibresDe(f.specs.calibre))], origen: f.origen, revisado: f.revisado, fuente: f.fuente, generico: f.generico,
      tipo: f.tipo ?? null, resumen: f.resumen ?? null, orden: 1000 + i,
    })),
  ];
  const filasVariantes = [
    ...ARMAS.flatMap(a => a.variants.map((v, j) => ({ armaId: a.id, slug: v.id, nombre: v.name, specs: v.specs, plataforma3d: v.platform ?? null, orden: j }))),
    ...ext.filter(f => !ARMAS.some(a => a.id === f.slug)).map(f => ({ armaId: f.slug, slug: 'std', nombre: f.tipo ?? 'Estándar', specs: {}, plataforma3d: null, orden: 0 })),
  ];
  const filasMunicion = AMMO.map((c, i) => ({
    id: c.id, nombre: c.name, nombreCorto: c.short, tipo: c.kind, eslogan: c.tagline, patronCalibre: c.match?.source ?? null, patronFlags: c.match?.flags ?? '',
    claves: c.key, hechos: c.facts, sobre: c.about, fuente: c.fuente, orden: i,
  }));
  const filasAccesorios = ACCESORIOS.map((a, i) => ({
    id: a.id, nombre: a.nombre, grupo: a.grupo, resumen: a.resumen, tecnico: a.tecnico, modelos: a.modelos, claves: a.clave, datos: a.datos, como: a.como,
    tipos: a.variantes ?? null, pros: a.pros, contras: a.contras, airsoft: a.airsoft, piezas3d: a.partes, fuente: a.fuente, orden: i,
  }));
  const filasGlosario = SISTEMAS.map((s, i) => ({
    id: s.id, nombre: s.nombre, grupo: s.grupo, corto: s.corto, detalle: s.detalle, patron: s.patron.source, patronFlags: s.patron.flags,
    sigla: s.sigla ?? null, apodo: s.apodo ?? null, orden: i,
  }));
  const inv = inventarioImagenes();
  const filasImagenes = inv.map(i => ({
    entidadTipo: i.entidadTipo, entidadId: i.entidadId, url: i.url, origen: i.origen, s3Key: i.ruta ? claveS3(i.ruta) : null,
    miniaturaUrl: i.miniUrl ?? null, miniaturaKey: i.miniRuta ? claveS3(i.miniRuta) : null, rol: i.rol, alt: i.alt, titulo: i.titulo ?? null,
    autor: i.autor ?? null, licencia: i.licencia ?? null, licenciaUrl: i.licenciaUrl ?? null, fuenteUrl: i.fuenteUrl ?? null,
    ajuste: i.ajuste ?? null, tipoFoto: i.tipoFoto ?? null, orden: i.orden,
  }));

  // Relaciones: se deducen una vez del código (calibre y constructor 3D); luego se editan en el panel.
  const relMunicion: { arma: string; slug: string; municionId: string }[] = [];
  const relAccesorio: { arma: string; slug: string; accesorioId: string }[] = [];
  for (const a of ARMAS) for (const v of a.variants) {
    for (const c of ammoForCalibre(v.specs.calibre ?? a.common.calibre)) relMunicion.push({ arma: a.id, slug: v.id, municionId: c.id });
    if (v.platform) for (const acc of accesoriosDePlataforma(v.platform)) relAccesorio.push({ arma: a.id, slug: v.id, accesorioId: acc.id });
  }
  for (const f of ext) if (!ARMAS.some(a => a.id === f.slug)) for (const c of ammoForCalibre(f.specs.calibre)) relMunicion.push({ arma: f.slug, slug: 'std', municionId: c.id });

  const esperado = {
    armas: filasArmas.length, variantes: filasVariantes.length, municion: filasMunicion.length, accesorios: filasAccesorios.length, glosario: filasGlosario.length,
    imagenes: filasImagenes.length, variante_municion: relMunicion.length, variante_accesorio: relAccesorio.length,
  };
  console.log('A sembrar:', JSON.stringify(esperado));
  if (DRY) { console.log('(--dry: no se escribió nada)'); return; }

  await db.transaction(async tx => {
    for (const lote of trozos(filasArmas)) {
      const q = tx.insert(armas).values(lote);
      await (FORCE ? q.onConflictDoUpdate({ target: armas.id, set: reescribir(armas, CONSERVAR) }) : q.onConflictDoNothing());
    }
    for (const lote of trozos(filasVariantes)) {
      const q = tx.insert(variantes).values(lote);
      await (FORCE ? q.onConflictDoUpdate({ target: [variantes.armaId, variantes.slug], set: reescribir(variantes, [...CONSERVAR, 'armaId', 'slug']) }) : q.onConflictDoNothing());
    }
    for (const lote of trozos(filasMunicion)) {
      const q = tx.insert(municion).values(lote);
      await (FORCE ? q.onConflictDoUpdate({ target: municion.id, set: reescribir(municion, CONSERVAR) }) : q.onConflictDoNothing());
    }
    for (const lote of trozos(filasAccesorios)) {
      const q = tx.insert(accesorios).values(lote);
      await (FORCE ? q.onConflictDoUpdate({ target: accesorios.id, set: reescribir(accesorios, CONSERVAR) }) : q.onConflictDoNothing());
    }
    for (const lote of trozos(filasGlosario)) {
      const q = tx.insert(glosario).values(lote);
      await (FORCE ? q.onConflictDoUpdate({ target: glosario.id, set: reescribir(glosario, CONSERVAR) }) : q.onConflictDoNothing());
    }
    for (const lote of trozos(filasImagenes)) {
      const q = tx.insert(imagenes).values(lote);
      await (FORCE ? q.onConflictDoUpdate({ target: [imagenes.entidadTipo, imagenes.entidadId, imagenes.url], set: reescribir(imagenes, [...CONSERVAR, 'entidadTipo', 'entidadId', 'url']) }) : q.onConflictDoNothing());
    }
    const ids = new Map((await tx.select({ id: variantes.id, armaId: variantes.armaId, slug: variantes.slug }).from(variantes)).map(v => [`${v.armaId}/${v.slug}`, v.id]));
    const filasRM = relMunicion.flatMap(r => { const id = ids.get(`${r.arma}/${r.slug}`); return id ? [{ varianteId: id, municionId: r.municionId }] : []; });
    const filasRA = relAccesorio.flatMap(r => { const id = ids.get(`${r.arma}/${r.slug}`); return id ? [{ varianteId: id, accesorioId: r.accesorioId }] : []; });
    for (const lote of trozos(filasRM)) await tx.insert(varianteMunicion).values(lote).onConflictDoNothing();
    for (const lote of trozos(filasRA)) await tx.insert(varianteAccesorio).values(lote).onConflictDoNothing();
  });

  // ── Comprobación contra las fuentes ──
  const cuenta = async (t: string) => Number((await db.execute(sql.raw(`select count(*)::int as n from ${t}`)))[0].n);
  const real: Record<string, number> = {};
  for (const t of Object.keys(esperado)) real[t] = await cuenta(t);
  console.log('En la BD:  ', JSON.stringify(real));
  const dif = Object.keys(esperado).filter(t => real[t] < esperado[t as keyof typeof esperado]);
  console.log(dif.length ? `FALTAN filas en: ${dif.join(', ')}` : 'OK: la BD contiene todo lo esperado (puede tener más si añadiste contenido desde el panel).');
}

main().catch(e => { console.error('ERROR:', (e as Error).message); process.exitCode = 1; }).finally(() => cerrarDb());
