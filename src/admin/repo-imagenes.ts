// Gestión de imágenes de las fichas. SOLO SERVIDOR. La BD guarda únicamente el enlace (`/img/…` si está en S3, o la URL externa);
// el binario vive en el bucket. Igual que el resto del panel: cada escritura es una transacción con su fila en `registro_cambios`,
// y quitar una imagen la archiva (se puede restaurar; el objeto de S3 se conserva).
import { and, asc, eq, inArray, isNull, sql } from 'drizzle-orm';
import { accesorios, armas, getDb, imagenes, municion } from '@/db/client';
import type { TipoImg, ImagenAdmin } from './tipos';
import type { DatosEdicionImagen, DatosExterna } from './esquemas-imagen';
import { ahora, falla, igual, registrar, sinCambios, sinFechas, type Resultado, type Tx } from './repo';

const nulo = (s: string) => (s ? s : null);
const TABLAS = { arma: armas, municion, accesorio: accesorios } as const;

const nombreTipo: Record<TipoImg, string> = { arma: 'el arma', municion: 'el cartucho', accesorio: 'el accesorio' };

async function existeEntidad(tx: Tx, tipo: TipoImg, id: string): Promise<boolean> {
  const t = TABLAS[tipo] as typeof armas;
  return (await tx.select({ id: t.id }).from(t).where(eq(t.id, id))).length > 0;
}

const aAdmin = (i: typeof imagenes.$inferSelect): ImagenAdmin => ({
  id: i.id, url: i.url, origen: i.origen === 's3' ? 's3' : 'externo', rol: i.rol === 'principal' ? 'principal' : 'galeria', alt: i.alt,
  titulo: i.titulo ?? '', autor: i.autor ?? '', licencia: i.licencia ?? '', licenciaUrl: i.licenciaUrl ?? '', fuenteUrl: i.fuenteUrl ?? '',
  ajuste: i.ajuste === 'scene' || i.ajuste === 'cutout' ? i.ajuste : '', tipoFoto: i.tipoFoto === 'real' || i.tipoFoto === 'airsoft' ? i.tipoFoto : '',
  orden: i.orden, archivada: !!i.archivadoEn,
});

/** Todas las imágenes de una ficha (activas y archivadas): primero la principal, luego por orden. */
export async function listarImagenes(tipo: TipoImg, id: string): Promise<ImagenAdmin[]> {
  const f = await getDb().select().from(imagenes).where(and(eq(imagenes.entidadTipo, tipo), eq(imagenes.entidadId, id)))
    .orderBy(asc(sql`${imagenes.archivadoEn} is not null`), asc(sql`${imagenes.rol} <> 'principal'`), asc(imagenes.orden), asc(imagenes.id));
  return f.map(aAdmin);
}

export async function existeFicha(tipo: TipoImg, id: string): Promise<boolean> {
  return getDb().transaction(tx => existeEntidad(tx, tipo, id));
}

/** Lo que va al registro de cambios (sin fechas). */
const foto = (i: typeof imagenes.$inferSelect | undefined) => (i ? { ...sinFechas(i), archivada: !!i.archivadoEn } : null);

/** La imagen principal visible es única: antes de poner otra se pasa la actual a galería. Devuelve su id si la hubo. */
async function liberarPrincipal(tx: Tx, tipo: TipoImg, id: string, salvo?: number): Promise<number | null> {
  const [act] = await tx.select({ id: imagenes.id }).from(imagenes)
    .where(and(eq(imagenes.entidadTipo, tipo), eq(imagenes.entidadId, id), eq(imagenes.rol, 'principal'), isNull(imagenes.archivadoEn)));
  if (!act || act.id === salvo) return null;
  await tx.update(imagenes).set({ rol: 'galeria', actualizadoEn: ahora() }).where(eq(imagenes.id, act.id));
  return act.id;
}

async function siguienteOrden(tx: Tx, tipo: TipoImg, id: string): Promise<number> {
  const [r] = await tx.select({ m: sql<number>`coalesce(max(${imagenes.orden}), -1) + 1` }).from(imagenes).where(and(eq(imagenes.entidadTipo, tipo), eq(imagenes.entidadId, id)));
  return Number(r.m);
}

export interface NuevaImagen extends Omit<DatosExterna, 'url'> { url: string; origen: 's3' | 'externo'; s3Key?: string }

/** Añade una imagen (ya subida a S3 o enlazada). */
export async function insertarImagen(d: NuevaImagen, usuario: string): Promise<Resultado & { imagenId?: number }> {
  return getDb().transaction(async tx => {
    if (!(await existeEntidad(tx, d.tipo, d.entidadId))) return falla(`No existe ${nombreTipo[d.tipo]} «${d.entidadId}».`);
    const [dup] = await tx.select({ id: imagenes.id, archivada: sql<boolean>`${imagenes.archivadoEn} is not null` }).from(imagenes)
      .where(and(eq(imagenes.entidadTipo, d.tipo), eq(imagenes.entidadId, d.entidadId), eq(imagenes.url, d.url)));
    if (dup) return falla(dup.archivada ? 'Esa imagen ya estuvo en la ficha y está archivada: restáurala desde «Imágenes archivadas».' : 'Esa imagen ya está en la ficha.');
    // Si la ficha no tiene principal, la primera imagen lo será aunque se haya elegido galería
    const [hayPrincipal] = await tx.select({ id: imagenes.id }).from(imagenes)
      .where(and(eq(imagenes.entidadTipo, d.tipo), eq(imagenes.entidadId, d.entidadId), eq(imagenes.rol, 'principal'), isNull(imagenes.archivadoEn)));
    const rol = d.rol === 'galeria' && !hayPrincipal ? 'principal' : d.rol;
    const anterior = rol === 'principal' ? await liberarPrincipal(tx, d.tipo, d.entidadId) : null;
    const [nueva] = await tx.insert(imagenes).values({
      entidadTipo: d.tipo, entidadId: d.entidadId, url: d.url, origen: d.origen, s3Key: d.s3Key ?? null, rol, alt: d.alt, titulo: nulo(d.titulo), autor: nulo(d.autor),
      licencia: nulo(d.licencia), licenciaUrl: nulo(d.licenciaUrl), fuenteUrl: nulo(d.fuenteUrl),
      ajuste: d.tipo === 'arma' ? nulo(d.ajuste) : null, tipoFoto: d.tipo === 'arma' ? nulo(d.tipoFoto) : null, orden: await siguienteOrden(tx, d.tipo, d.entidadId),
    }).returning();
    await registrar(tx, usuario, 'imagen-añadir', d.tipo, d.entidadId, anterior ? { principalAnterior: anterior } : null, foto(nueva));
    return { ok: true, id: String(nueva.id), cambio: true, imagenId: nueva.id };
  });
}

/** Edita los datos de una imagen activa. En las externas también se puede cambiar el enlace. */
export async function actualizarImagen(d: DatosEdicionImagen, usuario: string): Promise<Resultado> {
  return getDb().transaction(async (tx): Promise<Resultado> => {
    const [i] = await tx.select().from(imagenes).where(eq(imagenes.id, d.imagenId));
    if (!i) return falla('La imagen ya no existe.');
    if (i.archivadoEn) return falla('La imagen está archivada: restáurala antes de editarla.');
    const tipo = i.entidadTipo as TipoImg;
    const url = i.origen === 'externo' && d.url ? d.url : i.url;
    if (url !== i.url) {
      const [dup] = await tx.select({ id: imagenes.id }).from(imagenes).where(and(eq(imagenes.entidadTipo, tipo), eq(imagenes.entidadId, i.entidadId), eq(imagenes.url, url)));
      if (dup) return falla('Ya hay otra imagen con ese enlace en la ficha.');
    }
    const anterior = d.rol === 'principal' ? await liberarPrincipal(tx, tipo, i.entidadId, i.id) : null;
    await tx.update(imagenes).set({
      url, rol: d.rol, alt: d.alt, titulo: nulo(d.titulo), autor: nulo(d.autor), licencia: nulo(d.licencia), licenciaUrl: nulo(d.licenciaUrl), fuenteUrl: nulo(d.fuenteUrl),
      ajuste: tipo === 'arma' ? nulo(d.ajuste) : null, tipoFoto: tipo === 'arma' ? nulo(d.tipoFoto) : null, actualizadoEn: ahora(),
    }).where(eq(imagenes.id, i.id));
    const [despues] = await tx.select().from(imagenes).where(eq(imagenes.id, i.id));
    if (!anterior && igual(foto(i), foto(despues))) tx.rollback();
    await registrar(tx, usuario, 'imagen-editar', tipo, i.entidadId, foto(i), anterior ? { ...foto(despues), principalAnterior: anterior } : foto(despues));
    return { ok: true, id: String(i.id), cambio: true };
  }).catch(sinCambios(String(d.imagenId)));
}

/** Fija el orden de la galería: `ids` son imágenes activas de la ficha, de la primera a la última. */
export async function ordenarImagenes(tipo: TipoImg, entidadId: string, ids: number[], usuario: string): Promise<Resultado> {
  return getDb().transaction(async (tx): Promise<Resultado> => {
    const filas = await tx.select().from(imagenes).where(and(eq(imagenes.entidadTipo, tipo), eq(imagenes.entidadId, entidadId), inArray(imagenes.id, ids), isNull(imagenes.archivadoEn)));
    if (filas.length !== new Set(ids).size) return falla('Alguna imagen ya no pertenece a esta ficha. Recarga la página.');
    const antes = [...filas].sort((a, b) => a.orden - b.orden || a.id - b.id).map(f => f.id);
    if (igual(antes, ids)) return { ok: true, id: entidadId, cambio: false };
    // Se reparten los números de orden que ya usaban, de menor a mayor, para no mover las que no se tocan
    const huecos = filas.map(f => f.orden).sort((a, b) => a - b);
    const unicos = new Set(huecos).size === huecos.length;
    for (const [k, id] of ids.entries()) await tx.update(imagenes).set({ orden: unicos ? huecos[k] : k, actualizadoEn: ahora() }).where(eq(imagenes.id, id));
    await registrar(tx, usuario, 'imagen-ordenar', tipo, entidadId, { orden: antes }, { orden: ids });
    return { ok: true, id: entidadId, cambio: true };
  });
}

/** Quitar = archivar (reversible). Restaurar una principal con otra ya activa la deja en galería. */
export async function cambiarArchivoImagen(imagenId: number, archivar: boolean, usuario: string): Promise<Resultado> {
  return getDb().transaction(async (tx): Promise<Resultado> => {
    const [i] = await tx.select().from(imagenes).where(eq(imagenes.id, imagenId));
    if (!i) return falla('La imagen ya no existe.');
    if (archivar === !!i.archivadoEn) return { ok: true, id: String(imagenId), cambio: false };
    const tipo = i.entidadTipo as TipoImg;
    let rol = i.rol;
    if (!archivar && rol === 'principal') {
      const [otra] = await tx.select({ id: imagenes.id }).from(imagenes).where(and(eq(imagenes.entidadTipo, tipo), eq(imagenes.entidadId, i.entidadId), eq(imagenes.rol, 'principal'), isNull(imagenes.archivadoEn)));
      if (otra) rol = 'galeria';
    }
    await tx.update(imagenes).set({ archivadoEn: archivar ? ahora() : null, rol, actualizadoEn: ahora() }).where(eq(imagenes.id, imagenId));
    const [despues] = await tx.select().from(imagenes).where(eq(imagenes.id, imagenId));
    await registrar(tx, usuario, archivar ? 'imagen-archivar' : 'imagen-restaurar', tipo, i.entidadId, foto(i), foto(despues));
    return { ok: true, id: String(imagenId), cambio: true };
  });
}
