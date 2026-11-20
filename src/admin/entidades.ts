// Entidades editables del panel. Sin imports de servidor: lo usan páginas y componentes de cliente.
export type Seg = 'armas' | 'municion' | 'accesorios' | 'glosario';
export type TipoReg = 'arma' | 'municion' | 'accesorio' | 'glosario';

export const ENTIDADES: Record<Seg, { tipo: TipoReg; plural: string; singular: string; nueva: string; publica: (id: string) => string }> = {
  armas: { tipo: 'arma', plural: 'Armas', singular: 'arma', nueva: 'Nueva arma', publica: id => `/armas/${id}/` },
  municion: { tipo: 'municion', plural: 'Munición', singular: 'cartucho', nueva: 'Nuevo cartucho', publica: id => `/balas/${id}/` },
  accesorios: { tipo: 'accesorio', plural: 'Accesorios', singular: 'accesorio', nueva: 'Nuevo accesorio', publica: id => `/accesorios/${id}/` },
  glosario: { tipo: 'glosario', plural: 'Glosario', singular: 'término', nueva: 'Nuevo término', publica: id => `/sistemas/#${id}` },
};
export const SEGMENTOS = Object.keys(ENTIDADES) as Seg[];
export const esSeg = (s: string): s is Seg => Object.hasOwn(ENTIDADES, s);
export const segDeTipo = (t: string): Seg | undefined => SEGMENTOS.find(s => ENTIDADES[s].tipo === t);

/** Resultado de guardar: lo devuelven las Server Actions al formulario. */
export type EstadoGuardado = { errores?: string[]; mensaje?: string } | undefined;
