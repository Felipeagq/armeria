// Fábricas de geometría con caché. Las geometrías se comparten entre builds y no se
// liberan (son pocas y pequeñas); los materiales sí se liberan en cada reconstrucción.
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
import { toCreasedNormals } from 'three/examples/jsm/utils/BufferGeometryUtils.js';

type Pt = [number, number];
type Drawable = THREE.Shape | THREE.Path;

const GEO = new Map<string, THREE.BufferGeometry>();
export const cached = <T extends THREE.BufferGeometry>(k: string, f: () => T): T => {
  if (!GEO.has(k)) GEO.set(k, f());
  return GEO.get(k) as T;
};

/**
 * Normales suavizadas con ángulo de pliegue: curvas y biseles se ven lisos y las aristas
 * reales siguen nítidas. Se escala ×10 durante el cálculo porque toCreasedNormals agrupa
 * vértices con precisión de 0,01 unidades.
 */
export function crease(g: THREE.BufferGeometry, angle = 0.6): THREE.BufferGeometry {
  g.scale(10, 10, 10);
  const r = toCreasedNormals(g, angle);
  r.scale(0.1, 0.1, 0.1);
  if (r !== g) g.dispose();
  return r;
}

/** Caja con aristas redondeadas. */
export const box = (w: number, h: number, d: number, r = 0.02, seg = 4) => cached(`b${w},${h},${d},${r},${seg}`, () => {
  const rr = Math.max(0.001, Math.min(r, w / 2 - 0.001, h / 2 - 0.001, d / 2 - 0.001));
  return new RoundedBoxGeometry(w, h, d, seg, rr);
});

/** Cilindro a lo largo de X. r = radio trasero, r2 = radio delantero (+X). */
export const cylX = (r: number, len: number, r2 = r, seg = 56) => cached(`cx${r},${len},${r2},${seg}`, () => {
  const g = new THREE.CylinderGeometry(r2, r, len, seg); g.rotateZ(-Math.PI / 2); return g;
});
export const cylY = (r: number, len: number, r2 = r, seg = 48) => cached(`cy${r},${len},${r2},${seg}`, () => new THREE.CylinderGeometry(r2, r, len, seg));
export const cylZ = (r: number, len: number, seg = 56) => cached(`cz${r},${len},${seg}`, () => {
  const g = new THREE.CylinderGeometry(r, r, len, seg); g.rotateX(Math.PI / 2); return g;
});
export const sphere = (r: number) => cached(`s${r}`, () => new THREE.SphereGeometry(r, 20, 14));
export const plane = (w: number, h: number) => cached(`p${w},${h}`, () => new THREE.PlaneGeometry(w, h));
export const torus = (r: number, t: number, seg = 40) => cached(`t${r},${t},${seg}`, () => new THREE.TorusGeometry(r, t, 10, seg));
export const disc = (r: number, seg = 40) => cached(`d${r}`, () => { const g = new THREE.CircleGeometry(r, seg); g.rotateY(Math.PI / 2); return g; });

/** Sólido de revolución alrededor del eje X. profile: [[radio, x], ...] de atrás hacia delante. */
export const lathe = (key: string, profile: Pt[], seg = 72) => cached('l' + key, () => {
  const g = new THREE.LatheGeometry(profile.map(([r, x]) => new THREE.Vector2(Math.max(r, 0.0001), x)), seg);
  g.rotateZ(-Math.PI / 2);
  return crease(g, 0.7);
});

/** Extrusión de un perfil lateral (plano XY) con espesor centrado en Z. */
export const ext = (key: string, draw: (s: THREE.Shape) => void, depth: number, bevel = 0.018, segs = 5) => cached('e' + key, () => {
  const s = new THREE.Shape(); draw(s);
  const g = new THREE.ExtrudeGeometry(s, { depth, bevelEnabled: bevel > 0, bevelThickness: bevel, bevelSize: bevel, bevelSegments: segs, curveSegments: 40 });
  g.translate(0, 0, -depth / 2);
  return crease(g);
});

/** Extrusión de una sección transversal (plano ZY) a lo largo de X, centrada. */
export const extX = (key: string, draw: (s: THREE.Shape) => void, length: number, bevel = 0.02) => cached('x' + key, () => {
  const s = new THREE.Shape(); draw(s);
  const g = new THREE.ExtrudeGeometry(s, { depth: length, bevelEnabled: bevel > 0, bevelThickness: bevel, bevelSize: bevel, bevelSegments: 5, curveSegments: 28 });
  g.rotateY(Math.PI / 2);
  g.translate(-length / 2, 0, 0);
  return crease(g);
});

/** Dibuja un polígono (con agujeros opcionales) en un Shape. */
export const poly = (pts: Pt[], holes: Pt[][] = []) => (s: THREE.Shape) => {
  s.moveTo(...pts[0]); for (const p of pts.slice(1)) s.lineTo(...p); s.closePath();
  for (const h of holes) {
    const p = new THREE.Path(); p.moveTo(...h[0]); for (const q of h.slice(1)) p.lineTo(...q); p.closePath(); s.holes.push(p);
  }
};

/** Rectángulo redondeado centrado (para secciones). */
export function roundRect(s: Drawable, w: number, h: number, r: number, cx = 0, cy = 0) {
  const x = cx - w / 2, y = cy - h / 2;
  s.moveTo(x + r, y); s.lineTo(x + w - r, y); s.quadraticCurveTo(x + w, y, x + w, y + r);
  s.lineTo(x + w, y + h - r); s.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  s.lineTo(x + r, y + h); s.quadraticCurveTo(x, y + h, x, y + h - r);
  s.lineTo(x, y + r); s.quadraticCurveTo(x, y, x + r, y);
}

/** Octógono con chaflanes (sección de guardamanos). */
export function chamferRect(s: Drawable, w: number, h: number, c: number) {
  const x = w / 2, y = h / 2;
  s.moveTo(-x + c, -y); s.lineTo(x - c, -y); s.lineTo(x, -y + c); s.lineTo(x, y - c);
  s.lineTo(x - c, y); s.lineTo(-x + c, y); s.lineTo(-x, y - c); s.lineTo(-x, -y + c); s.closePath();
}

/** Ranura tipo cápsula (M-LOK) como geometría delgada. */
export const slot = (w: number, h: number, t = 0.012) => cached(`slot${w},${h},${t}`, () => {
  const s = new THREE.Shape(); roundRect(s, w, h, h / 2 - 0.001);
  const g = new THREE.ExtrudeGeometry(s, { depth: t, bevelEnabled: false, curveSegments: 12 });
  g.translate(0, 0, -t / 2); return crease(g);
});
