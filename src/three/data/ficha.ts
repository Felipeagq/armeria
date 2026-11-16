// Datos de la ficha de un arma, listos para pintar: una vista por variante (cifras, munición, accesorios que encajan en
// su plataforma 3D). Solo servidor (usa el catálogo y el registro 3D); el cliente recibe objetos serializables.
import type { Specs } from '../types';
import { SLOT_LABEL } from '../types';
import { PLATFORMS } from '../registry';
import { ammoForCalibre, energiaEnBoca } from './ammo';
import { accesoriosDePlataforma, accesoriosPara, accesoriosPorGrupo } from './accesorios-compat';
import type { Arma, ArmaVariante } from './armas';
import { armaPhoto, refSpecs } from './armas';
import { photoUrl } from './photos';

/** Una cifra con su matiz: «3,12–3,85 kg» + «vacío (11"–20")». `txt`: el dato no empieza por una cifra y se muestra como texto. */
export interface Par { c: string; m: string; txt?: boolean }
export interface Cifras { calibre?: Par; canon?: Par; peso?: Par; cadencia?: Par; alcance?: Par; energia?: Par; velocidad?: Par; cargador?: Par }
export interface Cartucho { id: string; nombre: string; lema: string; foto: string; clave: [string, string][] }
export interface GrupoAccVista { g: string; items: { id: string; n: string; foto?: string }[] }

export interface VistaVariante extends Cifras {
  id: string;
  nombre: string;
  /** Id de la plataforma del constructor 3D (si la variante se puede montar). */
  plataforma?: string;
  sistema?: string;
  notas?: string;
  cartucho?: Cartucho;
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
  foto?: { src: string; alt: string; fit?: 'scene' };
  variantes: VistaVariante[];
}

/** Separa la cifra principal de su matiz: «3,12–3,85 kg vacío (11"–20")» → «3,12–3,85 kg» + «vacío (11"–20")». Sin cifra al principio, devuelve null. */
export function partirCifra(v: string): { cifra: string; matiz: string } | null {
  const m = v.match(/^((?:Hasta\s+)?≈?\s*\d[\d.,]*(?:\s?[–×x-]\s?\d[\d.,]*)*(?:\s?(?:mm|kg|g|m\/s|m|J|disp\.\/min))?)(?=\s|$|·|\()\s*(.*)$/);
  return m && m[1].trim() ? { cifra: m[1].trim(), matiz: m[2].trim() } : null;
}

const par = (t?: string): Par | undefined => {
  if (!t) return undefined;
  const p = partirCifra(String(t));
  return p ? { c: p.cifra, m: p.matiz } : { c: String(t), m: '', txt: true };
};

function vista(a: Arma, v: ArmaVariante): VistaVariante {
  const s: Specs = { ...a.common, ...v.specs };
  const cart = ammoForCalibre(s.calibre)[0];
  const en = energiaEnBoca(s.velocidad, cart);
  const lista = v.platform ? accesoriosDePlataforma(v.platform) : accesoriosPara(a);
  const slots = v.platform ? PLATFORMS[v.platform]?.slots ?? [] : [];
  return {
    id: v.id, nombre: v.name, plataforma: v.platform,
    calibre: par(s.calibre), canon: par(s.cañon), peso: par(s.peso), cadencia: par(s.cadencia), alcance: par(s.alcance),
    energia: en ? { c: en.valor, m: en.base } : undefined, velocidad: par(s.velocidad), cargador: par(s.cargador),
    sistema: s.sistema, notas: s.extra,
    cartucho: cart ? { id: cart.id, nombre: cart.name, lema: cart.tagline, foto: `/ammo/${cart.photo.file}`, clave: cart.key } : undefined,
    puntos: [...new Set(slots.map(x => SLOT_LABEL[x.type]))],
    acc: accesoriosPorGrupo(lista).map(([g, l]) => ({ g, items: l.map(x => ({ id: x.id, n: x.nombre, foto: x.foto ? `/accesorios/t/${x.foto.file}` : undefined })) })),
    nAcc: lista.length,
  };
}

export function datosFicha(a: Arma): DatosFicha {
  const ph = armaPhoto(a);
  return {
    id: a.id, nombre: a.name, fuente: a.common.fuente, airsoft: refSpecs(a).airsoft,
    foto: ph ? { src: photoUrl(ph), fit: ph.fit, alt: `${a.name}: foto ${ph.kind === 'real' ? 'del arma real' : 'de la réplica de airsoft'}` } : undefined,
    variantes: a.variants.map(v => vista(a, v)),
  };
}
