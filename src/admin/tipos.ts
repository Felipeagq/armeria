// Forma de los datos que viajan entre los formularios del panel (cliente) y las acciones (servidor).
import type { Specs } from '@/catalogo/tipos';

export type Par = [string, string];
/** Modelo real: solo el nombre, o nombre + nota. En el formulario siempre es par (nota vacía = solo nombre). */
export type ModeloForm = [string, string];

export interface FormVariante {
  /** Id en la BD si la variante ya existe (si no, se crea). */
  dbId?: number;
  slug: string;
  nombre: string;
  plataforma3d: string;
  specs: Specs;
  municion: string[];
  accesorios: string[];
}
export interface FormArma {
  modo: 'crear' | 'editar';
  id: string;
  nombre: string;
  fabricante: string;
  grupo: string;
  orden: number;
  revisado: boolean;
  tipo: string;
  resumen: string;
  specsComunes: Specs;
  variantes: FormVariante[];
}
export interface FormMunicion {
  modo: 'crear' | 'editar';
  id: string;
  nombre: string;
  nombreCorto: string;
  tipo: 'real' | 'airsoft';
  eslogan: string;
  patronCalibre: string;
  patronFlags: '' | 'i';
  claves: Par[];
  hechos: Par[];
  sobre: string[];
  fuente: string;
  orden: number;
  /** Ids (BD) de las variantes de arma que usan este cartucho. */
  variantes: number[];
}
export interface FormAccesorio {
  modo: 'crear' | 'editar';
  id: string;
  nombre: string;
  grupo: string;
  resumen: string;
  tecnico: string[];
  modelos: ModeloForm[];
  claves: Par[];
  datos: Par[];
  como: string[];
  tipos: Par[];
  pros: string[];
  contras: string[];
  airsoft: string;
  piezas3d: string[];
  fuente: string;
  orden: number;
  variantes: number[];
}
export interface FormTermino {
  modo: 'crear' | 'editar';
  id: string;
  nombre: string;
  grupo: string;
  corto: string;
  detalle: string;
  patron: string;
  patronFlags: '' | 'i';
  sigla: string;
  apodo: string;
  orden: number;
}

/** Opciones para las listas de relaciones. */
export interface OpcionRel { id: string; label: string; grupo?: string }
export interface ArmaConVariantes { id: string; nombre: string; variantes: { dbId: number; nombre: string }[] }

/* ── Imágenes ── */
export type TipoImg = 'arma' | 'municion' | 'accesorio';
/** Una imagen tal como la muestra el gestor del panel. */
export interface ImagenAdmin {
  id: number;
  url: string;
  origen: 's3' | 'externo';
  rol: 'principal' | 'galeria';
  alt: string;
  titulo: string;
  autor: string;
  licencia: string;
  licenciaUrl: string;
  fuenteUrl: string;
  ajuste: '' | 'scene' | 'cutout';
  tipoFoto: '' | 'real' | 'airsoft';
  orden: number;
  archivada: boolean;
}
/** Campos editables de una imagen (comunes a subir, enlazar y editar). */
export interface DatosImagenForm {
  alt: string;
  rol: 'principal' | 'galeria';
  ajuste: '' | 'scene' | 'cutout';
  tipoFoto: '' | 'real' | 'airsoft';
  titulo: string;
  autor: string;
  licencia: string;
  licenciaUrl: string;
  fuenteUrl: string;
}
/** Respuesta de las operaciones sobre imágenes. */
export type ResImagen = { ok: true } | { ok: false; errores: string[] };
