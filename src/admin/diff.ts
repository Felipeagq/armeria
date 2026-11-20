// Diferencias entre dos fotos de un ítem (para el registro de cambios).
// Claves de primer nivel; las listas de variantes (con `slug`) se comparan variante a variante y solo se muestran las claves que cambian.
export interface Cambio { campo: string; antes: string; despues: string }

const recorta = (t: string) => (t.length > 900 ? `${t.slice(0, 900)}…` : t);
const mostrar = (v: unknown): string => {
  if (v === undefined || v === null) return '—';
  return recorta(typeof v === 'string' ? v : JSON.stringify(v, null, 1));
};
const compacto = (v: unknown) => (typeof v === 'string' ? v : JSON.stringify(v));
const lineas = (o: Record<string, unknown>, claves: string[]) => recorta(claves.map(k => `${k}: ${compacto(o[k] ?? null)}`).join('\n'));

type ConSlug = Record<string, unknown> & { slug: string };
const listaConSlug = (v: unknown): v is ConSlug[] => Array.isArray(v) && v.every(x => x && typeof x === 'object' && typeof (x as ConSlug).slug === 'string');

function porVariante(clave: string, a: ConSlug[], d: ConSlug[]): Cambio[] {
  const slugs = [...new Set([...a.map(v => v.slug), ...d.map(v => v.slug)])];
  const out: Cambio[] = [];
  for (const slug of slugs) {
    const x = a.find(v => v.slug === slug), y = d.find(v => v.slug === slug);
    if (JSON.stringify(x) === JSON.stringify(y)) continue;
    const campo = `${clave} › ${slug}`;
    if (!x && y) out.push({ campo, antes: '—', despues: lineas(y, Object.keys(y)) });
    else if (x && !y) out.push({ campo, antes: lineas(x, Object.keys(x)), despues: '— (archivada)' });
    else if (x && y) {
      const ks = [...new Set([...Object.keys(x), ...Object.keys(y)])].filter(k => JSON.stringify(x[k]) !== JSON.stringify(y[k]));
      out.push({ campo, antes: lineas(x, ks), despues: lineas(y, ks) });
    }
  }
  return out;
}

export function cambios(antes: unknown, despues: unknown): Cambio[] {
  const a = (antes && typeof antes === 'object' ? antes : {}) as Record<string, unknown>;
  const d = (despues && typeof despues === 'object' ? despues : {}) as Record<string, unknown>;
  const claves = [...new Set([...Object.keys(a), ...Object.keys(d)])].filter(k => JSON.stringify(a[k]) !== JSON.stringify(d[k]));
  return claves.flatMap(k => (listaConSlug(a[k]) && listaConSlug(d[k]) ? porVariante(k, a[k], d[k]) : [{ campo: k, antes: mostrar(a[k]), despues: mostrar(d[k]) }]));
}
