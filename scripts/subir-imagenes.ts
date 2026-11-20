// Sube a S3 todas las imágenes locales del inventario (public/photos, ammo, accesorios y galeria).
// Se puede repetir: salta los objetos que ya están con el mismo tamaño. Uso: npm run db:imagenes
import { readFileSync, statSync } from 'node:fs';
import { HeadObjectCommand, PutObjectCommand } from '@aws-sdk/client-s3';
import { configS3, getS3, claveS3, tipoMime } from '../src/server/s3';
import { faltantes, inventarioImagenes } from './_imagenes';

try { process.loadEnvFile('.env'); } catch { /* sin .env: se usa el entorno */ }

const items = inventarioImagenes();
const subidas = new Map<string, string>(); // clave S3 → archivo local
for (const i of items) {
  if (i.local && i.ruta) subidas.set(claveS3(i.ruta), i.local);
  if (i.miniLocal && i.miniRuta) subidas.set(claveS3(i.miniRuta), i.miniLocal);
}

const { bucket } = configS3();
const s3 = getS3();
let nuevas = 0, iguales = 0, fallos = 0;
const cola = [...subidas];

async function subir([Key, archivo]: [string, string]) {
  const tam = statSync(archivo).size;
  try {
    const h = await s3.send(new HeadObjectCommand({ Bucket: bucket, Key }));
    if (h.ContentLength === tam) { iguales++; return; }
  } catch (e) {
    const code = (e as { $metadata?: { httpStatusCode?: number } }).$metadata?.httpStatusCode;
    if (code !== 404) { fallos++; console.log('ERROR al consultar', Key, (e as Error).name); return; }
  }
  try {
    await s3.send(new PutObjectCommand({ Bucket: bucket, Key, Body: readFileSync(archivo), ContentType: tipoMime(archivo), CacheControl: 'public, max-age=31536000, immutable' }));
    nuevas++;
  } catch (e) { fallos++; console.log('ERROR al subir', Key, (e as Error).name, String((e as Error).message).slice(0, 120)); }
}

async function trabajador() { for (let it = cola.shift(); it; it = cola.shift()) await subir(it); }

async function main() {
  await Promise.all(Array.from({ length: 6 }, trabajador));
  console.log(`Imágenes locales en el inventario: ${items.filter(i => i.origen === 's3').length} · archivos distintos: ${subidas.size}`);
  console.log(`Subidas: ${nuevas} · ya estaban: ${iguales} · fallos: ${fallos}`);
  if (faltantes.length) console.log(`Archivos que no existen en disco (${faltantes.length}):`, faltantes.slice(0, 5).join(', '));
  process.exit(fallos ? 1 : 0);
}
main();
