'use server';

import { redirect } from 'next/navigation';
import { abrirSesion, cerrarSesionActual, ipActual } from '@/server/auth';
import { configAdmin, destinoSeguro, iguales } from '@/server/sesion';
import { bloqueado, limpiar, registrarFallo } from '@/server/limite-login';

export type EstadoLogin = { error?: string } | undefined;

const pausa = (ms: number) => new Promise(r => setTimeout(r, ms));

export async function iniciarSesion(_prev: EstadoLogin, formData: FormData): Promise<EstadoLogin> {
  const c = configAdmin();
  if (!c) return { error: 'El acceso de administración no está configurado en este servidor.' };

  const ip = await ipActual();
  const b = bloqueado(ip);
  if (b.bloqueado) return { error: `Demasiados intentos fallidos. Vuelve a probar en ${b.minutos} min.` };

  const usuario = String(formData.get('usuario') ?? '').slice(0, 200);
  const password = String(formData.get('password') ?? '').slice(0, 500);
  // Se comparan ambos campos siempre (sin cortocircuito) para no revelar cuál falló
  const okUsuario = iguales(usuario, c.usuario);
  const okPassword = iguales(password, c.password);
  if (!(okUsuario && okPassword)) {
    registrarFallo(ip);
    await pausa(700);
    return { error: 'Usuario o contraseña incorrectos.' };
  }

  limpiar(ip);
  await abrirSesion();
  redirect(destinoSeguro(formData.get('next')));
}

export async function cerrarSesion() {
  await cerrarSesionActual();
  redirect('/admin/login/');
}
