// Esquema de la base de datos (PostgreSQL, Drizzle). Aprobado en la fase 2.
// Ideas: los ids son los mismos «slugs» de las URLs de hoy; los textos de ficha van en jsonb y lo que se filtra u ordena, en columnas;
// nada se borra de verdad: `archivado_en` oculta el ítem y se puede restaurar; `registro_cambios` guarda quién cambió qué.
// Solo tipos de `three/types` (sin geometría): este módulo se puede importar desde servidor sin cargar three.
import { sql } from 'drizzle-orm';
import { bigserial, check, index, integer, jsonb, pgTable, primaryKey, serial, text, timestamp, uniqueIndex, boolean } from 'drizzle-orm/pg-core';
import type { Specs } from '../three/types';

const fecha = (nombre: string) => timestamp(nombre, { withTimezone: true });
/** Columnas comunes de todo contenido editable. */
const comunes = {
  orden: integer('orden').notNull().default(0),
  creadoEn: fecha('creado_en').notNull().defaultNow(),
  actualizadoEn: fecha('actualizado_en').notNull().defaultNow(),
  /** Borrado lógico: con valor, el ítem no aparece en el sitio público y se puede restaurar desde el panel. */
  archivadoEn: fecha('archivado_en'),
};

export type Par = [etiqueta: string, valor: string];
export type Modelo = string | [nombre: string, nota: string];

/* ───────────── Armas y variantes ───────────── */
export const armas = pgTable('armas', {
  id: text('id').primaryKey(),
  nombre: text('nombre').notNull(),
  fabricante: text('fabricante').notNull().default(''),
  grupo: text('grupo').notNull(),
  pais: text('pais'),
  /** Datos comunes a todas las variantes (calibre, sistema, cadencia…). */
  specsComunes: jsonb('specs_comunes').$type<Specs>().notNull().default({}),
  /** Calibres normalizados («5,56×45», «.300 BLK»): se derivan de las specs y sirven para filtrar. */
  calibres: text('calibres').array().notNull().default(sql`'{}'::text[]`),
  /** De dónde sale la ficha: catálogo propio, caché de Wikipedia o generada con IA. */
  origen: text('origen').notNull().default('catalogo'),
  revisado: boolean('revisado').notNull().default(true),
  /** Fuente de las fichas externas ({label, url, license, licenseUrl}); en las del catálogo, vacío. */
  fuente: jsonb('fuente').$type<{ label: string; url?: string; license?: string; licenseUrl?: string } | null>(),
  /** Cuerpo genérico del constructor 3D (fichas externas). */
  generico: text('generico'),
  tipo: text('tipo'),
  resumen: text('resumen'),
  ...comunes,
}, t => [
  check('armas_origen_ck', sql`${t.origen} in ('catalogo','wikipedia','ia')`),
  index('armas_grupo_idx').on(t.grupo),
]);

export const variantes = pgTable('variantes', {
  id: serial('id').primaryKey(),
  armaId: text('arma_id').notNull().references(() => armas.id, { onDelete: 'cascade', onUpdate: 'cascade' }),
  slug: text('slug').notNull(),
  nombre: text('nombre').notNull(),
  specs: jsonb('specs').$type<Specs>().notNull().default({}),
  /** Id de la plataforma del constructor 3D: se conserva para poder reactivarlo. */
  plataforma3d: text('plataforma_3d'),
  ...comunes,
}, t => [uniqueIndex('variantes_arma_slug_uq').on(t.armaId, t.slug)]);

/* ───────────── Munición ───────────── */
export const municion = pgTable('municion', {
  id: text('id').primaryKey(),
  nombre: text('nombre').notNull(),
  nombreCorto: text('nombre_corto').notNull(),
  tipo: text('tipo').notNull().default('real'),
  eslogan: text('eslogan').notNull().default(''),
  /** Expresión regular (texto) con la que se reconoce el cartucho en el campo «calibre» de un arma. */
  patronCalibre: text('patron_calibre'),
  /** Indicadores de esa expresión regular («i» o vacío). */
  patronFlags: text('patron_flags').notNull().default(''),
  claves: jsonb('claves').$type<Par[]>().notNull().default([]),
  hechos: jsonb('hechos').$type<Par[]>().notNull().default([]),
  sobre: text('sobre').array().notNull().default(sql`'{}'::text[]`),
  fuente: text('fuente').notNull().default(''),
  ...comunes,
}, t => [check('municion_tipo_ck', sql`${t.tipo} in ('real','airsoft')`)]);

/* ───────────── Accesorios ───────────── */
export const accesorios = pgTable('accesorios', {
  id: text('id').primaryKey(),
  nombre: text('nombre').notNull(),
  grupo: text('grupo').notNull(),
  resumen: text('resumen').notNull().default(''),
  tecnico: text('tecnico').array().notNull().default(sql`'{}'::text[]`),
  modelos: jsonb('modelos').$type<Modelo[]>().notNull().default([]),
  claves: jsonb('claves').$type<Par[]>().notNull().default([]),
  datos: jsonb('datos').$type<Par[]>().notNull().default([]),
  como: text('como').array().notNull().default(sql`'{}'::text[]`),
  tipos: jsonb('tipos').$type<Par[] | null>(),
  pros: text('pros').array().notNull().default(sql`'{}'::text[]`),
  contras: text('contras').array().notNull().default(sql`'{}'::text[]`),
  airsoft: text('airsoft').notNull().default(''),
  /** Ids de las piezas del constructor 3D que representa la ficha: se conservan para poder reactivarlo. */
  piezas3d: text('piezas_3d').array().notNull().default(sql`'{}'::text[]`),
  fuente: text('fuente').notNull().default(''),
  ...comunes,
}, t => [index('accesorios_grupo_idx').on(t.grupo)]);

/* ───────────── Glosario ───────────── */
export const glosario = pgTable('glosario', {
  id: text('id').primaryKey(),
  nombre: text('nombre').notNull(),
  grupo: text('grupo').notNull(),
  corto: text('corto').notNull(),
  detalle: text('detalle').notNull().default(''),
  /** Expresión regular (texto, sin indicadores; se aplica sin distinguir mayúsculas) que detecta el término en una ficha. */
  patron: text('patron').notNull(),
  /** Indicadores de la expresión regular («i» o vacío: algunos términos distinguen mayúsculas, como las siglas). */
  patronFlags: text('patron_flags').notNull().default(''),
  sigla: text('sigla'),
  apodo: text('apodo'),
  ...comunes,
});

/* ───────────── Imágenes (solo el enlace: nunca el binario) ───────────── */
export const imagenes = pgTable('imagenes', {
  id: serial('id').primaryKey(),
  entidadTipo: text('entidad_tipo').notNull(),
  entidadId: text('entidad_id').notNull(),
  url: text('url').notNull(),
  /** 's3': subida a nuestro bucket (s3_key guarda la clave del objeto); 'externo': enlace a otro sitio. */
  origen: text('origen').notNull(),
  s3Key: text('s3_key'),
  /** Miniatura (360 px) para listados: mismo origen que la imagen. */
  miniaturaUrl: text('miniatura_url'),
  miniaturaKey: text('miniatura_key'),
  rol: text('rol').notNull().default('galeria'),
  alt: text('alt').notNull().default(''),
  /** Pie de foto (p. ej. el título del archivo en Commons). */
  titulo: text('titulo'),
  autor: text('autor'),
  licencia: text('licencia'),
  licenciaUrl: text('licencia_url'),
  fuenteUrl: text('fuente_url'),
  /** 'scene': foto con escenario (se rellena el marco con una copia difuminada); 'cutout': recorte sobre fondo liso. */
  ajuste: text('ajuste'),
  /** Arma real o réplica de airsoft (solo fotos de armas). */
  tipoFoto: text('tipo_foto'),
  ...comunes,
}, t => [
  check('imagenes_entidad_ck', sql`${t.entidadTipo} in ('arma','municion','accesorio')`),
  check('imagenes_origen_ck', sql`${t.origen} in ('s3','externo')`),
  check('imagenes_rol_ck', sql`${t.rol} in ('principal','galeria')`),
  index('imagenes_entidad_idx').on(t.entidadTipo, t.entidadId),
  uniqueIndex('imagenes_entidad_url_uq').on(t.entidadTipo, t.entidadId, t.url),
  // Una sola imagen principal visible por ítem
  uniqueIndex('imagenes_principal_uq').on(t.entidadTipo, t.entidadId).where(sql`${t.rol} = 'principal' and ${t.archivadoEn} is null`),
]);

/* ───────────── Relaciones editables ───────────── */
/** Qué cartucho usa cada variante (se deduce del calibre al sembrar; luego se edita a mano). */
export const varianteMunicion = pgTable('variante_municion', {
  varianteId: integer('variante_id').notNull().references(() => variantes.id, { onDelete: 'cascade' }),
  municionId: text('municion_id').notNull().references(() => municion.id, { onDelete: 'cascade', onUpdate: 'cascade' }),
}, t => [primaryKey({ columns: [t.varianteId, t.municionId] })]);

/** Qué accesorios encajan en cada variante (se deduce del constructor 3D al sembrar; luego se edita a mano). */
export const varianteAccesorio = pgTable('variante_accesorio', {
  varianteId: integer('variante_id').notNull().references(() => variantes.id, { onDelete: 'cascade' }),
  accesorioId: text('accesorio_id').notNull().references(() => accesorios.id, { onDelete: 'cascade', onUpdate: 'cascade' }),
}, t => [primaryKey({ columns: [t.varianteId, t.accesorioId] }), index('variante_accesorio_acc_idx').on(t.accesorioId)]);

/* ───────────── Registro de cambios ───────────── */
export const registroCambios = pgTable('registro_cambios', {
  id: bigserial('id', { mode: 'number' }).primaryKey(),
  fecha: fecha('fecha').notNull().defaultNow(),
  /** El admin del .env (de momento un solo usuario). */
  usuario: text('usuario').notNull(),
  accion: text('accion').notNull(),
  entidadTipo: text('entidad_tipo').notNull(),
  entidadId: text('entidad_id').notNull(),
  antes: jsonb('antes'),
  despues: jsonb('despues'),
}, t => [index('registro_entidad_idx').on(t.entidadTipo, t.entidadId), index('registro_fecha_idx').on(t.fecha)]);

export type Arma = typeof armas.$inferSelect;
export type Variante = typeof variantes.$inferSelect;
export type Municion = typeof municion.$inferSelect;
export type Accesorio = typeof accesorios.$inferSelect;
export type Termino = typeof glosario.$inferSelect;
export type Imagen = typeof imagenes.$inferSelect;
