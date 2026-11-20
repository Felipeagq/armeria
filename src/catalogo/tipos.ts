// Tipos del catálogo tal como lo leen las páginas: salen de la BD (src/catalogo/datos.ts) con las mismas formas que antes
// tenían los módulos de src/three/data, para que las páginas cambien lo mínimo. Sin imports de servidor: sirve en cliente.
import type { Specs } from '@/three/types';

export type { Specs };
export type Par = [etiqueta: string, valor: string];
export type Modelo = string | [nombre: string, nota: string];
export type GrupoAcc = 'Ópticas' | 'Bocachas' | 'Luces y láseres' | 'Empuñaduras y apoyos' | 'Cargadores' | 'Culatas';
export type GrupoSistema = 'Cómo se recarga' | 'Cómo se cierra' | 'Cómo se dispara' | 'En las réplicas de airsoft' | 'En miras y accesorios';
export type CampoGlosario = 'sistema' | 'airsoft' | 'accesorio';

/** Imagen de una ficha. `url` es la de la app (/img/… si está en S3) o un enlace externo. */
export interface Foto {
  url: string;
  alt: string;
  titulo?: string;
  autor?: string;
  licencia?: string;
  licenciaUrl?: string;
  fuenteUrl?: string;
  /** 'scene': foto con escenario; 'cutout': recorte sobre fondo liso. */
  ajuste?: 'scene' | 'cutout';
  tipoFoto?: 'real' | 'airsoft';
  /** Miniatura (360 px) para listados, si existe. */
  miniUrl?: string;
}

export interface ArmaVariante {
  id: string;
  /** Id numérico en la BD (relaciones). */
  dbId: number;
  name: string;
  specs: Specs;
  /** Plataforma del constructor 3D (se conserva para reactivarlo). */
  platform?: string;
}
export interface Arma {
  id: string;
  name: string;
  maker: string;
  group: string;
  common: Specs;
  variants: ArmaVariante[];
  origen: 'catalogo' | 'wikipedia' | 'ia';
  revisado: boolean;
  foto?: Foto;
  galeria: Foto[];
}
export interface Cartucho {
  id: string;
  name: string;
  short: string;
  kind: 'real' | 'airsoft';
  tagline: string;
  /** Reconoce el cartucho en el texto de calibre de un arma. */
  match?: RegExp;
  facts: Par[];
  about: string[];
  key: Par[];
  fuente: string;
  foto?: Foto;
  galeria: Foto[];
}
export interface Accesorio {
  id: string;
  nombre: string;
  grupo: GrupoAcc;
  resumen: string;
  tecnico: string[];
  modelos: Modelo[];
  clave: Par[];
  datos: Par[];
  como: string[];
  variantes?: Par[];
  pros: string[];
  contras: string[];
  airsoft: string;
  /** Piezas del constructor 3D que representa la ficha (se conservan para reactivarlo). */
  partes: string[];
  fuente: string;
  foto?: Foto;
  galeria: Foto[];
}
export interface Termino {
  id: string;
  nombre: string;
  grupo: GrupoSistema;
  corto: string;
  detalle: string;
  patron: RegExp;
  sigla?: string;
  apodo?: string;
}
/** Término del glosario listo para el cliente (sin la expresión regular). */
export interface TerminoLite { id: string; nombre: string; corto: string; sigla?: string; apodo?: string }

/* ── Datos para el cliente: portada y comparador ── */
export interface ArmaCard {
  id: string; name: string; maker: string; group: string;
  photo: string | null; calibre?: string; cadencia?: string;
  variants: string[]; has3d: boolean;
  /** Calibres normalizados (para filtrar) y país del fabricante. */
  calibres: string[]; pais?: string;
}
export interface ArmaComp {
  id: string; name: string; maker: string; group: string; photo: string | null;
  common: Specs;
  variants: { id: string; name: string; specs: Specs; modelo3d: boolean }[];
}

/* ── Ficha de un arma, lista para pintar (una vista por variante) ── */
/** Una cifra con su matiz: «3,12–3,85 kg» + «vacío (11"–20")». `txt`: el dato no empieza por una cifra y se muestra como texto. */
export interface ParCifra { c: string; m: string; txt?: boolean }
export interface Cifras { calibre?: ParCifra; canon?: ParCifra; peso?: ParCifra; cadencia?: ParCifra; alcance?: ParCifra; energia?: ParCifra; velocidad?: ParCifra; cargador?: ParCifra }
export interface CartuchoVista { id: string; nombre: string; lema: string; foto: string; clave: Par[] }
export interface GrupoAccVista { g: string; items: { id: string; n: string; foto?: string }[] }

export interface VistaVariante extends Cifras {
  id: string;
  nombre: string;
  /** Plataforma del constructor 3D (si la variante se puede montar). */
  plataforma?: string;
  sistema?: string;
  /** Términos del glosario que aparecen en «Sistema / cerrojo». */
  terminosSistema: TerminoLite[];
  notas?: string;
  cartucho?: CartuchoVista;
  /** Tipos de pieza que admite el modelo 3D («Óptica», «Bocacha»…). */
  puntos: string[];
  acc: GrupoAccVista[];
  nAcc: number;
}
export interface DatosFicha {
  id: string;
  nombre: string;
  fuente?: string;
  /** Texto de «Réplica airsoft» del arma. */
  airsoft?: string;
  /** Términos del glosario que aparecen en el texto de airsoft. */
  terminosAirsoft: TerminoLite[];
  foto?: { src: string; alt: string; fit?: 'scene' };
  variantes: VistaVariante[];
}
