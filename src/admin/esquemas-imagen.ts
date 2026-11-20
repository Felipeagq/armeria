// Validación de lo que llega del gestor de imágenes (zod). Mensajes en español: se muestran tal cual.
import { z } from 'zod';
import { id } from './esquemas';

export const TIPOS_IMG = ['arma', 'municion', 'accesorio'] as const;
/** Tamaño máximo de un archivo subido. Amplify limita el cuerpo de la petición a ~6 MB, así que el tope va por debajo. */
export const MAX_BYTES_IMAGEN = 5 * 1024 * 1024;

/** Enlace https sin credenciales ni esquemas raros (javascript:, data:…). No se descarga nada desde el servidor. */
const enlace = (campo: string, obligatorio: boolean) => z.string({ error: `${campo}: texto no válido` }).trim().max(1000, `${campo}: máximo 1000 caracteres`).default('')
  .superRefine((s, ctx) => {
    if (!s) { if (obligatorio) ctx.addIssue({ code: 'custom', message: `${campo}: es obligatorio` }); return; }
    let u: URL;
    try { u = new URL(s); } catch { ctx.addIssue({ code: 'custom', message: `${campo}: no es un enlace válido (empieza por https://)` }); return; }
    if (u.protocol !== 'https:') ctx.addIssue({ code: 'custom', message: `${campo}: debe empezar por https://` });
    else if (u.username || u.password) ctx.addIssue({ code: 'custom', message: `${campo}: no puede llevar usuario ni contraseña` });
    else if (!u.hostname.includes('.')) ctx.addIssue({ code: 'custom', message: `${campo}: la dirección no es válida` });
  });

const opcional = (campo: string, max = 300) => z.string({ error: `${campo}: texto no válido` }).trim().max(max, `${campo}: máximo ${max} caracteres`).default('');

const base = {
  alt: z.string({ error: 'Texto alternativo: es obligatorio' }).trim().min(3, 'Texto alternativo: descríbela en unas palabras (mínimo 3 caracteres)').max(300, 'Texto alternativo: máximo 300 caracteres'),
  rol: z.enum(['principal', 'galeria'], { error: 'Rol: elige principal o galería' }),
  ajuste: z.enum(['', 'scene', 'cutout'], { error: 'Ajuste no válido' }).default(''),
  tipoFoto: z.enum(['', 'real', 'airsoft'], { error: 'Tipo de foto no válido' }).default(''),
  titulo: opcional('Pie de foto'),
  autor: opcional('Autor'),
  licencia: opcional('Licencia'),
  licenciaUrl: enlace('Enlace de la licencia', false),
  fuenteUrl: enlace('Enlace de la fuente', false),
};
const entidad = { tipo: z.enum(TIPOS_IMG, { error: 'Tipo de ficha no válido' }), entidadId: id.refine(v => v !== 'nueva') };

export const esquemaSubida = z.object({ ...entidad, ...base });
export const esquemaExterna = z.object({ ...entidad, ...base, url: enlace('Enlace de la imagen', true) });
export const esquemaEdicionImagen = z.object({ imagenId: z.number({ error: 'Imagen no válida' }).int().positive(), ...base, url: enlace('Enlace de la imagen', false) });
export const esquemaOrden = z.object({ ...entidad, ids: z.array(z.number().int().positive()).min(1).max(200) });

export type DatosSubida = z.output<typeof esquemaSubida>;
export type DatosExterna = z.output<typeof esquemaExterna>;
export type DatosEdicionImagen = z.output<typeof esquemaEdicionImagen>;
