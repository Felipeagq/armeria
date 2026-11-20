// Acceso a S3 (solo servidor). El bucket es privado: las imágenes se sirven por la ruta /img/… de la app (app/img/[...ruta]/route.ts),
// que lee el objeto con estas credenciales. Variables: S3_AWS_ACCESS_KEY, S3_AWS_SECRET_KEY, S3_AWS_REGION, S3_BUCKET, S3_FOLDER.
// Las claves nunca salen del servidor y no llevan prefijo NEXT_PUBLIC_.
import { S3Client } from '@aws-sdk/client-s3';

const g = globalThis as unknown as { __armeriaS3?: S3Client };

export function configS3() {
  const { S3_AWS_ACCESS_KEY: accessKeyId, S3_AWS_SECRET_KEY: secretAccessKey, S3_AWS_REGION: region, S3_BUCKET: bucket } = process.env;
  if (!accessKeyId || !secretAccessKey || !region || !bucket) throw new Error('Faltan variables de S3 (S3_AWS_ACCESS_KEY, S3_AWS_SECRET_KEY, S3_AWS_REGION, S3_BUCKET).');
  const folder = (process.env.S3_FOLDER ?? '').replace(/^\/+|\/+$/g, '');
  return { accessKeyId, secretAccessKey, region, bucket, folder };
}

export function getS3(): S3Client {
  if (g.__armeriaS3) return g.__armeriaS3;
  const { accessKeyId, secretAccessKey, region } = configS3();
  return (g.__armeriaS3 = new S3Client({ region, credentials: { accessKeyId, secretAccessKey } }));
}

/** Clave del objeto en el bucket a partir de la ruta pública («armas/principal/m4.png» → «armeria/armas/principal/m4.png»). */
export const claveS3 = (ruta: string) => { const { folder } = configS3(); return folder ? `${folder}/${ruta}` : ruta; };

/** URL pública (de la app) de una ruta de imagen subida a S3. */
export const urlImagenS3 = (ruta: string) => `/img/${ruta}`;

const EXT = /\.(jpe?g|png|webp|avif|gif)$/i;
/** Solo rutas de imagen con segmentos simples: sin «..», sin barras raras y con extensión conocida. */
export const rutaImagenValida = (segs: string[]) =>
  segs.length >= 2 && segs.length <= 6 && segs.every(s => /^[\w.\-]{1,120}$/.test(s) && s !== '.' && s !== '..') && EXT.test(segs[segs.length - 1]);

export const tipoMime = (archivo: string) => {
  const e = archivo.toLowerCase().split('.').pop();
  return e === 'png' ? 'image/png' : e === 'webp' ? 'image/webp' : e === 'avif' ? 'image/avif' : e === 'gif' ? 'image/gif' : 'image/jpeg';
};
