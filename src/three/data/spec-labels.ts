// Etiquetas y orden de los campos de una ficha. Módulo ligero (sin geometría ni three): lo usan componentes de cliente.
import type { Specs } from '../types';

export const SPEC_LABELS: [keyof Specs, string][] = [
  ['calibre', 'Calibre'], ['peso', 'Peso'], ['cañon', 'Cañón'], ['sistema', 'Sistema / cerrojo'], ['cadencia', 'Cadencia'],
  ['velocidad', 'Velocidad inicial'], ['alcance', 'Alcance eficaz'], ['cargador', 'Cargador'], ['airsoft', 'Réplica airsoft'], ['extra', 'Notas'],
];

/** Filas con dato de un bloque de specs, en el orden de la ficha. */
export const specRowsOf = (s?: Specs) => (s ? SPEC_LABELS.filter(([k]) => s[k]) : []);
