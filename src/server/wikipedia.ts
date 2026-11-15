// Nivel 2 de la cascada: Wikipedia (es, en). Búsqueda restringida a artículos con infobox de arma,
// lectura de la ficha, extracto, foto y atribución de Commons. Las respuestas HTTP se cachean un día.
import type { Specs } from '@/three/types';
import { infobox, plain } from './wikitext';
import { adivinarGenerico, type FichaExterna, type FotoExterna } from './store';

export type Lang = 'es' | 'en';
const LANGS: Lang[] = ['es', 'en'];
const UA = 'Armeria3D/1.0 (enciclopedia airsoft; Next.js; fichas con atribucion CC BY-SA)';
const WEAPON_TPL: Record<Lang, string> = { es: 'hastemplate:"Ficha de arma"', en: 'hastemplate:"Infobox weapon"' };

async function api(lang: Lang, params: Record<string, string>, revalidate = 86400): Promise<unknown> {
  const u = new URL(`https://${lang}.wikipedia.org/w/api.php`);
  for (const [k, v] of Object.entries({ format: 'json', formatversion: '2', utf8: '1', ...params })) u.searchParams.set(k, v);
  const r = await fetch(u, { headers: { 'User-Agent': UA, 'Api-User-Agent': UA }, next: { revalidate } });
  if (!r.ok) throw new Error(`Wikipedia ${lang} ${r.status}`);
  return r.json();
}

/* ── Búsqueda ─────────────────────────────────────────────────────── */
export interface Candidato { lang: Lang; title: string; slug: string; descripcion?: string; thumb?: string }
interface SearchPage { title: string; description?: string; thumbnail?: { source: string }; index: number }

export const wikiSlug = (lang: Lang, title: string) => `w-${lang}-${title.trim().replace(/ /g, '_')}`;
export function parseWikiSlug(slug: string): { lang: Lang; title: string } | null {
  const m = /^w-(es|en)-(.+)$/.exec(slug); if (!m) return null;
  return { lang: m[1] as Lang, title: m[2].replace(/_/g, ' ') };
}

export async function buscarWikipedia(q: string, limit = 6): Promise<Candidato[]> {
  const term = q.trim().slice(0, 80); if (!term) return [];
  const porIdioma = await Promise.all(LANGS.map(async lang => {
    try {
      const d = await api(lang, {
        action: 'query', generator: 'search', gsrsearch: `${term} ${WEAPON_TPL[lang]}`, gsrlimit: String(limit), gsrnamespace: '0',
        prop: 'pageimages|description', piprop: 'thumbnail', pithumbsize: '480',
      }, 3600) as { query?: { pages?: SearchPage[] } };
      return (d.query?.pages ?? []).sort((a, b) => a.index - b.index)
        .map<Candidato>(p => ({ lang, title: p.title, slug: wikiSlug(lang, p.title), descripcion: p.description, thumb: p.thumbnail?.source }));
    } catch { return []; }
  }));
  // Español primero; en inglés se omiten los títulos que ya salieron en español
  const vistos = new Set<string>(); const out: Candidato[] = [];
  for (const c of porIdioma.flat()) { const k = c.title.toLowerCase(); if (vistos.has(k)) continue; vistos.add(k); out.push(c); }
  // Primero los artículos cuyo título contiene lo buscado (orden estable: español antes que inglés)
  const t = term.toLowerCase();
  return out.map((c, i) => ({ c, i, hit: c.title.toLowerCase().includes(t) ? 0 : 1 })).sort((a, b) => a.hit - b.hit || a.i - b.i).map(x => x.c);
}

/* ── Ficha de un artículo ─────────────────────────────────────────── */
interface Page {
  title: string; missing?: boolean; fullurl?: string; pageimage?: string; extract?: string;
  revisions?: { slots: { main: { content: string } } }[];
}
interface ImageInfo { thumburl?: string; url?: string; descriptionurl?: string; extmetadata?: Record<string, { value: string }> }

const first = (ib: Record<string, string>, keys: string[]) => { for (const k of keys) { const v = ib[k]; if (v) return v; } return undefined; };
const corta = (s: string | undefined, max = 220) => s && s.length > max ? s.slice(0, max - 1).replace(/\s+\S*$/, '') + '…' : s;

/** Mapea la infobox (en/es) a los campos de la ficha. */
function specsDe(ib: Record<string, string>): { specs: Specs; maker?: string; tipo?: string } {
  const specs: Specs = {
    calibre: corta(first(ib, ['munición', 'cartridge', 'calibre', 'caliber', 'cartucho'])),
    peso: corta(first(ib, ['peso', 'weight'])),
    cañon: corta(first(ib, ['longitud del cañón', 'longitud cañón', 'cañón', 'part length', 'barrel length'])),
    sistema: corta(first(ib, ['sistema', 'action', 'mecanismo'])),
    cadencia: corta(first(ib, ['cadencia', 'rate', 'rate of fire'])),
    velocidad: corta(first(ib, ['velocidad', 'velocity', 'muzzle velocity'])),
    alcance: corta([first(ib, ['alcance', 'range', 'effective range']), first(ib, ['alcance máximo', 'max range'])].filter(Boolean).map((v, i) => i ? `máx. ${v}` : v).join(' · ') || undefined),
    cargador: corta(first(ib, ['cargador', 'feed', 'feed system'])),
  };
  const notas = [
    first(ib, ['longitud', 'length']) && `Longitud: ${first(ib, ['longitud', 'length'])}`,
    first(ib, ['miras', 'sights']) && `Miras: ${first(ib, ['miras', 'sights'])}`,
    first(ib, ['serv fecha', 'service']) && `En servicio: ${first(ib, ['serv fecha', 'service'])}`,
  ].filter(Boolean) as string[];
  if (notas.length) specs.extra = corta(notas.join(' · '), 300);
  const fab = first(ib, ['fabricante', 'manufacturer']); const pais = first(ib, ['origen', 'nación', 'nacion', 'origin', 'país']);
  const maker = [corta(fab, 60), pais && !fab?.toLowerCase().includes(pais.toLowerCase()) ? corta(pais, 40) : undefined].filter(Boolean).join(' · ') || undefined;
  const tipo = corta(first(ib, ['spec tipo', 'tipo', 'type']), 80);
  for (const k of Object.keys(specs) as (keyof Specs)[]) if (!specs[k]) delete specs[k];
  return { specs, maker, tipo };
}

async function fotoDe(lang: Lang, file: string): Promise<FotoExterna | undefined> {
  try {
    const d = await api(lang, { action: 'query', titles: `File:${file}`, prop: 'imageinfo', iiprop: 'url|extmetadata', iiurlwidth: '1200' }) as { query?: { pages?: { imageinfo?: ImageInfo[] }[] } };
    const ii = d.query?.pages?.[0]?.imageinfo?.[0]; if (!ii?.thumburl) return undefined;
    const meta = (k: string) => ii.extmetadata?.[k]?.value?.replace(/<[^>]+>/g, '').trim() || undefined;
    return { url: ii.thumburl.split('?')[0], author: corta(meta('Artist'), 60), license: meta('LicenseShortName'), licenseUrl: meta('LicenseUrl'), source: ii.descriptionurl ?? ii.url ?? '' };
  } catch { return undefined; }
}

/** Lee un artículo y devuelve una ficha, o null si no es un artículo de arma. */
export async function fichaDesdeWikipedia(lang: Lang, title: string): Promise<FichaExterna | null> {
  const d = await api(lang, {
    action: 'query', titles: title, redirects: '1', prop: 'revisions|pageimages|extracts|info', rvprop: 'content', rvslots: 'main',
    piprop: 'name', exintro: '1', explaintext: '1', inprop: 'url',
  }) as { query?: { pages?: Page[] } };
  const p = d.query?.pages?.[0]; if (!p || p.missing) return null;
  const wt = p.revisions?.[0]?.slots.main.content ?? '';
  const ib = infobox(wt); if (!ib) return null;
  const { specs, maker, tipo } = specsDe(ib);
  const name = plain(ib['nombre'] ?? ib['name'] ?? '') || p.title;
  const resumen = p.extract ? corta(p.extract.replace(/\s+/g, ' ').trim(), 700) : undefined;
  const photo = p.pageimage ? await fotoDe(lang, p.pageimage) : undefined;
  specs.fuente = `Wikipedia en ${lang === 'es' ? 'español' : 'inglés'} («${p.title}»)`;
  return {
    slug: wikiSlug(lang, p.title), origen: 'wikipedia', name, maker, tipo, specs, resumen, photo,
    fuente: { label: `Wikipedia (${lang}) · ${p.title}`, url: p.fullurl, license: 'CC BY-SA 4.0', licenseUrl: 'https://creativecommons.org/licenses/by-sa/4.0/' },
    generico: adivinarGenerico(tipo, specs.calibre), fetchedAt: new Date().toISOString(), revisado: false,
  };
}
