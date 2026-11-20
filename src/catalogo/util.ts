// Funciones puras del catálogo (sin BD ni three): las usan páginas de servidor y componentes de cliente.
import type { Accesorio, CampoGlosario, Cartucho, GrupoAcc, GrupoSistema, Modelo, Specs } from './tipos';
import type { Arma } from './tipos';

export const ARMA_GROUPS = ['Familia AR-15', 'Familia Kalashnikov', 'Otros', 'Pistolas', 'Subfusiles'] as const;
export const GRUPOS_ACC: GrupoAcc[] = ['Ópticas', 'Bocachas', 'Luces y láseres', 'Empuñaduras y apoyos', 'Cargadores', 'Culatas'];
export const GRUPOS_SISTEMA: GrupoSistema[] = ['Cómo se recarga', 'Cómo se cierra', 'Cómo se dispara', 'En las réplicas de airsoft', 'En miras y accesorios'];

/** Dónde se busca cada grupo del glosario: el de airsoft se lee en «Réplica airsoft»; el de miras y accesorios, en el texto de la ficha del accesorio; el resto, en «Sistema / cerrojo». */
export const campoDe = (g: GrupoSistema): CampoGlosario => (g === 'En las réplicas de airsoft' ? 'airsoft' : g === 'En miras y accesorios' ? 'accesorio' : 'sistema');

/** Ancla de cada grupo en /accesorios/ (p. ej. «Luces y láseres» → luces-y-laseres). */
export const slugGrupo = (g: string) => g.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-');
export const nombreModelo = (m: Modelo) => (typeof m === 'string' ? m : m[0]);

/** Todo el texto visible de una ficha de accesorio: sirve para detectar qué términos del glosario aparecen en ella. */
export const textoAcc = (a: Accesorio): string => [
  a.resumen, ...a.clave.flat(), ...a.datos.flat(), ...a.como, ...(a.variantes?.flat() ?? []), ...a.pros, ...a.contras, a.airsoft,
].join('\n');

/** Specs «de referencia» de un arma: las comunes completadas con la primera variante. */
export const refSpecs = (a: Arma): Specs => ({ ...a.variants[0]?.specs, ...a.common });

/** Calibres normalizados de un texto libre: «5,56×45 mm NATO · .300 BLK» → ['5,56×45', '.300 BLK']. */
export function calibresDe(txt?: string): string[] {
  if (!txt) return [];
  const out = new Set<string>();
  for (const m of txt.matchAll(/(\d+(?:[.,]\d+)?)\s*[×x]\s*(\d+)/gi)) out.add(`${m[1].replace('.', ',')}×${m[2]}`);
  for (const m of txt.matchAll(/\.\d{2,3}\s?[A-Z][A-Za-z&]*/g)) out.add(m[0].replace(/\s+/, ' '));
  return [...out];
}
/** País: el último segmento tras «·» del fabricante, sin paréntesis («Colt Canada · Reino Unido (UKSF)» → «Reino Unido»). */
export function paisDe(maker: string): string | undefined {
  const parts = maker.split('·'); if (parts.length < 2) return undefined;
  return parts[parts.length - 1].replace(/\(.*?\)/g, '').trim() || undefined;
}

/** 1510 → «1.510», 4,2 → «4,2» (puntos de millar y coma decimal, como el resto de la ficha). */
const esNum = (n: number) => String(n).replace('.', ',').replace(/\B(?=(\d{3})+(?!\d))/g, '.');

/**
 * Energía en boca de un arma: E = ½·m·v² con la masa del proyectil del cartucho y la velocidad inicial
 * propia del arma, que depende de su cañón y no es la del cartucho de referencia. Devuelve null si el
 * arma no publica una velocidad en m/s o el cartucho no indica la masa. Un rango («900–915 m/s») usa su punto medio.
 */
export function energiaEnBoca(velocidad: string | undefined, c: Pick<Cartucho, 'key'> | undefined): { valor: string; base: string } | null {
  if (!velocidad || !c) return null;
  const masa = c.key.find(([etiqueta]) => etiqueta === 'Proyectil')?.[1].match(/^(\d+(?:,\d+)?)\s*g\b/);
  const vel = velocidad.match(/(\d+(?:[.,]\d+)?)(?:\s*[–-]\s*(\d+(?:[.,]\d+)?))?\s*m\/s/);
  if (!masa || !vel) return null;

  const kg = parseFloat(masa[1].replace(',', '.')) / 1000;
  const v1 = parseFloat(vel[1].replace(',', '.'));
  const v = vel[2] ? (v1 + parseFloat(vel[2].replace(',', '.'))) / 2 : v1;
  const j = 0.5 * kg * v * v;
  if (!Number.isFinite(j) || j <= 0) return null;

  // Redondeo a la decena, como las energías de las fichas de munición («≈ 1.770 J»).
  const redondeada = j >= 100 ? Math.round(j / 10) * 10 : j >= 10 ? Math.round(j) : Math.round(j * 10) / 10;
  return { valor: `≈ ${esNum(redondeada)} J`, base: `${masa[1]} g a ${vel[0].trim()}` };
}
