// Índice del buscador global: una entrada por arma, accesorio, cartucho y término del glosario.
// Solo servidor (importa el catálogo completo); el cliente lo recibe como JSON desde /api/busqueda/.
import { ARMAS } from './armas';
import { ACCESORIOS } from './accesorios';
import { AMMO } from './ammo';
import { SISTEMAS } from './sistemas';

export type TipoBusqueda = 'arma' | 'accesorio' | 'municion' | 'glosario';
/** t: tipo · h: enlace · n: nombre · s: subtítulo que se muestra · k: palabras extra en las que también se busca. */
export interface EntradaBusqueda { t: TipoBusqueda; h: string; n: string; s: string; k: string }

export const indiceBusqueda = (): EntradaBusqueda[] => [
  ...ARMAS.map<EntradaBusqueda>(a => ({
    t: 'arma', h: `/armas/${a.id}/`, n: a.name,
    s: [a.maker, a.common.calibre ?? a.variants[0]?.specs.calibre].filter(Boolean).join(' · '),
    k: [a.group, ...a.variants.map(v => v.name), a.common.sistema, a.common.airsoft].filter(Boolean).join(' '),
  })),
  ...ACCESORIOS.map<EntradaBusqueda>(a => ({ t: 'accesorio', h: `/accesorios/${a.id}/`, n: a.nombre, s: a.grupo, k: a.resumen })),
  ...AMMO.map<EntradaBusqueda>(c => ({ t: 'municion', h: `/balas/${c.id}/`, n: c.name, s: c.tagline, k: c.short })),
  ...SISTEMAS.map<EntradaBusqueda>(s => ({ t: 'glosario', h: `/sistemas/#${s.id}`, n: s.nombre, s: s.corto, k: s.grupo })),
];
