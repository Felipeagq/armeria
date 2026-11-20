// Sirve las imágenes guardadas en S3 (bucket privado) con caché larga. Solo lee objetos de la carpeta S3_FOLDER y solo imágenes.
import { GetObjectCommand } from '@aws-sdk/client-s3';
import { claveS3, configS3, getS3, rutaImagenValida, tipoMime } from '@/server/s3';

type Ctx = { params: Promise<{ ruta: string[] }> };
const CACHE = 'public, max-age=31536000, immutable';
const noEncontrado = () => new Response('No encontrado', { status: 404 });

export async function GET(req: Request, { params }: Ctx) {
  const { ruta } = await params;
  if (!rutaImagenValida(ruta)) return noEncontrado();
  try {
    const out = await getS3().send(new GetObjectCommand({
      Bucket: configS3().bucket, Key: claveS3(ruta.join('/')), IfNoneMatch: req.headers.get('if-none-match') ?? undefined,
    }));
    if (!out.Body) return noEncontrado();
    const headers = new Headers({
      'Content-Type': out.ContentType && out.ContentType !== 'binary/octet-stream' ? out.ContentType : tipoMime(ruta[ruta.length - 1]),
      'Cache-Control': CACHE, 'X-Content-Type-Options': 'nosniff',
    });
    if (out.ETag) headers.set('ETag', out.ETag);
    if (out.ContentLength != null) headers.set('Content-Length', String(out.ContentLength));
    return new Response(out.Body.transformToWebStream(), { headers });
  } catch (e) {
    const err = e as { name?: string; $metadata?: { httpStatusCode?: number } };
    if (err.name === 'NotModified' || err.$metadata?.httpStatusCode === 304) return new Response(null, { status: 304, headers: { 'Cache-Control': CACHE } });
    if (err.name === 'NoSuchKey' || err.$metadata?.httpStatusCode === 404) return noEncontrado();
    return new Response('Error al leer la imagen', { status: 502 });
  }
}
