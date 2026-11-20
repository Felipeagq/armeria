// Valores iniciales de los formularios de «crear». Módulo neutro: lo usan páginas de servidor y editores de cliente.
import type { FormAccesorio, FormArma, FormMunicion, FormTermino, FormVariante } from './tipos';

export const varianteNueva = (n: number): FormVariante => ({ slug: n === 0 ? 'std' : `v${n + 1}`, nombre: n === 0 ? 'Estándar' : '', plataforma3d: '', specs: {}, municion: [], accesorios: [] });

export const armaVacia = (): FormArma => ({ modo: 'crear', id: '', nombre: '', fabricante: '', grupo: 'Otros', orden: 0, revisado: true, tipo: '', resumen: '', specsComunes: {}, variantes: [varianteNueva(0)] });
export const municionVacia = (): FormMunicion => ({ modo: 'crear', id: '', nombre: '', nombreCorto: '', tipo: 'real', eslogan: '', patronCalibre: '', patronFlags: '', claves: [], hechos: [], sobre: [], fuente: '', orden: 0, variantes: [] });
export const accesorioVacio = (): FormAccesorio => ({ modo: 'crear', id: '', nombre: '', grupo: 'Ópticas', resumen: '', tecnico: [], modelos: [], claves: [], datos: [], como: [], tipos: [], pros: [], contras: [], airsoft: '', piezas3d: [], fuente: '', orden: 0, variantes: [] });
export const terminoVacio = (): FormTermino => ({ modo: 'crear', id: '', nombre: '', grupo: 'Cómo se cierra', corto: '', detalle: '', patron: '', patronFlags: 'i', sigla: '', apodo: '', orden: 0 });
