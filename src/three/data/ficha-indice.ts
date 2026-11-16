// Lógica compartida de la ficha que usan la página (servidor) y el componente de variantes (cliente): sin imports de servidor.
import type { Cifras, DatosFicha, Par, VistaVariante } from './ficha';
import type { ItemIndice } from '@/components/FichaIndice';

export const textoPar = (p?: Par) => (p ? (p.m ? `${p.c} ${p.m}` : p.c) : '');

type ClaveFila = keyof Cifras | 'notas';
/** Filas que puede tener «Comparar variantes», en el orden de la ficha. */
export const FILAS_COMPARAR: [etiqueta: string, clave: ClaveFila][] = [
  ['Calibre', 'calibre'], ['Cañón', 'canon'], ['Peso', 'peso'], ['Cadencia', 'cadencia'], ['Velocidad inicial', 'velocidad'],
  ['Alcance eficaz', 'alcance'], ['Cargador', 'cargador'], ['Energía en boca', 'energia'], ['Notas', 'notas'],
];
/** Texto de una fila de la tabla; la energía lleva su base entre paréntesis para que no se pegue a la cifra. */
export const valorFila = (v: VistaVariante, k: ClaveFila) =>
  k === 'notas' ? v.notas ?? '' : k === 'energia' && v.energia ? `${v.energia.c} (${v.energia.m})` : textoPar(v[k]);

/** Solo las filas cuyo valor cambia entre variantes. */
export const filasComparar = (vs: VistaVariante[]) =>
  vs.length < 2 ? [] : FILAS_COMPARAR.filter(([, k]) => new Set(vs.map(v => valorFila(v, k))).size > 1);

/** ¿Tiene sentido la zona de réplica? Hay texto de airsoft, o alguna variante se puede montar o tiene accesorios. */
export const hayReplica = (d: DatosFicha) => !!d.airsoft || d.variantes.some(v => v.plataforma || v.nAcc);

export function seccionesDe(d: DatosFicha): ItemIndice[] {
  const real = 'Arma real', rep = 'Réplica de airsoft';
  return [
    { id: 'sec-ficha', label: 'Ficha técnica', grupo: real },
    ...(d.variantes.some(v => v.cartucho) ? [{ id: 'sec-municion', label: 'Munición', grupo: real }] : []),
    ...(filasComparar(d.variantes).length ? [{ id: 'sec-comparar', label: 'Comparar variantes', n: d.variantes.length, grupo: real }] : []),
    ...(d.airsoft ? [{ id: 'sec-sistema', label: 'Sistema', grupo: rep }] : []),
    ...(d.variantes.some(v => v.nAcc) ? [{ id: 'sec-accesorios', label: 'Accesorios', grupo: rep }] : []),
  ];
}
