// Catálogo de piezas genéricas. Convenciones de origen por tipo (1 = 100 mm):
//   optic → base sobre el riel (+Y) · muzzle → rosca (+X) · under → cara del riel (−Y)
//   side → cara del riel (+Z) · mag → boca (−Y) · stock → unión (−X) · grip → unión (−Y)
import * as THREE from 'three';
import type { Builder } from '../core/builder';
import type { MatKey } from '../core/materials';
import { box, cylX, cylY, cylZ, sphere, plane, torus, disc, lathe, ext, extX, poly, roundRect } from '../core/geometry';
import type { Part } from '../types';
// Catálogo de piezas procedurales. Convenciones de origen por tipo (unidades: 1 = 100 mm):
//   optic  → centro de la base, sobre el riel; crece hacia +Y
//   muzzle → centro trasero (rosca); crece hacia +X
//   under  → centro superior (cara del riel); crece hacia -Y
//   side   → centro de la cara del riel; crece hacia +Z
//   mag    → centro de la boca del cargador; crece hacia -Y
//   stock  → unión con el tubo/receptor; crece hacia -X
//   grip   → unión con el receptor; crece hacia -Y

const LONG = ['long'];

/* ── Formas compartidas ───────────────────────────────────────────── */
const rmagShape = (s: THREE.Shape) => { s.moveTo(-.27, 0); s.lineTo(.27, 0); s.quadraticCurveTo(.31, -.7, .52, -1.32); s.lineTo(0, -1.4); s.quadraticCurveTo(-.17, -.75, -.27, 0); };
const smagShape = (s: THREE.Shape) => { s.moveTo(-.16, 0); s.lineTo(.16, 0); s.quadraticCurveTo(.2, -.6, .42, -1.08); s.lineTo(.13, -1.14); s.quadraticCurveTo(-.06, -.6, -.16, 0); };
/** Posición aproximada sobre la línea media curva del cargador de carabina. */
const rmagMid = (y: number) => .26 * Math.pow(-y / 1.36, 1.6);

function clamp(b: Builder, w = .44) {
  b.add(ext('clamp' + w, poly([[-w / 2, 0], [w / 2, 0], [w / 2 - .02, -.1], [w / 2 - .1, -.16], [-w / 2 + .1, -.16], [-w / 2 + .02, -.1]]), .22, .015), 'alu');
  b.add(cylZ(.045, .06), 'knurl', 0, -.08, .15);
}
function ribsAlongCurve(b: Builder, mid: (y: number) => number, n: number, from: number, gap: number, depth: number, mat: MatKey, w = .42) {
  for (let i = 0; i < n; i++) { const y = from - i * gap; b.add(box(w, .022, depth, .006), mat, mid(y), y, 0, 0, 0, .08 + i * .06); }
}

export const PARTS: Part[] = [
  /* ── Ópticas ── */
  { id: 'opt_rds', name: 'Red dot abierto', type: 'optic', weight: 45, build(b) {
    b.add(ext('rdsbase', poly([[-.22, 0], [.22, 0], [.2, .07], [-.22, .09]]), .2, .015), 'alu');
    b.add(ext('rdsrear', poly([[-.22, .07], [-.02, .07], [-.02, .25], [-.1, .27], [-.22, .19]]), .2, .015), 'alu');
    for (const z of [.105, -.105]) b.add(ext('rdspost', poly([[.03, .07], [.17, .07], [.12, .32], [.05, .32]]), .025, .008), 'alu', 0, 0, z);
    b.add(box(.1, .035, .24, .015), 'alu', .085, .32, 0);
    b.add(plane(.19, .23), 'glass', .1, .2, 0, 0, Math.PI / 2, -.12);
    b.add(sphere(.012), 'red', -.03, .19, 0);
    b.add(box(.05, .03, .02, .008), 'dark', -.12, .14, .125);
    b.add(box(.05, .03, .02, .008), 'dark', -.12, .14, -.125);
  } },
  { id: 'opt_tube', name: 'Red dot tubular', type: 'optic', weight: 180, build(b) {
    b.add(ext('tubemount', poly([[-.22, 0], [.22, 0], [.2, .08], [.1, .1], [.08, .24], [-.08, .24], [-.1, .1], [-.2, .08]]), .2, .015), 'alu');
    b.add(cylZ(.05, .3), 'knurl', 0, .05, 0);
    b.add(lathe('tube', [[0, -.33], [.14, -.33], [.17, -.3], [.17, -.24], [.15, -.21], [.15, .21], [.17, .24], [.18, .33], [0, .33]]), 'alu', 0, .38, 0);
    b.add(disc(.15), 'glass', .332, .38, 0);
    b.add(disc(.14), 'glass', -.332, .38, 0);
    b.add(cylY(.065, .08), 'alu', 0, .55, 0); b.add(cylY(.07, .045), 'knurl', 0, .6, 0);
    const t = b.group(0, .38, .17, Math.PI / 2, 0, 0);
    b.add(cylY(.065, .08), 'alu', 0, .02, 0, 0, 0, 0, t); b.add(cylY(.07, .045), 'knurl', 0, .065, 0, 0, 0, 0, t);
  } },
  { id: 'opt_holo', name: 'Visor holográfico', type: 'optic', fits: LONG, weight: 320, build(b) {
    b.add(box(.66, .09, .3, .025), 'alu', 0, .045, 0);
    b.add(box(.32, .3, .3, .05), 'alu', -.16, .24, 0);
    b.add(extX('holohood', s => { roundRect(s, .3, .32, .06); const h = new THREE.Path(); roundRect(h, .22, .24, .03); s.holes.push(h); }, .26, .015), 'alu', .17, .25, 0);
    b.add(plane(.24, .22), 'glass', .05, .25, 0, 0, Math.PI / 2, 0);
    b.add(torus(.03, .004), 'red', .06, .25, 0, 0, Math.PI / 2, 0);
    b.add(sphere(.006), 'red', .06, .25, 0);
    for (const z of [.05, -.05]) b.add(box(.05, .04, .06, .01), 'rubber', -.22, .4, z);
    b.add(cylZ(.05, .34), 'knurl', -.12, .05, 0);
  } },
  { id: 'opt_scope', name: 'Mira telescópica 1-4x', type: 'optic', fits: LONG, weight: 520, build(b) {
    for (const x of [-.3, .3]) {
      b.add(box(.13, .26, .22, .03), 'blued', x, .17, 0);
      b.add(extX('scopering', s => { s.absarc(0, 0, .165, 0, Math.PI * 2, false); const h = new THREE.Path(); h.absarc(0, 0, .121, 0, Math.PI * 2, true); s.holes.push(h); }, .1, .01), 'blued', x, .46, 0);
      b.add(cylZ(.04, .3), 'knurl', x, .07, 0);
    }
    b.add(lathe('scope', [[0, -.95], [.15, -.95], [.16, -.92], [.16, -.72], [.14, -.68], [.12, -.6], [.13, -.58], [.13, -.48], [.12, -.46], [.12, .55], [.17, .85], [.19, .88], [.19, 1.02], [.18, 1.04], [0, 1.04]], 64), 'alu', 0, .46, 0);
    b.add(cylX(.136, .1), 'knurl', -.53, .46, 0);
    b.add(box(.02, .03, .02, .005), 'white', -.53, .6, .02);
    b.add(disc(.14), 'glass', -.952, .46, 0);
    b.add(disc(.17), 'glass', 1.042, .46, 0);
    b.add(cylY(.07, .1), 'alu', 0, .62, 0); b.add(cylY(.08, .06), 'knurl', 0, .69, 0);
    const w = b.group(0, .46, .12, Math.PI / 2, 0, 0);
    b.add(cylY(.07, .1), 'alu', 0, .05, 0, 0, 0, 0, w); b.add(cylY(.08, .06), 'knurl', 0, .12, 0, 0, 0, 0, w);
  } },

  /* ── Bocachas ── */
  { id: 'mz_flash', name: 'Apagallamas', type: 'muzzle', weight: 55, build(b) {
    b.add(lathe('flash', [[0, 0], [.1, 0], [.1, .06], [.11, .08], [.11, .42], [.06, .42], [0, .42]]), 'blued');
    for (let k = 0; k < 6; k++) { const a = k * Math.PI / 3; b.add(box(.22, .012, .045, .006), 'hole', .28, Math.cos(a) * .106, Math.sin(a) * .106, a, 0, 0); }
    b.add(disc(.045), 'hole', .422, 0, 0);
  } },
  { id: 'mz_comp', name: 'Compensador', type: 'muzzle', weight: 90, build(b) {
    b.add(box(.46, .22, .22, .05), 'alu', .23, 0, 0);
    for (let i = 0; i < 3; i++) {
      b.add(box(.055, .012, .14, .006), 'hole', .12 + i * .12, .107, 0);
      for (const z of [.107, -.107]) b.add(box(.055, .11, .012, .006), 'hole', .12 + i * .12, 0, z);
    }
    b.add(disc(.045), 'hole', .462, 0, 0);
  } },
  { id: 'mz_sup_s', name: 'Supresor corto', type: 'muzzle', weight: 170, build(b) {
    b.add(lathe('supS', [[0, 0], [.12, 0], [.19, .04], [.19, .9], [.17, .95], [.07, .97], [0, .97]], 64), 'alu');
    b.add(cylX(.195, .12), 'knurl', .12, 0, 0);
    b.add(disc(.05), 'hole', .972, 0, 0);
  } },
  { id: 'mz_sup_l', name: 'Supresor largo perforado', type: 'muzzle', weight: 260, build(b) {
    b.add(lathe('supL', [[0, 0], [.14, 0], [.21, .05], [.21, 1.72], [.19, 1.78], [.08, 1.8], [0, 1.8]], 64), 'perf');
    b.add(cylX(.216, .2), 'knurl', .14, 0, 0);
    b.add(cylX(.216, .06), 'blued', 1.7, 0, 0);
    b.add(disc(.05), 'hole', 1.802, 0, 0);
  } },
  { id: 'mz_tracer', name: 'Unidad trazadora', type: 'muzzle', weight: 150, build(b) {
    b.add(lathe('tracer', [[0, 0], [.14, 0], [.2, .05], [.2, .82], [.18, .86], [0, .86]], 56), 'dark');
    b.add(cylX(.205, .26), 'knurl', .22, 0, 0);
    b.add(cylX(.21, .03), 'alu', .5, 0, 0);
    b.add(disc(.16), 'green', .862, 0, 0);
    b.add(disc(.07), 'hole', .864, 0, 0);
  } },

  /* ── Riel inferior ── */
  { id: 'ul_light', name: 'Linterna táctica', type: 'under', weight: 110, build(b) {
    clamp(b);
    b.add(lathe('light', [[0, -.36], [.1, -.36], [.12, -.34], [.12, .12], [.13, .16], [.17, .3], [.17, .42], [.16, .44], [0, .44]]), 'alu', 0, -.28, 0);
    b.add(cylX(.124, .2), 'knurl', -.12, -.28, 0);
    b.add(disc(.14), 'white', .442, -.28, 0);
    b.add(cylX(.09, .06), 'rubber', -.38, -.28, 0);
  } },
  { id: 'ul_laser', name: 'Linterna + láser', type: 'under', weight: 140, build(b) {
    clamp(b);
    b.add(box(.64, .28, .32, .06), 'body', 0, -.29, 0);
    b.add(cylX(.1, .05), 'alu', .33, -.29, .06); b.add(disc(.085), 'white', .356, -.29, .06);
    b.add(cylX(.04, .05), 'alu', .33, -.29, -.09); b.add(disc(.025), 'red', .356, -.29, -.09);
    for (const z of [.08, -.08]) b.add(box(.1, .04, .08, .015), 'rubber', -.2, -.44, z);
  } },
  { id: 'ul_vfg', name: 'Empuñadura vertical', type: 'under', fits: LONG, weight: 95, build(b) {
    clamp(b, .4);
    b.add(lathe('vfg', [[0, 0], [.11, 0], [.13, .05], [.13, .8], [.14, .83], [.14, .9], [0, .9]]), 'grip', 0, -.12, 0, 0, 0, -Math.PI / 2);
    b.add(cylY(.142, .04), 'rubber', 0, -1.0, 0);
  } },
  { id: 'ul_afg', name: 'Empuñadura angulada', type: 'under', fits: LONG, weight: 50, build(b) {
    b.add(ext('afg', poly([[-.42, 0], [.42, 0], [.2, -.22], [.08, -.29], [-.02, -.27], [-.25, -.1]]), .2, .03), 'grip');
  } },
  { id: 'ul_bipod', name: 'Bípode', type: 'under', fits: ['long-rifle'], weight: 280, build(b) {
    clamp(b, .4);
    b.add(box(.24, .14, .36, .03), 'blued', .05, -.22, 0);
    for (const sg of [1, -1]) {
      const p = b.group(.05, -.24, sg * .13, -sg * .32, 0, .42);
      b.add(cylY(.042, .7), 'blued', 0, -.36, 0, 0, 0, 0, p);
      b.add(cylY(.03, .5), 'steel', 0, -.92, 0, 0, 0, 0, p);
      for (let i = 0; i < 4; i++) b.add(box(.012, .02, .07, .004), 'hole', .028, -.75 - i * .08, 0, 0, 0, 0, p);
      b.add(sphere(.06), 'rubber', 0, -1.18, 0, 0, 0, 0, p);
    }
  } },

  /* ── Riel lateral ── */
  { id: 'sd_peq', name: 'Módulo láser lateral', type: 'side', weight: 210, build(b) {
    b.add(box(.36, .12, .1, .02), 'alu', 0, 0, .05);
    b.add(box(.64, .32, .28, .06), 'body', 0, 0, .24);
    b.add(cylX(.065, .04), 'alu', .32, .07, .24); b.add(disc(.05), 'glass', .342, .07, .24);
    b.add(cylX(.04, .04), 'alu', .32, -.07, .18); b.add(disc(.025), 'red', .342, -.07, .18);
    b.add(cylX(.04, .04), 'alu', .32, -.07, .3); b.add(disc(.025), 'hole', .342, -.07, .3);
    for (const x of [-.2, -.08]) b.add(box(.08, .04, .08, .015), 'rubber', x, .17, .24);
  } },
  { id: 'sd_light', name: 'Linterna lateral', type: 'side', weight: 120, build(b) {
    b.add(box(.3, .12, .14, .03), 'alu', 0, 0, .07);
    b.add(lathe('sdlight', [[0, -.3], [.09, -.3], [.11, -.28], [.11, .1], [.15, .22], [.15, .32], [0, .32]]), 'alu', 0, 0, .25);
    b.add(cylX(.114, .16), 'knurl', -.12, 0, .25);
    b.add(disc(.13), 'white', .322, 0, .25);
  } },

  /* ── Cargadores ── */
  { id: 'pmag_std', name: 'Cargador estándar', type: 'mag', fits: ['pistol-mag'], weight: 90, build(b) {
    b.add(ext('pbase', poly([[-.2, 0], [.18, 0], [.2, -.05], [.16, -.08], [-.2, -.08]]), .22, .015), 'body');
  } },
  { id: 'pmag_ext', name: 'Cargador extendido', type: 'mag', fits: ['pistol-mag'], weight: 125, build(b) {
    b.add(box(.31, .44, .2, .03), 'blued', 0, -.2, 0);
    b.add(ext('pbaseX', poly([[-.21, 0], [.19, 0], [.21, -.08], [.17, -.11], [-.21, -.11]]), .22, .015), 'grip', 0, -.4, 0);
  } },
  { id: 'rmag_metal', name: 'Cargador metálico', type: 'mag', fits: ['stanag'], weight: 230, build(b) {
    b.add(ext('rm1', rmagShape, .24, .014), 'alu');
    ribsAlongCurve(b, rmagMid, 2, -.18, .5, .265, 'alu', .36);
    b.add(box(.58, .07, .3, .025), 'blued', .26, -1.385, 0, 0, 0, .15);
  } },
  { id: 'rmag_poly', name: 'Cargador polímero', type: 'mag', fits: ['stanag'], color: 'tan', weight: 140, build(b) {
    b.add(ext('rm2', rmagShape, .27, .016), 'body');
    ribsAlongCurve(b, rmagMid, 4, -.3, .22, .31, 'body');
    b.add(box(.06, .5, .012, .006), 'glass', .1, -.75, .156, 0, 0, .25);
    b.add(box(.58, .08, .32, .03), 'grip', .26, -1.385, 0, 0, 0, .15);
  } },
  { id: 'rmag_short', name: 'Cargador corto', type: 'mag', fits: ['stanag'], weight: 170, build(b) {
    b.add(ext('rm3', s => { s.moveTo(-.27, 0); s.lineTo(.27, 0); s.quadraticCurveTo(.3, -.45, .38, -.85); s.lineTo(-.12, -.9); s.quadraticCurveTo(-.22, -.45, -.27, 0); }, .24, .014), 'alu');
    b.add(box(.36, .022, .265, .006), 'alu', .02, -.25, 0, 0, 0, .06);
    b.add(box(.54, .07, .3, .025), 'blued', .13, -.88, 0, 0, 0, .1);
  } },
  { id: 'rmag_drum', name: 'Tambor alta capacidad', type: 'mag', fits: ['stanag'], weight: 980, build(b) {
    b.add(box(.52, .42, .27, .04), 'body', .02, -.2, 0);
    b.add(cylZ(.62, .44, 64), 'body', .14, -.98, 0);
    b.add(cylZ(.6, .47, 64), 'dark', .14, -.98, 0);
    b.add(cylZ(.4, .48, 48), 'body', .14, -.98, 0);
    b.add(cylZ(.12, .56), 'knurl', .14, -.98, 0);
    b.add(box(.04, .3, .02, .01), 'body', .14, -.98, .29);
  } },
  { id: 'smag_curve', name: 'Cargador curvo', type: 'mag', fits: ['smg-mag'], weight: 160, build(b) {
    b.add(ext('sm1', smagShape, .19, .012), 'alu');
    b.add(box(.34, .06, .24, .02), 'blued', .275, -1.12, 0, 0, 0, .2);
  } },
  { id: 'smag_straight', name: 'Cargador recto', type: 'mag', fits: ['smg-mag'], weight: 140, build(b) {
    b.add(box(.3, 1.0, .2, .03), 'alu', 0, -.5, 0);
    for (let i = 0; i < 3; i++) b.add(box(.012, .7, .21, .004), 'alu', -.08 + i * .08, -.5, 0);
    b.add(box(.36, .07, .25, .025), 'blued', 0, -1.02, 0);
  } },
  { id: 'smag_dual', name: 'Cargadores acoplados', type: 'mag', fits: ['smg-mag'], weight: 340, build(b) {
    const g2 = b.group(0, 0, .24);
    for (const g of [null, g2]) {
      b.add(ext('sm1', smagShape, .19, .012), 'alu', 0, 0, 0, 0, 0, 0, g);
      b.add(box(.34, .06, .24, .02), 'blued', .275, -1.12, 0, 0, 0, .2, g);
    }
    b.add(box(.16, .24, .48, .02), 'steel', .14, -.55, .12, 0, 0, .3);
    b.add(cylZ(.035, .52), 'knurl', .14, -.55, .12);
  } },

  /* ── Culatas ── */
  { id: 'rstock_ret', name: 'Culata retráctil', type: 'stock', fits: ['ar-tube'], weight: 250, build(b) {
    b.add(ext('rs1', s => {
      s.moveTo(0, .17); s.lineTo(-1.35, .24); s.quadraticCurveTo(-1.45, .24, -1.45, .14); s.lineTo(-1.45, -.6);
      s.quadraticCurveTo(-1.45, -.68, -1.36, -.68); s.lineTo(-1.2, -.68); s.lineTo(-.85, -.16); s.lineTo(0, -.17); s.closePath();
      const h = new THREE.Path(); h.absellipse(-.95, -.04, .22, .08, 0, Math.PI * 2, true); s.holes.push(h);
    }, .25, .03), 'body');
    b.add(ext('rspad', poly([[0, .28], [.08, .28], [.08, -.7], [0, -.7]]), .29, .02), 'rubber', -1.53, 0, 0);
    b.add(box(.32, .05, .1, .02), 'dark', -.42, -.22, 0);
    b.add(torus(.06, .015), 'steel', -1.3, -.66, 0, Math.PI / 2, 0, 0);
  } },
  { id: 'rstock_fixed', name: 'Culata fija', type: 'stock', fits: ['ar-tube'], weight: 400, build(b) {
    b.add(ext('rs2', s => {
      s.moveTo(0, .2); s.lineTo(-1.75, .3); s.quadraticCurveTo(-1.85, .3, -1.85, .2); s.lineTo(-1.85, -.62);
      s.quadraticCurveTo(-1.85, -.72, -1.75, -.72); s.lineTo(-1.5, -.72); s.lineTo(-.2, -.24); s.lineTo(0, -.2); s.closePath();
    }, .27, .03), 'body');
    b.add(ext('rs2pad', poly([[0, .34], [.08, .34], [.08, -.76], [0, -.76]]), .31, .02), 'rubber', -1.93, 0, 0);
    b.add(box(.3, .04, .02, .01), 'hole', -1.0, -.1, .166);
  } },
  { id: 'rstock_skel', name: 'Culata esqueleto', type: 'stock', fits: ['ar-tube'], weight: 200, build(b) {
    b.add(ext('rs3', poly([[0, .15], [-1.5, .22], [-1.5, -.66], [-1.3, -.66], [-.6, -.15], [0, -.15]], [[[-1.35, .1], [-.75, .06], [-1.35, -.45]]]), .22, .03), 'body');
    b.add(ext('rs3pad', poly([[0, .25], [.07, .25], [.07, -.69], [0, -.69]]), .26, .02), 'rubber', -1.57, 0, 0);
  } },
  { id: 'stock_pdw', name: 'Culata PDW', type: 'stock', fits: ['ar-tube', 'smg-stock'], weight: 220, build(b) {
    b.add(box(.18, .34, .44, .05), 'alu', -.06, 0, 0);
    for (const z of [.16, -.16]) b.add(lathe('pdwrod', [[0, -1.02], [.04, -1.02], [.04, 0], [0, 0]], 24), 'steel', 0, .06, z);
    b.add(box(.12, .76, .42, .04), 'alu', -1.07, -.14, 0);
    b.add(box(.05, .72, .38, .02), 'rubber', -1.15, -.14, 0);
  } },
  { id: 'sstock_fold', name: 'Culata plegable', type: 'stock', fits: ['smg-stock'], weight: 210, build(b) {
    b.add(ext('ss1', poly([[0, .12], [-1.25, .14], [-1.3, -.55], [-1.1, -.55], [-.15, -.12], [0, -.12]], [[[-1.12, .04], [-.35, .03], [-1.12, -.38]]]), .1, .025), 'body');
    b.add(cylY(.07, .32), 'steel', 0, 0, 0);
    b.add(ext('sspad', poly([[0, .17], [.07, .17], [.07, -.6], [0, -.6]]), .18, .02), 'rubber', -1.38, 0, 0);
  } },
  { id: 'sstock_wire', name: 'Culata de alambre', type: 'stock', fits: ['smg-stock'], weight: 150, build(b) {
    for (const z of [.13, -.13]) b.add(lathe('wire', [[0, -1.2], [.035, -1.2], [.035, 0], [0, 0]], 20), 'steel', 0, .08, z);
    b.add(ext('wirebutt', s => { s.moveTo(0, .2); s.lineTo(.05, .2); s.quadraticCurveTo(.0, -.2, .07, -.45); s.lineTo(.02, -.45); s.quadraticCurveTo(-.05, -.2, 0, .2); }, .3, .015), 'steel', -1.22, 0, 0);
  } },

  /* ── Empuñaduras ── */
  { id: 'grip_std', name: 'Empuñadura estándar', type: 'grip', fits: ['ar-grip'], weight: 70, build(b) {
    b.add(ext('g1', s => { s.moveTo(-.2, 0); s.lineTo(.2, 0); s.lineTo(.18, -.78); s.quadraticCurveTo(.17, -.86, .08, -.86); s.lineTo(-.12, -.86); s.quadraticCurveTo(-.22, -.86, -.22, -.76); s.closePath(); }, .22, .035), 'grip');
    b.add(box(.36, .04, .28, .015), 'body', -.02, -.89, 0);
  } },
  { id: 'grip_ergo', name: 'Empuñadura ergonómica', type: 'grip', fits: ['ar-grip'], weight: 95, build(b) {
    b.add(ext('g2', s => {
      s.moveTo(-.34, .02); s.lineTo(.2, .02); s.quadraticCurveTo(.26, -.2, .2, -.3); s.quadraticCurveTo(.26, -.45, .19, -.55);
      s.quadraticCurveTo(.25, -.68, .18, -.8); s.lineTo(.14, -.9); s.lineTo(-.18, -.9); s.quadraticCurveTo(-.26, -.85, -.25, -.7);
      s.lineTo(-.22, -.15); s.quadraticCurveTo(-.24, -.05, -.34, .02); s.closePath();
    }, .24, .035), 'grip');
  } },
];
