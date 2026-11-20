import { NextResponse, type NextRequest } from 'next/server';
import { COOKIE_SESION, leerSesion } from '@/server/sesion';

/**
 * Comprobación optimista del panel: solo lee la cookie (sin base de datos) y redirige.
 * No es la defensa final: cada página, acción y ruta de escritura vuelve a comprobar la sesión (src/server/auth.ts).
 * El sitio público no pasa por aquí (matcher), así que sigue siendo estático y cacheable.
 */
export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const esLogin = pathname === '/admin/login' || pathname === '/admin/login/';
  const esApi = pathname.startsWith('/admin/api/');
  const sesion = await leerSesion(req.cookies.get(COOKIE_SESION)?.value);

  let res: NextResponse;
  if (esLogin) {
    // Con sesión abierta no tiene sentido ver el formulario
    res = sesion ? NextResponse.redirect(new URL('/admin/', req.url)) : NextResponse.next();
  } else if (!sesion) {
    if (esApi) {
      res = NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    } else {
      const login = new URL('/admin/login/', req.url);
      if (req.method === 'GET') login.searchParams.set('next', pathname + req.nextUrl.search);
      res = NextResponse.redirect(login);
    }
  } else {
    res = NextResponse.next();
  }
  // El panel nunca se cachea ni se indexa
  res.headers.set('Cache-Control', 'no-store');
  res.headers.set('X-Robots-Tag', 'noindex, nofollow');
  return res;
}

export const config = { matcher: ['/admin', '/admin/:path*'] };
