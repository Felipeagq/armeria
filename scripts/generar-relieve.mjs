// Genera public/bg/relieve.svg: el fondo de curvas de nivel del sitio (ruido fractal + marching squares, semilla fija). Sin imágenes ni fuentes externas.
// Uso: node scripts/generar-relieve.mjs   (cambia la semilla o NIV para otro relieve)
import { writeFileSync } from 'node:fs';
const N = 130, W = 1600;                      // celdas por lado y tamaño del lienzo
let s = 20251120; const rnd = () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296);
const lattices = [4, 8, 16, 32].map(n => Array.from({ length: (n + 1) * (n + 1) }, rnd));
const sm = t => t * t * (3 - 2 * t);
const vn = (o, x, y) => { const n = [4, 8, 16, 32][o], g = lattices[o]; const fx = x * n, fy = y * n, ix = Math.floor(fx), iy = Math.floor(fy), tx = sm(fx - ix), ty = sm(fy - iy); const a = g[iy * (n + 1) + ix], b = g[iy * (n + 1) + ix + 1], c = g[(iy + 1) * (n + 1) + ix], d = g[(iy + 1) * (n + 1) + ix + 1]; return a + (b - a) * tx + (c - a) * ty + (a - b - c + d) * tx * ty; };
const f = (x, y) => vn(0, x, y) * .55 + vn(1, x, y) * .28 + vn(2, x, y) * .13 + vn(3, x, y) * .04;
const H = []; let lo = 1, hi = 0;
for (let j = 0; j <= N; j++) for (let i = 0; i <= N; i++) { const v = f(Math.min(i / N, .9999), Math.min(j / N, .9999)); H[j * (N + 1) + i] = v; lo = Math.min(lo, v); hi = Math.max(hi, v); }
const at = (i, j) => H[j * (N + 1) + i];
const NIV = 26;
const out = { normal: [], indice: [] };
for (let k = 1; k < NIV; k++) {
  const L = lo + (hi - lo) * k / NIV;
  const pts = new Map(), adj = new Map();     // id de arista → punto; id → vecinos
  const punto = (id, x, y) => { if (!pts.has(id)) pts.set(id, [x, y]); return id; };
  const cruce = (i, j, di, dj) => { // arista entre (i,j) y (i+di,j+dj)
    const a = at(i, j), b = at(i + di, j + dj), t = (L - a) / (b - a);
    return punto(`${i},${j},${di}${dj}`, (i + di * t) * W / N, (j + dj * t) * W / N);
  };
  const unir = (a, b) => { (adj.get(a) ?? adj.set(a, []).get(a)).push(b); (adj.get(b) ?? adj.set(b, []).get(b)).push(a); };
  for (let j = 0; j < N; j++) for (let i = 0; i < N; i++) {
    const c = (at(i, j) > L ? 8 : 0) | (at(i + 1, j) > L ? 4 : 0) | (at(i + 1, j + 1) > L ? 2 : 0) | (at(i, j + 1) > L ? 1 : 0);
    if (c === 0 || c === 15) continue;
    const T = () => cruce(i, j, 1, 0), R = () => cruce(i + 1, j, 0, 1), B = () => cruce(i, j + 1, 1, 0), Lf = () => cruce(i, j, 0, 1);
    switch (c) { case 1: case 14: unir(Lf(), B()); break; case 2: case 13: unir(B(), R()); break; case 3: case 12: unir(Lf(), R()); break; case 4: case 11: unir(T(), R()); break;
      case 5: unir(T(), Lf()); unir(B(), R()); break; case 6: case 9: unir(T(), B()); break; case 7: case 8: unir(T(), Lf()); break; case 10: unir(T(), R()); unir(Lf(), B()); break; }
  }
  const visto = new Set(); let d = '';
  const camino = ini => { const r = [ini]; visto.add(ini); let cur = ini; for (;;) { const n = (adj.get(cur) ?? []).find(x => !visto.has(x)); if (!n) break; visto.add(n); r.push(n); cur = n; } return r; };
  for (const [id, vs] of adj) { if (visto.has(id) || vs.length !== 1) continue; d += trazo(camino(id)); }   // abiertas (empiezan en un borde)
  for (const id of adj.keys()) if (!visto.has(id)) d += trazo(camino(id)) ;                                   // cerradas
  function trazo(ids) { if (ids.length < 4) return ''; const P = ids.map(x => pts.get(x)); let t = `M${Math.round(P[0][0])} ${Math.round(P[0][1])}`; let px = Math.round(P[0][0]), py = Math.round(P[0][1]); for (let q = 1; q < P.length; q += 2) { const x = Math.round(P[q][0]), y = Math.round(P[q][1]); t += `l${x - px} ${y - py}`; px = x; py = y; } return t; }
  (k % 5 === 0 ? out.indice : out.normal).push(d);
}
const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${W}" preserveAspectRatio="xMidYMid slice">
<!-- Curvas de nivel generadas por programa (ruido fractal + marching squares, semilla ${20251120}); sin imágenes ni fuentes externas. -->
<g fill="none" stroke="#b9cdb4" stroke-linejoin="round" stroke-linecap="round">
<path stroke-width="1" stroke-opacity=".085" d="${out.normal.join('')}"/>
<path stroke-width="1.6" stroke-opacity=".16" d="${out.indice.join('')}"/>
</g></svg>`;
writeFileSync('public/bg/relieve.svg', svg);
console.log('bytes', svg.length);
