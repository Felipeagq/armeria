// Nivel 3 de la cascada: un modelo con búsqueda web rellena el esquema de la ficha y cita sus fuentes.
// Solo se ejecuta desde una acción explícita del usuario (POST), con límite de peticiones, y el resultado se
// guarda en el almacén marcado como «sin verificar». Se activa con ANTHROPIC_API_KEY (o ARMAS_IA=1 si la
// credencial llega por otra vía, p. ej. perfil de `ant auth login`); ARMAS_IA=0 lo desactiva.
import Anthropic from '@anthropic-ai/sdk';
import { z } from 'zod';
import type { Specs } from '@/three/types';
import { adivinarGenerico, slugify, type FichaExterna } from './store';

export const iaDisponible = () => process.env.ARMAS_IA !== '0' && (process.env.ARMAS_IA === '1' || !!process.env.ANTHROPIC_API_KEY);
export const iaSlug = (q: string) => `ia-${slugify(q)}`;

/* ── Límite de uso: por IP y global diario (en memoria; por instancia) ── */
const porIp = new Map<string, number[]>();
let dia = ''; let usosDia = 0;
const MAX_IP_HORA = Number(process.env.ARMAS_IA_MAX_IP_HORA ?? 5);
const MAX_DIA = Number(process.env.ARMAS_IA_MAX_DIA ?? 40);
export function permitir(ip: string): { ok: true } | { ok: false; motivo: string } {
  const hoy = new Date().toISOString().slice(0, 10);
  if (dia !== hoy) { dia = hoy; usosDia = 0; }
  if (usosDia >= MAX_DIA) return { ok: false, motivo: 'Se alcanzó el límite diario de consultas con IA. Vuelve mañana.' };
  const ahora = Date.now(); const recientes = (porIp.get(ip) ?? []).filter(t => ahora - t < 3_600_000);
  if (recientes.length >= MAX_IP_HORA) return { ok: false, motivo: `Máximo ${MAX_IP_HORA} consultas con IA por hora.` };
  recientes.push(ahora); porIp.set(ip, recientes); usosDia++;
  return { ok: true };
}

/* ── Esquema de salida (herramienta estricta) ── */
const Ficha = z.object({
  encontrada: z.boolean(),
  name: z.string(), maker: z.string(), tipo: z.string(),
  categoria: z.enum(['pistol', 'rifle', 'smg']),
  calibre: z.string(), peso: z.string(), cañon: z.string(), sistema: z.string(), cadencia: z.string(),
  velocidad: z.string(), alcance: z.string(), cargador: z.string(), airsoft: z.string(), extra: z.string(),
  resumen: z.string(),
  fuentes: z.array(z.string()),
  confianza: z.enum(['alta', 'media', 'baja']),
});
type FichaIA = z.infer<typeof Ficha>;
const campo = { type: 'string' as const };
const TOOL = {
  name: 'guardar_ficha',
  description: 'Guarda la ficha técnica final del arma. Llamar exactamente una vez, al terminar la investigación.',
  strict: true,
  input_schema: {
    type: 'object' as const,
    additionalProperties: false,
    required: ['encontrada', 'name', 'maker', 'tipo', 'categoria', 'calibre', 'peso', 'cañon', 'sistema', 'cadencia', 'velocidad', 'alcance', 'cargador', 'airsoft', 'extra', 'resumen', 'fuentes', 'confianza'],
    properties: {
      encontrada: { type: 'boolean', description: 'false si no existe un arma real identificable con ese nombre' },
      name: campo, maker: { ...campo, description: 'Fabricante · País' }, tipo: { ...campo, description: 'p. ej. Pistola semiautomática' },
      categoria: { type: 'string', enum: ['pistol', 'rifle', 'smg'] },
      calibre: campo, peso: campo, cañon: campo, sistema: campo, cadencia: campo, velocidad: campo, alcance: campo, cargador: campo,
      airsoft: { ...campo, description: 'Réplicas de airsoft conocidas (marca, tipo GBB/AEG) o "" si no constan' },
      extra: { ...campo, description: 'Notas breves (longitud total, acabados, variantes)' },
      resumen: { ...campo, description: 'Dos o tres frases en español sobre el arma' },
      fuentes: { type: 'array', items: { type: 'string' }, description: 'URLs consultadas (2–6)' },
      confianza: { type: 'string', enum: ['alta', 'media', 'baja'] },
    },
  },
};

const SYSTEM = `Eres el documentalista de Armería 3D, una enciclopedia en español de armas reales y de sus réplicas de airsoft.
Recibes el nombre de un arma que no está en el catálogo. Investiga con la búsqueda web (fabricante, Wikipedia, prensa especializada,
tiendas de airsoft) y rellena la ficha llamando a la herramienta guardar_ficha una sola vez al final.
Reglas:
- Escribe en español, con unidades métricas y formato español (coma decimal, «×» en calibres: 9×19 mm Parabellum, 5,56×45 mm NATO).
- Deja en "" cualquier dato que no encuentres; no inventes ni estimes. Marca con «≈» los valores aproximados.
- Si el nombre no corresponde a un arma real identificable, devuelve encontrada=false.
- fuentes: solo URLs que hayas abierto o visto en los resultados.`;

const client = new Anthropic();

/** Genera una ficha. Lanza si falla la API; devuelve null si el modelo no identifica el arma. */
export async function generarFicha(q: string): Promise<FichaExterna | null> {
  const consulta = q.trim().slice(0, 80);
  const messages: Anthropic.Beta.BetaMessageParam[] = [{ role: 'user', content: `Arma a documentar: «${consulta}»` }];
  let datos: FichaIA | null = null;
  for (let vuelta = 0; vuelta < 6 && !datos; vuelta++) {
    const res = await client.beta.messages.create({
      model: 'claude-opus-5-5',
      max_tokens: 8000,
      output_config: { effort: 'medium' },
      betas: ['server-side-fallback-2026-07-01'],
      fallbacks: 'default',
      system: SYSTEM,
      tools: [{ type: 'web_search_20260209', name: 'web_search', max_uses: 8 }, TOOL],
      messages,
    });
    if (res.stop_reason === 'refusal') throw new Error('El modelo rechazó la consulta');
    for (const b of res.content) {
      if (b.type === 'tool_use' && b.name === 'guardar_ficha') {
        const parsed = Ficha.safeParse(b.input);
        if (parsed.success) datos = parsed.data;
      }
    }
    if (datos) break;
    if (res.stop_reason === 'pause_turn') { messages.push({ role: 'assistant', content: res.content }); continue; }
    if (res.stop_reason === 'tool_use') {
      // Llamada a la herramienta con datos inválidos: se devuelve el error y se pide repetir
      messages.push({ role: 'assistant', content: res.content });
      messages.push({ role: 'user', content: res.content.filter(b => b.type === 'tool_use').map(b => ({ type: 'tool_result' as const, tool_use_id: b.id, is_error: true, content: 'Datos no válidos: repite la llamada respetando el esquema.' })) });
      continue;
    }
    // end_turn sin herramienta: pedir explícitamente la llamada
    messages.push({ role: 'assistant', content: res.content });
    messages.push({ role: 'user', content: 'Llama ahora a guardar_ficha con lo que hayas encontrado (encontrada=false si no es un arma identificable).' });
  }
  if (!datos || !datos.encontrada) return null;
  const specs: Specs = {};
  for (const k of ['calibre', 'peso', 'cañon', 'sistema', 'cadencia', 'velocidad', 'alcance', 'cargador', 'airsoft', 'extra'] as const) {
    const v = datos[k].trim(); if (v) specs[k] = v;
  }
  const fuentes = datos.fuentes.filter(u => /^https?:\/\//.test(u)).slice(0, 8);
  specs.fuente = fuentes.length ? `Búsqueda web asistida por IA (${fuentes.length} fuentes)` : 'Búsqueda web asistida por IA';
  return {
    slug: iaSlug(consulta), origen: 'ia', name: datos.name.trim() || consulta, maker: datos.maker.trim() || undefined, tipo: datos.tipo.trim() || undefined,
    specs, resumen: datos.resumen.trim() || undefined,
    fuente: { label: 'Ficha generada con IA a partir de búsqueda web · sin verificar' }, fuentes, confianza: datos.confianza,
    generico: datos.categoria ?? adivinarGenerico(datos.tipo, datos.calibre),
    fetchedAt: new Date().toISOString(), revisado: false,
  };
}
