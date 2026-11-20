// Cascada de búsqueda: catálogo → fichas ya consultadas → Wikipedia. La IA (nivel 3) solo se dispara por acción del usuario.
import { getCatalogo } from '@/catalogo/datos';
import type { Arma } from '@/catalogo/tipos';
import { buscarWikipedia, type Candidato } from './wikipedia';
import { listFichas, type FichaExterna } from './store';

const norm = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

export interface Resultados { q: string; catalogo: Arma[]; guardadas: FichaExterna[]; wikipedia: Candidato[] }

export async function buscar(q: string): Promise<Resultados> {
  const nq = norm(q.trim());
  if (!nq) return { q, catalogo: [], guardadas: [], wikipedia: [] };
  const catalogo = (await getCatalogo()).armas.filter(a => norm(`${a.name} ${a.maker} ${a.variants.map(v => v.name).join(' ')}`).includes(nq));
  const [todas, wikipedia] = await Promise.all([listFichas(), buscarWikipedia(q)]);
  const guardadas = todas.filter(f => norm(`${f.name} ${f.maker ?? ''} ${f.slug}`).includes(nq));
  const yaGuardadas = new Set(guardadas.map(f => f.slug));
  return { q, catalogo, guardadas, wikipedia: wikipedia.filter(c => !yaGuardadas.has(c.slug)) };
}
