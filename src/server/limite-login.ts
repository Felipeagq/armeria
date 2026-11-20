/**
 * Freno a los intentos fallidos de inicio de sesión.
 * En memoria y por instancia: en Amplify cada instancia lleva su cuenta, así que es un freno razonable,
 * no un cortafuegos. Por eso hay dos topes: por IP y global (por si el atacante rota de IP).
 * Un acierto limpia la cuenta de esa IP. Con el tope superado no se llega a comparar la contraseña.
 */

const VENTANA_MS = 15 * 60_000;
const MAX_POR_IP = 5;
const MAX_GLOBAL = 40;

const porIp = new Map<string, number[]>();
let global: number[] = [];

const reciente = (t: number, ahora: number) => ahora - t < VENTANA_MS;

function podar(ahora: number) {
  global = global.filter(t => reciente(t, ahora));
  if (porIp.size > 500) for (const [ip, ts] of porIp) if (!ts.some(t => reciente(t, ahora))) porIp.delete(ip);
}

/** IP del visitante. CloudFront añade la IP real al FINAL de x-forwarded-for; lo anterior lo puede falsear el cliente. */
export function ipDe(h: Headers): string {
  const partes = (h.get('x-forwarded-for') ?? '').split(',').map(s => s.trim()).filter(Boolean);
  return partes.at(-1) ?? 'local';
}

export function bloqueado(ip: string): { bloqueado: true; minutos: number } | { bloqueado: false } {
  const ahora = Date.now();
  podar(ahora);
  const propios = (porIp.get(ip) ?? []).filter(t => reciente(t, ahora));
  const tope = propios.length >= MAX_POR_IP ? propios : global.length >= MAX_GLOBAL ? global : null;
  if (!tope) return { bloqueado: false };
  return { bloqueado: true, minutos: Math.max(1, Math.ceil((tope[0] + VENTANA_MS - ahora) / 60_000)) };
}

export function registrarFallo(ip: string) {
  const ahora = Date.now();
  porIp.set(ip, [...(porIp.get(ip) ?? []).filter(t => reciente(t, ahora)), ahora]);
  global.push(ahora);
}

export function limpiar(ip: string) {
  porIp.delete(ip);
}
