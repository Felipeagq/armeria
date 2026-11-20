'use server';

import { redirect } from 'next/navigation';
import { revalidatePath, updateTag } from 'next/cache';
import type { z } from 'zod';
import { exigirAdmin } from '@/server/auth';
import { ETIQUETA_CATALOGO } from '@/catalogo/datos';
import { esSeg, type EstadoGuardado, type Seg } from '@/admin/entidades';
import { erroresDe, esquemaAccesorio, esquemaArma, esquemaMunicion, esquemaTermino } from '@/admin/esquemas';
import { cambiarArchivo, guardarAccesorio, guardarArma, guardarMunicion, guardarTermino, type Resultado } from '@/admin/repo';

/**
 * Todas las acciones de escritura del panel. Una Server Action es un endpoint público: cada una vuelve a comprobar la sesión
 * (`exigirAdmin`) y valida los datos en el servidor; lo que haga o no el formulario del navegador no cuenta.
 */

/** Tras escribir: las páginas públicas (y el índice del buscador) se regeneran con el dato nuevo en la siguiente visita. */
function publicar() {
  updateTag(ETIQUETA_CATALOGO);
  revalidatePath('/api/busqueda/');
}

async function guardar<S extends z.ZodType<{ id: string; modo: 'crear' | 'editar' }>>(
  seg: Seg, esquema: S, fd: FormData, escribir: (d: z.output<S>, usuario: string) => Promise<Resultado>,
): Promise<EstadoGuardado> {
  const { usuario } = await exigirAdmin();
  const crudo = fd.get('json');
  if (typeof crudo !== 'string' || crudo.length > 600_000) return { mensaje: 'Los datos enviados no son válidos.' };
  let json: unknown;
  try { json = JSON.parse(crudo); } catch { return { mensaje: 'Los datos enviados no son válidos.' }; }
  const v = esquema.safeParse(json);
  if (!v.success) return { errores: erroresDe(v.error) };

  let r: Resultado;
  try { r = await escribir(v.data, usuario); }
  catch (e) {
    console.error(`Admin: no se pudo guardar ${seg}/${v.data.id}:`, (e as Error).message);
    return { mensaje: 'No se pudo guardar por un error de la base de datos. No se ha cambiado nada; inténtalo de nuevo.' };
  }
  if (!r.ok) return { errores: r.errores };
  if (r.cambio) publicar();
  redirect(`/admin/${seg}/${encodeURIComponent(r.id)}/?ok=${!r.cambio ? 'sin-cambios' : v.data.modo === 'crear' ? 'creado' : 'guardado'}`);
}

export async function guardarArmaAccion(_prev: EstadoGuardado, fd: FormData) { return guardar('armas', esquemaArma, fd, guardarArma); }
export async function guardarMunicionAccion(_prev: EstadoGuardado, fd: FormData) { return guardar('municion', esquemaMunicion, fd, guardarMunicion); }
export async function guardarAccesorioAccion(_prev: EstadoGuardado, fd: FormData) { return guardar('accesorios', esquemaAccesorio, fd, guardarAccesorio); }
export async function guardarTerminoAccion(_prev: EstadoGuardado, fd: FormData) { return guardar('glosario', esquemaTermino, fd, guardarTermino); }

/** Archivar o restaurar (el borrado es siempre lógico). Campos: seg, id, archivar=1|0. */
export async function archivarAccion(fd: FormData) {
  const { usuario } = await exigirAdmin();
  const seg = String(fd.get('seg') ?? ''), id = String(fd.get('id') ?? '');
  if (!esSeg(seg) || !/^[a-z0-9][a-z0-9-]{0,59}$/.test(id)) redirect('/admin/');
  const archivar = fd.get('archivar') === '1';
  let r: Resultado;
  try { r = await cambiarArchivo(seg, id, archivar, usuario); }
  catch (e) { console.error(`Admin: no se pudo ${archivar ? 'archivar' : 'restaurar'} ${seg}/${id}:`, (e as Error).message); redirect(`/admin/${seg}/${id}/?ok=error`); }
  if (!r.ok) redirect(`/admin/${seg}/?ok=error`);
  if (r.cambio) publicar();
  redirect(`/admin/${seg}/${id}/?ok=${archivar ? 'archivado' : 'restaurado'}`);
}
