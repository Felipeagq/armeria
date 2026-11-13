// Materiales PBR con texturas procedurales generadas en canvas (sin descargas externas).
import * as THREE from 'three';

function rng(seed: number) { let s = seed >>> 0; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }

function finish(canvas: HTMLCanvasElement, repeat: [number, number], colorSpace: THREE.ColorSpace) {
  const t = new THREE.CanvasTexture(canvas);
  t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(repeat[0], repeat[1]);
  t.colorSpace = colorSpace; t.anisotropy = 4; return t;
}
/** Convierte un mapa de alturas (size×size, 0..1) en normal map tileable. */
function normalTexture(h: Float32Array, size: number, strength: number, repeat: [number, number]) {
  const c = document.createElement('canvas'); c.width = c.height = size;
  const ctx = c.getContext('2d')!; const img = ctx.createImageData(size, size);
  const at = (x: number, y: number) => h[((y + size) % size) * size + ((x + size) % size)];
  for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) {
    const dx = (at(x + 1, y) - at(x - 1, y)) * strength, dy = (at(x, y + 1) - at(x, y - 1)) * strength;
    const l = Math.hypot(dx, dy, 1), i = (y * size + x) * 4;
    img.data[i] = (-dx / l * 0.5 + 0.5) * 255; img.data[i + 1] = (dy / l * 0.5 + 0.5) * 255;
    img.data[i + 2] = (1 / l * 0.5 + 0.5) * 255; img.data[i + 3] = 255;
  }
  ctx.putImageData(img, 0, 0);
  return finish(c, repeat, THREE.NoColorSpace);
}
function grayTexture(h: Float32Array, size: number, lo: number, hi: number, repeat: [number, number]) {
  const c = document.createElement('canvas'); c.width = c.height = size;
  const ctx = c.getContext('2d')!; const img = ctx.createImageData(size, size);
  for (let i = 0; i < size * size; i++) { const v = (lo + (hi - lo) * h[i]) * 255; img.data[i * 4] = img.data[i * 4 + 1] = img.data[i * 4 + 2] = v; img.data[i * 4 + 3] = 255; }
  ctx.putImageData(img, 0, 0); return finish(c, repeat, THREE.NoColorSpace);
}
function valueNoise(size: number, cells: number, seed: number) {
  const r = rng(seed); const g = Array.from({ length: cells * cells }, r);
  const out = new Float32Array(size * size); const k = size / cells;
  const sm = (t: number) => t * t * (3 - 2 * t);
  const v = (i: number, j: number) => g[((j % cells) * cells) + (i % cells)];
  for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) {
    const gx = x / k, gy = y / k, x0 = Math.floor(gx), y0 = Math.floor(gy), fx = sm(gx - x0), fy = sm(gy - y0);
    const a = v(x0, y0) + (v(x0 + 1, y0) - v(x0, y0)) * fx;
    const b = v(x0, y0 + 1) + (v(x0 + 1, y0 + 1) - v(x0, y0 + 1)) * fx;
    out[y * size + x] = a + (b - a) * fy;
  }
  return out;
}

interface TextureSet {
  polyNormal: THREE.Texture; polyRough: THREE.Texture; aluRough: THREE.Texture;
  stipple: THREE.Texture; knurl: THREE.Texture; perf: THREE.Texture;
}
let TEX: TextureSet | null = null;
function textures(): TextureSet {
  if (TEX) return TEX;
  const S = 256;
  const n1 = valueNoise(S, 32, 7), n2 = valueNoise(S, 8, 11);
  const poly = n1.map((v, i) => v * 0.6 + n2[i] * 0.4);
  const r = rng(3); const brushRow = Array.from({ length: S }, r);
  const brush = new Float32Array(S * S).map((_, i) => brushRow[Math.floor(i / S)] * 0.7 + n1[i] * 0.3);
  // Punteado (stippling) de empuñaduras
  const st = new Float32Array(S * S); const rs = rng(21);
  for (let d = 0; d < 1400; d++) {
    const cx = rs() * S, cy = rs() * S, rad = 2 + rs() * 2.5;
    for (let y = -4; y <= 4; y++) for (let x = -4; x <= 4; x++) {
      const dd = Math.hypot(x, y) / rad; if (dd > 1) continue;
      const i = (((Math.floor(cy) + y + S) % S) * S) + ((Math.floor(cx) + x + S) % S);
      st[i] = Math.max(st[i], Math.cos(dd * Math.PI / 2));
    }
  }
  // Moleteado en diamante
  const kn = new Float32Array(S * S); const f = 16;
  for (let y = 0; y < S; y++) for (let x = 0; x < S; x++) {
    const a = Math.abs(((x + y) / S * f) % 1 - 0.5), b = Math.abs(((x - y + S) / S * f) % 1 - 0.5);
    kn[y * S + x] = Math.min(a, b) * 2;
  }
  // Perforaciones de supresor (mapa de color multiplicativo)
  const c = document.createElement('canvas'); c.width = 256; c.height = 128; const x = c.getContext('2d')!;
  x.fillStyle = '#fff'; x.fillRect(0, 0, 256, 128); x.fillStyle = '#0c0c0d';
  for (let row = 0; row < 4; row++) for (let col = 0; col < 8; col++) { x.beginPath(); x.arc(16 + col * 32 + (row % 2) * 16, 16 + row * 32, 9, 0, Math.PI * 2); x.fill(); }
  TEX = {
    polyNormal: normalTexture(n1, S, 1.2, [3, 3]),
    polyRough: grayTexture(poly, S, 0.7, 0.9, [2, 2]),
    aluRough: grayTexture(brush, S, 0.38, 0.55, [1, 4]),
    stipple: normalTexture(st, S, 3.2, [6, 6]),
    knurl: normalTexture(kn, S, 4, [6, 2]),
    perf: finish(c, [2, 6], THREE.SRGBColorSpace),
  };
  return TEX;
}

/** Marca un material como fijo: no se tiñe ni se resalta al seleccionar. */
const fixed = <M extends THREE.Material>(m: M): M => { m.userData.fixed = true; return m; };
export function glowMat(c: THREE.ColorRepresentation, i: number) {
  return fixed(new THREE.MeshStandardMaterial({ color: c, emissive: c, emissiveIntensity: i, toneMapped: false }));
}

type C = THREE.ColorRepresentation;
const std = (o: THREE.MeshStandardMaterialParameters) => new THREE.MeshStandardMaterial(o);
const phys = (o: THREE.MeshPhysicalMaterialParameters) => new THREE.MeshPhysicalMaterial(o);

/**
 * Fábricas de materiales. `color` tiñe los acabados del cuerpo (polímero, aluminio,
 * agarre, translúcido); el resto son acabados fijos. Se crean bajo demanda: cada pieza
 * solo instancia los materiales que usa.
 */
const FACTORIES = {
  body: (color: C) => std({ color, roughness: 1, roughnessMap: textures().polyRough, metalness: 0.04, normalMap: textures().polyNormal, normalScale: new THREE.Vector2(0.12, 0.12) }),
  alu: (color: C) => phys({ color, roughness: 1, roughnessMap: textures().aluRough, metalness: 0.5, clearcoat: 0.35, clearcoatRoughness: 0.45 }),
  grip: (color: C) => std({ color, roughness: 0.88, metalness: 0.02, normalMap: textures().stipple, normalScale: new THREE.Vector2(0.9, 0.9) }),
  perf: (color: C) => std({ color, map: textures().perf, roughness: 0.5, metalness: 0.45 }),
  clear: (color: C) => std({ color, roughness: 0.25, metalness: 0, transparent: true, opacity: 0.72 }),
  dark: () => std({ color: '#1c1d20', roughness: 1, roughnessMap: textures().polyRough, metalness: 0.05, normalMap: textures().polyNormal, normalScale: new THREE.Vector2(0.1, 0.1) }),
  rail: () => std({ color: '#232529', roughness: 1, roughnessMap: textures().aluRough, metalness: 0.6 }),
  steel: () => std({ color: '#5a5e65', roughness: 0.28, metalness: 0.95 }),
  blued: () => phys({ color: '#26282c', roughness: 0.42, metalness: 0.8, clearcoat: 0.25, clearcoatRoughness: 0.5 }),
  slide: () => std({ color: '#2a2c30', roughness: 0.38, metalness: 0.7 }),
  knurl: () => std({ color: '#26282c', roughness: 0.42, metalness: 0.7, normalMap: textures().knurl, normalScale: new THREE.Vector2(1, 1) }),
  rubber: () => std({ color: '#141516', roughness: 0.95, metalness: 0, normalMap: textures().stipple, normalScale: new THREE.Vector2(0.35, 0.35) }),
  hole: () => fixed(std({ color: '#060607', roughness: 1, metalness: 0 })),
  paint: () => fixed(std({ color: '#d9d6cc', roughness: 0.8, metalness: 0 })),
  glass: () => fixed(std({ color: '#5b8ccc', roughness: 0.04, metalness: 0.9, transparent: true, opacity: 0.45, side: THREE.DoubleSide, depthWrite: false, envMapIntensity: 2 })),
  red: () => glowMat('#ff2a2a', 3),
  green: () => glowMat('#4dff7a', 2.4),
  white: () => glowMat('#fff1cf', 1.1),
} satisfies Record<string, (color: C) => THREE.Material>;

export type MatKey = keyof typeof FACTORIES;
/**
 * Los acabados oscuros (negro, gris lobo…) se oscurecen un poco más: un arma negra real casi no devuelve
 * albedo, lo que se ve son los brillos de los reflejos. Los colores claros (tierra, ártico…) no se tocan.
 */
const realisticTint = (color: C): THREE.Color => {
  const c = new THREE.Color(color);
  return c.getHSL({ h: 0, s: 0, l: 0 }).l < 0.25 ? c.multiplyScalar(0.6) : c;
};
export const createMat = (key: MatKey, color: C): THREE.Material => FACTORIES[key](realisticTint(color));
