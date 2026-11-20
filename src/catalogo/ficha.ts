// Datos de la ficha de un arma, listos para pintar: una vista por variante (cifras, munición y accesorios que encajan).
// Solo servidor: usa el catálogo de la BD; el cliente recibe objetos serializables (DatosFicha).
import type { Catalogo } from './datos';
import type { Arma, ArmaVariante, DatosFicha, ParCifra, Specs, Termino, TerminoLite, VistaVariante } from './tipos';
import { energiaEnBoca, GRUPOS_ACC, refSpecs } from './util';

/** Separa la cifra principal de su matiz: «3,12–3,85 kg vacío (11"–20")» → «3,12–3,85 kg» + «vacío (11"–20")». Sin cifra al principio, devuelve null. */
export function partirCifra(v: string): { cifra: string; matiz: string } | null {
  const m = v.match(/^((?:Hasta\s+)?≈?\s*\d[\d.,]*(?:\s?[–×x-]\s?\d[\d.,]*)*(?:\s?(?:mm|kg|g|m\/s|m|J|disp\.\/min))?)(?=\s|$|·|\()\s*(.*)$/);
  return m && m[1].trim() ? { cifra: m[1].trim(), matiz: m[2].trim() } : null;
}

const par = (t?: string): ParCifra | undefined => {
  if (!t) return undefined;
  const p = partirCifra(String(t));
  return p ? { c: p.cifra, m: p.matiz } : { c: String(t), m: '', txt: true };
};

export const terminoLite = (t: Termino): TerminoLite => ({ id: t.id, nombre: t.nombre, corto: t.corto, sigla: t.sigla, apodo: t.apodo });

function vista(cat: Catalogo, a: Arma, v: ArmaVariante): VistaVariante {
  const s: Specs = { ...a.common, ...v.specs };
  const cart = cat.cartuchosDe(v)[0];
  const en = energiaEnBoca(s.velocidad, cart);
  const lista = cat.accesoriosDe(a, v);
  return {
    id: v.id, nombre: v.name, plataforma: v.platform,
    calibre: par(s.calibre), canon: par(s.cañon), peso: par(s.peso), cadencia: par(s.cadencia), alcance: par(s.alcance),
    energia: en ? { c: en.valor, m: en.base } : undefined, velocidad: par(s.velocidad), cargador: par(s.cargador),
    sistema: s.sistema, terminosSistema: cat.sistemasDe(s.sistema, 'sistema').map(terminoLite), notas: s.extra,
    cartucho: cart ? { id: cart.id, nombre: cart.name, lema: cart.tagline, foto: cart.foto?.url ?? '', clave: cart.key } : undefined,
    puntos: [],
    acc: GRUPOS_ACC.map(g => [g, lista.filter(x => x.grupo === g)] as const).filter(([, l]) => l.length)
      .map(([g, l]) => ({ g, items: l.map(x => ({ id: x.id, n: x.nombre, foto: x.foto?.miniUrl ?? x.foto?.url })) })),
    nAcc: lista.length,
  };
}

export function datosFicha(cat: Catalogo, a: Arma): DatosFicha {
  const ph = a.foto;
  const airsoft = refSpecs(a).airsoft;
  return {
    id: a.id, nombre: a.name, fuente: a.common.fuente, airsoft, terminosAirsoft: cat.sistemasDe(airsoft, 'airsoft').map(terminoLite),
    foto: ph ? { src: ph.url, fit: ph.ajuste === 'scene' ? 'scene' : undefined, alt: ph.alt } : undefined,
    variantes: a.variants.map(v => vista(cat, a, v)),
  };
}
