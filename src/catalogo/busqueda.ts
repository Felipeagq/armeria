// Índice del buscador global: una entrada por arma, accesorio, cartucho y término del glosario.
// Solo servidor (lee el catálogo de la BD); el cliente lo recibe como JSON desde /api/busqueda/.
import type { Catalogo } from './datos';
import { nombreModelo } from './util';

export type TipoBusqueda = 'arma' | 'accesorio' | 'municion' | 'glosario';
/** t: tipo · h: enlace · n: nombre · s: subtítulo que se muestra · k: palabras extra en las que también se busca. */
export interface EntradaBusqueda { t: TipoBusqueda; h: string; n: string; s: string; k: string }

export const indiceBusqueda = (cat: Catalogo): EntradaBusqueda[] => [
  ...cat.armas.map<EntradaBusqueda>(a => ({
    t: 'arma', h: `/armas/${a.id}/`, n: a.name,
    s: [a.maker, a.common.calibre ?? a.variants[0]?.specs.calibre].filter(Boolean).join(' · '),
    k: [a.group, ...a.variants.map(v => v.name), a.common.sistema, a.common.airsoft].filter(Boolean).join(' '),
  })),
  ...cat.accesorios.map<EntradaBusqueda>(a => ({ t: 'accesorio', h: `/accesorios/${a.id}/`, n: a.nombre, s: `${a.grupo} · ${a.tecnico[0]}`, k: [a.resumen, ...a.tecnico, ...a.modelos.map(nombreModelo)].join(' ') })),
  ...cat.ammo.map<EntradaBusqueda>(c => ({ t: 'municion', h: `/balas/${c.id}/`, n: c.name, s: c.tagline, k: c.short })),
  ...cat.sistemas.map<EntradaBusqueda>(s => ({ t: 'glosario', h: `/sistemas/#${s.id}`, n: s.nombre, s: s.corto, k: [s.grupo, s.sigla].filter(Boolean).join(' ') })),
];
