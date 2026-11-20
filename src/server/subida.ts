// Subida de imágenes a S3 desde el panel. SOLO SERVIDOR. No se confía en lo que diga el navegador (tipo, nombre, extensión):
// se mira el contenido real del archivo y la clave del objeto la genera el servidor.
import { randomBytes } from 'node:crypto';
import { DeleteObjectCommand, PutObjectCommand } from '@aws-sdk/client-s3';
import { claveS3, configS3, getS3, urlImagenS3 } from './s3';

export type FormatoImagen = { ext: 'jpg' | 'png' | 'webp'; mime: 'image/jpeg' | 'image/png' | 'image/webp' };

/** Reconoce JPEG, PNG y WebP por sus primeros bytes. SVG, GIF y demás se rechazan (el SVG podría llevar scripts al abrirse en nuestro dominio). */
export function detectarImagen(b: Uint8Array): FormatoImagen | null {
  if (b.length < 12) return null;
  if (b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff) return { ext: 'jpg', mime: 'image/jpeg' };
  if (b[0] === 0x89 && b[1] === 0x50 && b[2] === 0x4e && b[3] === 0x47 && b[4] === 0x0d && b[5] === 0x0a && b[6] === 0x1a && b[7] === 0x0a) return { ext: 'png', mime: 'image/png' };
  const t = (i: number, s: string) => [...s].every((c, k) => b[i + k] === c.charCodeAt(0));
  if (t(0, 'RIFF') && t(8, 'WEBP')) return { ext: 'webp', mime: 'image/webp' };
  return null;
}

const CARPETA = { arma: 'armas', municion: 'municion', accesorio: 'accesorios' } as const;

/** Sube el archivo y devuelve la URL de la app (`/img/…`) y la clave del objeto. Nombre: `<id>-u<tiempo><aleatorio>.<ext>`. */
export async function subirImagen(tipo: keyof typeof CARPETA, entidadId: string, rol: 'principal' | 'galeria', bytes: Uint8Array, f: FormatoImagen) {
  const ruta = `${CARPETA[tipo]}/${rol}/${entidadId}-u${Date.now().toString(36)}${randomBytes(3).toString('hex')}.${f.ext}`;
  await getS3().send(new PutObjectCommand({ Bucket: configS3().bucket, Key: claveS3(ruta), Body: bytes, ContentType: f.mime, CacheControl: 'public, max-age=31536000, immutable' }));
  return { url: urlImagenS3(ruta), s3Key: claveS3(ruta) };
}

/** Deshace una subida cuyo registro en la BD falló (para no dejar objetos huérfanos). Nunca lanza. */
export async function descartarObjeto(s3Key: string) {
  try { await getS3().send(new DeleteObjectCommand({ Bucket: configS3().bucket, Key: s3Key })); } catch { /* el objeto huérfano no hace daño */ }
}
