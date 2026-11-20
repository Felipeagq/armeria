'use server';

import { updateTag } from 'next/cache';
import { exigirAdmin } from '@/server/auth';
import { ETIQUETA_CATALOGO } from '@/catalogo/datos';
import { erroresDe } from '@/admin/esquemas';
import { esquemaEdicionImagen, esquemaExterna, esquemaOrden } from '@/admin/esquemas-imagen';
import { actualizarImagen, cambiarArchivoImagen, insertarImagen, ordenarImagenes } from '@/admin/repo-imagenes';
import type { Resultado } from '@/admin/repo';
import type { ResImagen } from '@/admin/tipos';

/**
 * Operaciones sobre imágenes (todo menos la subida de archivos, que va por `/admin/api/imagenes/`).
 * Como el resto de acciones del panel: cada una exige sesión y valida en el servidor lo que recibe.
 */
const FALLO = 'No se pudo completar la operación por un error de la base de datos. No se ha cambiado nada; inténtalo de nuevo.';

async function ejecutar(nombre: string, f: (usuario: string) => Promise<Resultado>): Promise<ResImagen> {
  const { usuario } = await exigirAdmin();
  try {
    const r = await f(usuario);
    if (!r.ok) return { ok: false, errores: r.errores };
    if (r.cambio) updateTag(ETIQUETA_CATALOGO);
    return { ok: true };
  } catch (e) {
    console.error(`Admin: imágenes (${nombre}):`, (e as Error).message);
    return { ok: false, errores: [FALLO] };
  }
}

export async function agregarImagenExterna(datos: unknown): Promise<ResImagen> {
  await exigirAdmin();
  const v = esquemaExterna.safeParse(datos);
  if (!v.success) return { ok: false, errores: erroresDe(v.error) };
  return ejecutar('añadir enlace', u => insertarImagen({ ...v.data, origen: 'externo' }, u));
}

export async function editarImagen(datos: unknown): Promise<ResImagen> {
  await exigirAdmin();
  const v = esquemaEdicionImagen.safeParse(datos);
  if (!v.success) return { ok: false, errores: erroresDe(v.error) };
  return ejecutar('editar', u => actualizarImagen(v.data, u));
}

export async function ordenarGaleria(datos: unknown): Promise<ResImagen> {
  await exigirAdmin();
  const v = esquemaOrden.safeParse(datos);
  if (!v.success) return { ok: false, errores: erroresDe(v.error) };
  return ejecutar('ordenar', u => ordenarImagenes(v.data.tipo, v.data.entidadId, v.data.ids, u));
}

export async function archivarImagen(imagenId: unknown, archivar: unknown): Promise<ResImagen> {
  await exigirAdmin();
  if (typeof imagenId !== 'number' || !Number.isInteger(imagenId) || imagenId <= 0 || typeof archivar !== 'boolean') return { ok: false, errores: ['Petición no válida.'] };
  return ejecutar('archivar', u => cambiarArchivoImagen(imagenId, archivar, u));
}
