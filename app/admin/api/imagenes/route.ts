// Subida de una imagen desde el panel: multipart con `archivo` (la imagen) y `datos` (JSON con la ficha y los metadatos).
// Ruta de escritura: exige sesión y que el Origin sea el propio sitio. El servidor no se fía del navegador: comprueba el tamaño,
// mira el contenido real del archivo (JPEG, PNG o WebP) y genera él mismo el nombre del objeto en S3.
import { revalidateTag } from 'next/cache';
import { adminDeRequest } from '@/server/auth';
import { ETIQUETA_CATALOGO } from '@/catalogo/datos';
import { erroresDe } from '@/admin/esquemas';
import { esquemaSubida, MAX_BYTES_IMAGEN } from '@/admin/esquemas-imagen';
import { existeFicha, insertarImagen } from '@/admin/repo-imagenes';
import { descartarObjeto, detectarImagen, subirImagen } from '@/server/subida';

export const dynamic = 'force-dynamic';

const SOBRECARGA = 256 * 1024; // el resto del multipart (campos y delimitadores)
const responder = (status: number, cuerpo: Record<string, unknown>) => Response.json(cuerpo, { status, headers: { 'Cache-Control': 'no-store' } });

export async function POST(req: Request) {
  const sesion = await adminDeRequest(req);
  if (sesion instanceof Response) return sesion;

  const largo = Number(req.headers.get('content-length'));
  if (Number.isFinite(largo) && largo > MAX_BYTES_IMAGEN + SOBRECARGA) return responder(413, { error: `La imagen pesa demasiado (máximo ${MAX_BYTES_IMAGEN / 1024 / 1024} MB).` });

  let fd: FormData;
  try { fd = await req.formData(); } catch { return responder(400, { error: 'Petición no válida.' }); }
  const archivo = fd.get('archivo');
  if (!(archivo instanceof File) || archivo.size === 0) return responder(400, { error: 'Falta el archivo de imagen.' });
  if (archivo.size > MAX_BYTES_IMAGEN) return responder(413, { error: `La imagen pesa demasiado (máximo ${MAX_BYTES_IMAGEN / 1024 / 1024} MB).` });

  let crudo: unknown;
  try { crudo = JSON.parse(String(fd.get('datos') ?? '')); } catch { return responder(400, { error: 'Faltan los datos de la imagen.' }); }
  const v = esquemaSubida.safeParse(crudo);
  if (!v.success) return responder(422, { error: erroresDe(v.error).join(' · ') });
  const d = v.data;

  const bytes = new Uint8Array(await archivo.arrayBuffer());
  const formato = detectarImagen(bytes);
  if (!formato) return responder(415, { error: 'Formato no admitido: solo JPG, PNG o WebP.' });

  let subida: { url: string; s3Key: string } | undefined;
  try {
    if (!(await existeFicha(d.tipo, d.entidadId))) return responder(404, { error: 'La ficha no existe.' });
    subida = await subirImagen(d.tipo, d.entidadId, d.rol, bytes, formato);
    const r = await insertarImagen({ ...d, url: subida.url, origen: 's3', s3Key: subida.s3Key }, sesion.usuario);
    if (!r.ok) { await descartarObjeto(subida.s3Key); return responder(409, { error: r.errores.join(' · ') }); }
    revalidateTag(ETIQUETA_CATALOGO, { expire: 0 });
    return responder(200, { ok: true, id: r.imagenId, url: subida.url });
  } catch (e) {
    // Solo el tipo y el mensaje del error: nunca credenciales ni el contenido de la petición
    console.error('Admin: no se pudo subir la imagen:', (e as Error).name, (e as Error).message.slice(0, 200));
    if (subida) await descartarObjeto(subida.s3Key);
    return responder(500, { error: 'No se pudo guardar la imagen. No se ha cambiado nada; inténtalo de nuevo.' });
  }
}
