// Compatibilidad accesorio ↔ arma. SOLO SERVIDOR: usa las piezas y plataformas con geometría (three), así que no debe
// importarse desde componentes de cliente. Misma regla que el constructor (registry.compatibleParts): la plataforma
// tiene una ranura del tipo de la pieza y comparte alguna etiqueta con su `fits`.
import type { Part } from '../types';
import { PARTS as PIEZAS_GENERICAS } from './parts';
import { PLATFORMS as CUERPOS_GENERICOS } from './platforms';
import { REAL_PLATFORMS, RIFLE_PARTS } from './rifles';
import { ARMAS, has3d, type Arma } from './armas';
import { ACCESORIOS, GRUPOS_ACC, type Accesorio, type GrupoAcc } from './accesorios';

const PIEZAS: Part[] = [...PIEZAS_GENERICAS, ...RIFLE_PARTS];
const pieza = (id: string) => PIEZAS.find(p => p.id === id);

const encaja = (p: Part, platform: string) => {
  const P = REAL_PLATFORMS[platform] ?? CUERPOS_GENERICOS[platform];
  return !!P && P.slots.some(s => s.type === p.type) && (!p.fits || p.fits.some(t => P.tags.includes(t)));
};
const piezasDe = (a: Accesorio) => a.partes.map(pieza).filter((p): p is Part => !!p);
const monta = (a: Accesorio, platform: string) => piezasDe(a).some(p => encaja(p, platform));

/** Plataformas de armas del catálogo (ids de REAL_PLATFORMS) en las que se puede montar alguna pieza de la ficha. */
export const plataformasDe = (a: Accesorio) => Object.keys(REAL_PLATFORMS).filter(pid => monta(a, pid));

/** Cuerpos genéricos del constructor (pistola, carabina, subfusil) donde encaja el accesorio. */
export const genericosCon = (a: Accesorio) =>
  Object.entries(CUERPOS_GENERICOS).filter(([id]) => monta(a, id)).map(([id, P]) => ({ id, nombre: P.name }));

/** Armas con modelo 3D donde se puede montar el accesorio. */
export const armasCon = (a: Accesorio): Arma[] => {
  const pids = new Set(plataformasDe(a));
  return ARMAS.filter(arma => arma.variants.some(v => v.platform && pids.has(v.platform)));
};

/** Fichas de accesorios que se pueden montar en un arma (en el orden del catálogo). */
export const accesoriosPara = (arma: Arma): Accesorio[] => {
  const pids = arma.variants.map(v => v.platform).filter((p): p is string => !!p);
  return ACCESORIOS.filter(a => piezasDe(a).some(p => pids.some(pid => encaja(p, pid))));
};
/** Fichas de accesorios que se pueden montar en una variante concreta (id de plataforma del constructor). */
export const accesoriosDePlataforma = (pid: string): Accesorio[] => ACCESORIOS.filter(a => piezasDe(a).some(p => encaja(p, pid)));
export const accesoriosPorGrupo = (list: Accesorio[]) =>
  GRUPOS_ACC.map(g => [g, list.filter(a => a.grupo === g)] as [GrupoAcc, Accesorio[]]).filter(([, l]) => l.length);

/** Enlace de demostración al constructor: una plataforma donde la pieza encaja (se prefiere el HK416 A5 por defecto). */
export function demo3d(a: Accesorio): { plataforma: string; pieza: string } | undefined {
  const pids = [...plataformasDe(a), ...genericosCon(a).map(g => g.id)];
  const plataforma = pids.includes('hk416_a5') ? 'hk416_a5' : pids[0];
  const p = plataforma && piezasDe(a).find(x => encaja(x, plataforma));
  return p ? { plataforma, pieza: p.id } : undefined;
}

export const TOTAL_3D = ARMAS.filter(has3d).length;

/* ── Validación al importar el módulo (falla el build si los datos se desincronizan) ── */
(function verificar() {
  const errores: string[] = [];
  const ids = new Set<string>(); const reclamadas = new Map<string, string>();
  for (const a of ACCESORIOS) {
    if (ids.has(a.id)) errores.push(`id de accesorio repetido: ${a.id}`);
    ids.add(a.id);
    if (!a.partes.length) errores.push(`${a.id}: sin piezas`);
    for (const pid of a.partes) {
      if (!pieza(pid)) errores.push(`${a.id}: la pieza «${pid}» no existe`);
      const otra = reclamadas.get(pid);
      if (otra) errores.push(`la pieza «${pid}» la reclaman ${otra} y ${a.id}`);
      reclamadas.set(pid, a.id);
    }
    if (!armasCon(a).length && !genericosCon(a).length) errores.push(`${a.id}: no se monta en ningún cuerpo del constructor`);
    if (a.clave.length !== 3) errores.push(`${a.id}: la ficha debe tener 3 cifras clave`);
  }
  for (const p of PIEZAS) if (!reclamadas.has(p.id)) errores.push(`la pieza «${p.id}» (${p.name}) no tiene ficha de accesorio`);
  if (errores.length) throw new Error(`Accesorios inconsistentes:\n- ${errores.join('\n- ')}`);
})();
