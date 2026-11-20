// Utilidades del panel sin dependencias de servidor (las usan formularios de cliente y acciones).

/** «Colt M4A1 (SOPMOD)» → «colt-m4a1-sopmod»: minúsculas, sin tildes, guiones. */
export const slugify = (s: string, max = 60) =>
  s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, max).replace(/-+$/g, '');

export const fechaCorta = (d: Date | string) =>
  new Intl.DateTimeFormat('es-ES', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }).format(new Date(d));
