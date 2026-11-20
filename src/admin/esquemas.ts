// Validación de lo que llega del panel (zod). Mensajes en español y con el nombre del campo, porque se muestran tal cual.
import { z } from 'zod';
import { ARMA_GROUPS, GRUPOS_ACC, GRUPOS_SISTEMA } from '@/catalogo/util';

const MODO = z.enum(['crear', 'editar'], { error: 'Modo de guardado no válido' });

export const id = z.string({ error: 'Identificador: es obligatorio' }).trim().toLowerCase()
  .min(1, 'Identificador: es obligatorio')
  .max(60, 'Identificador: máximo 60 caracteres')
  .regex(/^[a-z0-9][a-z0-9-]*$/, 'Identificador: solo minúsculas sin tildes, números y guiones (es la dirección de la ficha)')
  .refine(v => v !== 'nueva', 'Identificador: «nueva» está reservado');

const texto = (campo: string, max = 300) => z.string({ error: `${campo}: es obligatorio` }).trim()
  .min(1, `${campo}: es obligatorio`).max(max, `${campo}: máximo ${max} caracteres`);
const opcional = (campo: string, max = 1500) => z.string({ error: `${campo}: texto no válido` }).trim().max(max, `${campo}: máximo ${max} caracteres`).default('');
const orden = z.coerce.number({ error: 'Orden: debe ser un número' }).int('Orden: número entero').min(0, 'Orden: no puede ser negativo').max(100000, 'Orden: demasiado grande').default(0);
const grupoDe = (campo: string, validos: readonly string[]) => z.string().refine(v => validos.includes(v), `${campo}: elige uno de la lista`);

/** Lista de textos: se descartan las filas vacías. */
const lineas = (campo: string, max = 4000, maxItems = 40) => z.array(z.string({ error: `${campo}: texto no válido` }).trim().max(max, `${campo}: cada línea admite hasta ${max} caracteres`))
  .max(maxItems, `${campo}: máximo ${maxItems} líneas`).default([]).transform(a => a.filter(Boolean));

/** Pares etiqueta/valor: una fila a medias es un error; la fila totalmente vacía se descarta. */
const pares = (campo: string, maxItems = 60) => z.array(z.tuple([
  z.string().trim().max(200, `${campo}: la etiqueta admite hasta 200 caracteres`),
  z.string().trim().max(3000, `${campo}: el valor admite hasta 3000 caracteres`),
]), { error: `${campo}: lista no válida` }).max(maxItems, `${campo}: máximo ${maxItems} filas`).default([])
  .superRefine((filas, ctx) => filas.forEach(([a, b], i) => {
    if ((a && !b) || (!a && b)) ctx.addIssue({ code: 'custom', message: `${campo}, fila ${i + 1}: rellena etiqueta y valor (o borra la fila)` });
  }))
  .transform(filas => filas.filter(([a, b]) => a && b) as [string, string][]);

const flags = z.enum(['', 'i'], { error: 'Indicadores de la expresión: solo vacío o «i»' }).default('');

/** Expresión regular guardada como texto: debe compilar y no tener la forma típica de las que se atascan. */
const patron = (campo: string, obligatorio: boolean) => z.string().trim().max(400, `${campo}: máximo 400 caracteres`).default('')
  .superRefine((s, ctx) => {
    if (!s) { if (obligatorio) ctx.addIssue({ code: 'custom', message: `${campo}: es obligatorio` }); return; }
    try { new RegExp(s); } catch (e) { ctx.addIssue({ code: 'custom', message: `${campo}: expresión regular no válida (${(e as Error).message.replace(/^Invalid regular expression: /, '')})` }); return; }
    if (/\((?:[^()\\]|\\.)*[+*](?:[^()\\]|\\.)*\)[+*{]/.test(s)) ctx.addIssue({ code: 'custom', message: `${campo}: cuantificadores anidados como (a+)+ pueden bloquear el servidor; simplifícala` });
  });

export const specs = z.object({
  calibre: opcional('Calibre'), peso: opcional('Peso'), cañon: opcional('Cañón'), sistema: opcional('Sistema / cerrojo'),
  cadencia: opcional('Cadencia'), velocidad: opcional('Velocidad inicial'), alcance: opcional('Alcance eficaz'),
  cargador: opcional('Cargador'), airsoft: opcional('Réplica airsoft', 4000), extra: opcional('Notas', 4000), fuente: opcional('Fuente'),
}, { error: 'Datos técnicos no válidos' }).transform(o => Object.fromEntries(Object.entries(o).filter(([, v]) => v)) as Record<string, string>);

/* ── Arma ── */
const variante = z.object({
  dbId: z.number().int().positive().optional(),
  slug: z.string().trim().toLowerCase().min(1, 'Variante: el identificador es obligatorio').max(40, 'Variante: identificador de hasta 40 caracteres')
    .regex(/^[a-z0-9][a-z0-9-]*$/, 'Variante: el identificador solo admite minúsculas, números y guiones'),
  nombre: texto('Variante: nombre', 200),
  plataforma3d: z.string().trim().max(60, 'Plataforma 3D: máximo 60 caracteres').default(''),
  specs,
  municion: z.array(z.string()).max(40).default([]),
  accesorios: z.array(z.string()).max(200).default([]),
});
export const esquemaArma = z.object({
  modo: MODO,
  id,
  nombre: texto('Nombre', 200),
  fabricante: opcional('Fabricante', 300),
  grupo: grupoDe('Grupo', ARMA_GROUPS),
  orden,
  revisado: z.boolean().default(true),
  tipo: opcional('Tipo', 200),
  resumen: opcional('Resumen', 4000),
  specsComunes: specs,
  variantes: z.array(variante).min(1, 'Variantes: el arma necesita al menos una').max(30, 'Variantes: máximo 30'),
}).superRefine((a, ctx) => {
  const vistos = new Set<string>();
  for (const v of a.variantes) {
    if (vistos.has(v.slug)) ctx.addIssue({ code: 'custom', message: `Variantes: el identificador «${v.slug}» está repetido` });
    vistos.add(v.slug);
  }
});

/* ── Munición ── */
export const esquemaMunicion = z.object({
  modo: MODO,
  id,
  nombre: texto('Nombre', 200),
  nombreCorto: texto('Nombre corto', 80),
  tipo: z.enum(['real', 'airsoft'], { error: 'Tipo: elige real o airsoft' }),
  eslogan: opcional('Eslogan', 600),
  patronCalibre: patron('Expresión del calibre', false),
  patronFlags: flags,
  claves: pares('Datos clave'),
  hechos: pares('Datos'),
  sobre: lineas('Sobre este cartucho'),
  fuente: opcional('Fuente', 500),
  orden,
  variantes: z.array(z.number().int().positive()).max(500).default([]),
});

/* ── Accesorio ── */
export const esquemaAccesorio = z.object({
  modo: MODO,
  id,
  nombre: texto('Nombre', 200),
  grupo: grupoDe('Grupo', GRUPOS_ACC),
  resumen: opcional('Resumen', 1500),
  tecnico: lineas('Nombres en inglés', 200, 10),
  modelos: z.array(z.tuple([z.string().trim().max(200, 'Modelos: nombre de hasta 200 caracteres'), z.string().trim().max(600, 'Modelos: nota de hasta 600 caracteres')]), { error: 'Modelos: lista no válida' })
    .max(60, 'Modelos: máximo 60').default([])
    .superRefine((f, ctx) => f.forEach(([n, nota], i) => { if (!n && nota) ctx.addIssue({ code: 'custom', message: `Modelos, fila ${i + 1}: falta el nombre` }); }))
    .transform(f => f.filter(([n]) => n).map(([n, nota]) => (nota ? [n, nota] : n) as string | [string, string])),
  claves: pares('Datos clave'),
  datos: pares('Datos'),
  como: lineas('Cómo funciona'),
  tipos: pares('Tipos'),
  pros: lineas('Ventajas', 1000),
  contras: lineas('Límites', 1000),
  airsoft: opcional('En airsoft', 4000),
  piezas3d: lineas('Piezas del constructor 3D', 80, 30),
  fuente: opcional('Fuente', 500),
  orden,
  variantes: z.array(z.number().int().positive()).max(500).default([]),
});

/* ── Glosario ── */
export const esquemaTermino = z.object({
  modo: MODO,
  id,
  nombre: texto('Nombre', 200),
  grupo: grupoDe('Grupo', GRUPOS_SISTEMA),
  corto: texto('Explicación corta', 800),
  detalle: opcional('Detalle', 6000),
  patron: patron('Expresión que detecta el término', true),
  patronFlags: flags,
  sigla: opcional('Sigla', 40),
  apodo: opcional('Apodo', 120),
  orden,
});

/** Convierte los errores de zod en una lista de frases (sin repetidos). */
export function erroresDe(e: z.ZodError): string[] {
  return [...new Set(e.issues.map(i => i.message))].slice(0, 12);
}
