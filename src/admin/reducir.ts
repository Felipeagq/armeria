// Prepara una imagen en el navegador antes de subirla (solo cliente). Motivos: Amplify limita el cuerpo de la petición (~6 MB), las fotos
// de móvil son enormes y los JPEG de cámara llevan metadatos (GPS incluido). Al pasar el JPEG por un canvas se reescribe sin ellos.
//  · JPEG: siempre se reescribe, con lado máximo de 2400 px.
//  · PNG y WebP: se dejan tal cual si caben; si no, se reducen (WebP conserva la transparencia de los recortes).
export const LADO_MAX = 2400;
export const BYTES_MAX = 4.5 * 1024 * 1024;

const aBlob = (c: HTMLCanvasElement, tipo: string, calidad: number) => new Promise<Blob | null>(r => c.toBlob(r, tipo, calidad));

export async function reducirImagen(f: File): Promise<Blob> {
  if (!/^image\/(jpeg|png|webp)$/.test(f.type)) throw new Error('Formato no admitido: usa JPG, PNG o WebP.');
  let bmp: ImageBitmap;
  try { bmp = await createImageBitmap(f); } catch { throw new Error('No se pudo leer la imagen: el archivo está dañado o no es una imagen.'); }
  try {
    const escala = Math.min(1, LADO_MAX / Math.max(bmp.width, bmp.height));
    if (f.type !== 'image/jpeg' && escala === 1 && f.size <= BYTES_MAX) return f;
    const lienzo = document.createElement('canvas');
    lienzo.width = Math.max(1, Math.round(bmp.width * escala));
    lienzo.height = Math.max(1, Math.round(bmp.height * escala));
    const ctx = lienzo.getContext('2d');
    if (!ctx) throw new Error('El navegador no puede procesar la imagen.');
    if (f.type === 'image/jpeg') { ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, lienzo.width, lienzo.height); }
    ctx.drawImage(bmp, 0, 0, lienzo.width, lienzo.height);
    const intentos: [string, number][] = f.type === 'image/jpeg' ? [['image/jpeg', 0.9], ['image/jpeg', 0.8], ['image/jpeg', 0.7]] : [['image/webp', 0.9], ['image/webp', 0.8], ['image/png', 1]];
    for (const [tipo, calidad] of intentos) {
      const b = await aBlob(lienzo, tipo, calidad);
      if (b && b.type === tipo && b.size <= BYTES_MAX) return b;
    }
    throw new Error('La imagen sigue pesando más de 4,5 MB incluso reducida. Usa una más pequeña.');
  } finally { bmp.close(); }
}
