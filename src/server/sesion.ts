import { SignJWT, jwtVerify } from 'jose';
import { createHash, createHmac, timingSafeEqual } from 'node:crypto';

/**
 * Sesión de administración: un JWT firmado (HS256) en una cookie httpOnly.
 * Este módulo no toca `next/headers`, así que lo comparten el `proxy.ts` y el código de servidor.
 *
 * Credenciales solo en variables de entorno (nunca NEXT_PUBLIC_): ADMIN_USER, ADMIN_PASSWORD y SESSION_SECRET.
 * Si falta cualquiera —o el secreto es corto— el acceso queda cerrado (no hay valores por defecto).
 */

export const COOKIE_SESION = 'armeria_admin';
export const DURACION_SESION_S = 8 * 60 * 60; // 8 horas; pasado ese tiempo hay que volver a entrar
const EMISOR = 'armeria-admin';
const SECRETO_MIN = 32;

export type ConfigAdmin = { usuario: string; password: string; secreto: string };

export function configAdmin(): ConfigAdmin | null {
  const usuario = process.env.ADMIN_USER?.trim();
  const password = process.env.ADMIN_PASSWORD;
  const secreto = process.env.SESSION_SECRET;
  if (!usuario || !password || !secreto || secreto.length < SECRETO_MIN) return null;
  return { usuario, password, secreto };
}

/** Comparación en tiempo constante: se comparan los hash (misma longitud) para no filtrar el largo. */
export function iguales(a: string, b: string): boolean {
  const ha = createHash('sha256').update(a).digest();
  const hb = createHash('sha256').update(b).digest();
  return timingSafeEqual(ha, hb);
}

/** Huella de la contraseña: si cambias ADMIN_PASSWORD (o el secreto), las sesiones abiertas dejan de valer. */
function huella(c: ConfigAdmin): string {
  return createHmac('sha256', c.secreto).update(`pv|${c.usuario}|${c.password}`).digest('base64url').slice(0, 22);
}

const clave = (c: ConfigAdmin) => new TextEncoder().encode(c.secreto);

export async function firmarSesion(c: ConfigAdmin): Promise<string> {
  return new SignJWT({ pv: huella(c) })
    .setProtectedHeader({ alg: 'HS256' })
    .setSubject(c.usuario)
    .setIssuer(EMISOR)
    .setIssuedAt()
    .setExpirationTime(`${DURACION_SESION_S}s`)
    .sign(clave(c));
}

/** Devuelve el usuario si el token es válido, vigente y corresponde a las credenciales actuales; si no, null. */
export async function leerSesion(token: string | undefined): Promise<{ usuario: string } | null> {
  const c = configAdmin();
  if (!c || !token) return null;
  try {
    const { payload } = await jwtVerify(token, clave(c), { algorithms: ['HS256'], issuer: EMISOR });
    if (payload.sub !== c.usuario || typeof payload.pv !== 'string' || !iguales(payload.pv, huella(c))) return null;
    return { usuario: c.usuario };
  } catch {
    return null;
  }
}

/** Solo rutas internas del panel: evita redirecciones abiertas con `?next=`. */
export function destinoSeguro(next: unknown): string {
  if (typeof next !== 'string') return '/admin/';
  if (!next.startsWith('/admin/') || next.includes('//') || next.includes('\\') || /[\r\n\0%]/.test(next.split('?')[0])) return '/admin/';
  // Segmentos «.» o «..»: el navegador los normaliza y la ruta saldría de /admin/
  if (next.split('?')[0].split('/').some(s => s === '.' || s === '..')) return '/admin/';
  try {
    const u = new URL(next, 'http://local');
    if (u.origin !== 'http://local' || !u.pathname.startsWith('/admin/') || u.pathname.startsWith('/admin/login')) return '/admin/';
  } catch { return '/admin/'; }
  return next;
}
