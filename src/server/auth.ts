import { cache } from 'react';
import { cookies, headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { COOKIE_SESION, DURACION_SESION_S, configAdmin, firmarSesion, leerSesion } from './sesion';
import { ipDe } from './limite-login';

/**
 * Capa de acceso del panel. El `proxy.ts` solo hace una comprobación optimista (lee la cookie y redirige);
 * la autorización de verdad se repite aquí, cerca de los datos: cada página del panel, cada Server Action
 * y cada ruta de escritura debe llamar a `exigirAdmin()` / `adminDeRequest()` antes de leer o cambiar nada.
 */

const enProd = process.env.NODE_ENV === 'production';

/** Cookie limitada a /admin: no viaja con las páginas públicas ni con la caché del sitio. */
const opcionesCookie = (maxAge: number) => ({
  httpOnly: true,
  secure: enProd,
  sameSite: 'lax' as const,
  path: '/admin',
  maxAge,
});

export async function abrirSesion(): Promise<boolean> {
  const c = configAdmin();
  if (!c) return false;
  (await cookies()).set(COOKIE_SESION, await firmarSesion(c), opcionesCookie(DURACION_SESION_S));
  return true;
}

export async function cerrarSesionActual() {
  (await cookies()).set(COOKIE_SESION, '', opcionesCookie(0));
}

/** Usuario con sesión válida o null. Memoizado dentro de un mismo render. */
export const sesionActual = cache(async () => leerSesion((await cookies()).get(COOKIE_SESION)?.value));

/** Para páginas y Server Actions: si no hay sesión válida, manda al login. */
export async function exigirAdmin(): Promise<{ usuario: string }> {
  const s = await sesionActual();
  if (!s) redirect('/admin/login/');
  return s;
}

/**
 * Para rutas de escritura (`/admin/api/...`): devuelve el usuario o una Response 401/403 lista para devolver.
 * Además de la cookie exige que el Origin coincida con el host (defensa extra contra CSRF).
 */
export async function adminDeRequest(req: Request): Promise<{ usuario: string } | Response> {
  const s = await leerSesion(leerCookie(req.headers.get('cookie'), COOKIE_SESION));
  if (!s) return Response.json({ error: 'No autorizado' }, { status: 401, headers: { 'Cache-Control': 'no-store' } });
  if (req.method !== 'GET' && req.method !== 'HEAD' && !origenPropio(req.headers)) {
    return Response.json({ error: 'Origen no permitido' }, { status: 403, headers: { 'Cache-Control': 'no-store' } });
  }
  return s;
}

function leerCookie(cabecera: string | null, nombre: string): string | undefined {
  for (const parte of (cabecera ?? '').split(';')) {
    const i = parte.indexOf('=');
    if (i > 0 && parte.slice(0, i).trim() === nombre) return decodeURIComponent(parte.slice(i + 1).trim());
  }
  return undefined;
}

/** El Origin (o, en su defecto, el Referer) debe ser el propio host. Sin ninguno de los dos, se rechaza. */
export function origenPropio(h: Headers): boolean {
  const host = (h.get('x-forwarded-host') ?? h.get('host') ?? '').split(',')[0].trim();
  const origen = h.get('origin') ?? h.get('referer');
  if (!host || !origen) return false;
  try { return new URL(origen).host === host; } catch { return false; }
}

export async function ipActual(): Promise<string> {
  return ipDe(await headers());
}
