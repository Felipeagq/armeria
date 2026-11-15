// Limpieza de wikitexto y lectura de la infobox de un artículo de arma.
// Solo cubre lo que necesitan las fichas: convierte plantillas habituales a texto plano y descarta el resto.

/** Separa los parámetros de una plantilla respetando {{…}}, [[…]] y <…> anidados. */
function splitTop(body: string, sep = '|'): string[] {
  const out: string[] = []; let depth = 0, cur = '';
  for (let i = 0; i < body.length; i++) {
    const two = body.slice(i, i + 2);
    if (two === '{{' || two === '[[') { depth++; cur += two; i++; continue; }
    if (two === '}}' || two === ']]') { depth--; cur += two; i++; continue; }
    if (body[i] === sep && depth === 0) { out.push(cur); cur = ''; continue; }
    cur += body[i];
  }
  out.push(cur);
  return out;
}

const LIST_TPL = /^(plainlist|plain list|ubl|unbulleted list|bulleted list|flatlist|hlist|lista sin viñetas|lista)$/i;
// Plantillas de bandera: unas pintan solo el icono (se descartan) y otras icono + nombre del país (se conserva el nombre)
const FLAG_ICON_TPL = /^(bandera|flagicon|flagdeco|flagicon image)$/i;
const FLAG_TPL = /^(bandera2|flag|flagcountry|flagu|país|pais)$/i;
const PASS_TPL = /^(nowrap|small|abbr|lang|lang-[a-z-]+|nobr|nbsp|esd)$/i;

/** Sustituye una plantilla (sin las llaves) por su texto, o por '' si no aporta datos. */
function template(inner: string): string {
  const parts = splitTop(inner).map(s => s.trim());
  const name = parts[0].toLowerCase().replace(/_/g, ' ');
  const pos = parts.slice(1).filter(p => !/^[\w áéíóúñ-]+=/.test(p));
  if (name === 'convert' || name === 'cvt' || name === 'conversión' || name === 'unidad') {
    const [a, u, b, u2] = pos;
    if (a && u && /^(-|–|to|a|by|x|×)$/.test(u) && b && u2) return `${a}–${b} ${u2}`;
    return a && u ? `${a} ${u}` : a ?? '';
  }
  if (LIST_TPL.test(name)) {
    const items = pos.flatMap(p => p.split(/\n\s*\*\s*/)).map(s => s.trim()).filter(Boolean);
    return items.join(' · ');
  }
  if (FLAG_ICON_TPL.test(name)) return '';
  if (FLAG_TPL.test(name)) return pos[0] ?? '';
  if (PASS_TPL.test(name)) return pos[0] ?? '';
  if (/^(cite|cita|citation|harv|sfn|refn|efn|nota)/.test(name)) return '';
  return '';
}

/** Wikitexto → texto plano para una celda de la ficha. */
export function plain(wt: string): string {
  let s = wt.replace(/<!--[\s\S]*?-->/g, '');
  s = s.replace(/<ref[^>/]*\/>/gi, '').replace(/<ref[^>]*>[\s\S]*?<\/ref>/gi, '');
  // Plantillas, de dentro hacia fuera
  for (let n = 0; n < 12 && s.includes('{{'); n++) s = s.replace(/\{\{([^{}]*)\}\}/g, (_, inner) => template(inner));
  s = s.replace(/\[\[(?:[^\]|]*\|)?([^\]]*)\]\]/g, '$1').replace(/\[https?:[^\s\]]*\s*([^\]]*)\]/g, '$1');
  s = s.replace(/<br\s*\/?>/gi, ' · ').replace(/<\/li>/gi, ' · ').replace(/<\/?(ul|ol|li|p|div|span|b|i|sup|sub|small|abbr)[^>]*>/gi, ' ');
  s = s.replace(/<[^>]+>/g, '').replace(/&nbsp;|&#160;/g, ' ').replace(/&amp;/g, '&');
  s = s.replace(/'{2,}/g, '');
  s = s.split('\n').map(l => l.replace(/^\s*[*#:;]+\s*/, '')).filter(l => l.trim()).join(' · ');
  s = s.replace(/\s+/g, ' ').replace(/(\s*·\s*)+/g, ' · ').replace(/^\s*·\s*|\s*·\s*$/g, '').trim();
  return s;
}

/** Devuelve los parámetros de la primera infobox de arma del artículo, o null si no hay. */
export function infobox(wikitext: string): Record<string, string> | null {
  const m = /\{\{\s*(Infobox weapon|Infobox firearm|Ficha de arma|Ficha de arma de fuego)\b/i.exec(wikitext);
  if (!m) return null;
  // Cuerpo con llaves balanceadas
  let depth = 0, end = -1;
  for (let i = m.index; i < wikitext.length - 1; i++) {
    const two = wikitext.slice(i, i + 2);
    if (two === '{{') { depth++; i++; } else if (two === '}}') { depth--; i++; if (depth === 0) { end = i + 1; break; } }
  }
  if (end < 0) return null;
  const body = wikitext.slice(m.index + 2, end - 2).replace(/<!--[\s\S]*?-->/g, '');
  const out: Record<string, string> = {};
  for (const part of splitTop(body).slice(1)) {
    const eq = part.indexOf('='); if (eq < 0) continue;
    const k = part.slice(0, eq).trim().toLowerCase().replace(/[\s_]+/g, ' ');
    const v = plain(part.slice(eq + 1));
    if (v) out[k] = v;
  }
  return out;
}
