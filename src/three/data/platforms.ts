// Plataformas base (cuerpos genéricos). Unidades: 1 = 100 mm. Eje X = hacia la boca, Y = arriba.
// Cada ranura define dónde se ancla una pieza y en qué dirección se desplaza en el despiece.
import * as THREE from 'three';
import type { Builder } from '../core/builder';
import { box, cylX, cylZ, lathe, ext, extX, poly, chamferRect, slot, disc } from '../core/geometry';
import type { Platform } from '../types';
// Plataformas base (cuerpos). Unidades: 1 = 100 mm. Eje X = hacia la boca, Y = arriba.
// Cada ranura define dónde se ancla una pieza y en qué dirección "explota" en el despiece.

/* ── Pistola compacta ─────────────────────────────────────────────── */
function buildPistol(b: Builder) {
  // Corredera
  b.add(ext('pslide', poly([[-.95, .58], [.86, .58], [.93, .62], [.93, .82], [.86, .87], [-.93, .87], [-.95, .84]]), .2, .025), 'blued');
  for (let i = 0; i < 8; i++) b.add(box(.018, .2, .262, .004), 'hole', -.88 + i * .04, .71, 0);
  for (let i = 0; i < 5; i++) b.add(box(.016, .17, .262, .004), 'hole', .58 + i * .04, .7, 0);
  b.add(box(.4, .075, .012, .006), 'hole', .1, .79, .126);
  b.add(box(.36, .05, .012, .005), 'steel', .1, .79, .128);
  b.add(box(.2, .02, .01, .004), 'dark', .3, .77, .127);
  b.add(cylX(.075, .06), 'steel', .955, .74, 0);
  b.add(disc(.04), 'hole', .987, .74, 0);
  // Miras
  b.add(box(.05, .06, .06, .01), 'dark', .82, .9, 0);
  b.add(box(.012, .012, .004, .003), 'white', .82, .91, .031);
  b.add(ext('prs', poly([[-.06, 0], [.06, 0], [.04, .07], [-.05, .07]]), .2, .01), 'dark', -.8, .87, 0);
  // Armazón
  b.add(ext('pframe', s => {
    s.moveTo(.80, .57); s.lineTo(-.86, .57); s.lineTo(-.95, .47); s.lineTo(-1.15, -.52);
    s.quadraticCurveTo(-1.16, -.62, -1.05, -.62); s.lineTo(-.72, -.62); s.quadraticCurveTo(-.62, -.62, -.63, -.52);
    s.quadraticCurveTo(-.56, -.38, -.6, -.3); s.quadraticCurveTo(-.52, -.16, -.56, -.08); s.quadraticCurveTo(-.48, .04, -.5, .12);
    s.quadraticCurveTo(-.42, .2, -.32, .14); s.lineTo(-.18, .09); s.quadraticCurveTo(.12, .02, .22, .12);
    s.quadraticCurveTo(.30, .22, .30, .40); s.lineTo(.80, .40); s.closePath();
    const h = new THREE.Path(); h.absellipse(.03, .255, .17, .09, 0, Math.PI * 2, true); s.holes.push(h);
  }, .23, .025), 'body');
  // Panel de agarre punteado
  b.add(ext('pgrip', poly([[-.94, .36], [-.62, .30], [-.62, -.45], [-.68, -.52], [-1.08, -.52], [-1.11, -.42]]), .245, .02), 'grip');
  // Gatillo con seguro
  b.add(ext('ptrig', s => { s.moveTo(-.025, .06); s.lineTo(.03, .06); s.quadraticCurveTo(.05, -.04, .0, -.1); s.lineTo(-.025, -.095); s.quadraticCurveTo(.015, -.03, -.025, .06); }, .055, .008), 'dark', .0, .29, 0);
  b.add(box(.012, .06, .02, .004), 'body', .015, .24, 0);
  // Controles
  b.add(box(.07, .06, .02, .008), 'dark', -.42, .37, .145);
  b.add(box(.24, .035, .02, .008), 'dark', -.17, .53, .145);
  b.add(box(.08, .03, .02, .006), 'dark', .2, .51, .145);
  b.pin(.42, .48, .145, .02);
  // Riel del guardapolvo
  for (let i = 0; i < 4; i++) b.add(box(.045, .03, .2, .006), 'body', .45 + i * .1, .385, 0);
}

/* ── Carabina ─────────────────────────────────────────────────────── */
function buildRifle(b: Builder) {
  // Cajón superior
  b.add(ext('rupper', poly([[-1.5, 1.27], [1.1, 1.27], [1.1, .78], [1.0, .725], [-1.3, .725], [-1.5, .8]]), .38, .02), 'alu');
  b.add(box(.6, .16, .01, .006), 'hole', .12, .98, .212);
  b.add(box(.5, .1, .01, .006), 'steel', .12, .98, .215);
  b.add(box(.62, .012, .07, .004), 'alu', .12, .88, .245);
  b.add(box(.13, .15, .07, .02), 'alu', -.32, 1.02, .22);
  const fa = b.group(-1.02, 1.0, .2, 0, .45, 0);
  b.add(cylX(.075, .32), 'alu', 0, 0, 0, 0, 0, 0, fa);
  b.add(cylX(.08, .09), 'knurl', -.2, 0, 0, 0, 0, 0, fa);
  b.add(box(.08, .06, .42, .015), 'dark', -1.53, 1.22, 0);
  b.add(box(.06, .07, .1, .015), 'dark', -1.53, 1.24, .22);
  b.rail(5.4, 1.25, 1.275, 1, null, true);
  // Cajón inferior
  b.add(ext('rlower', poly([[-1.4, .73], [.9, .73], [.9, .58], [.8, .54], [.82, -.02], [.08, -.02], [.1, .32], [-.95, .32], [-1.05, .45], [-1.4, .55]]), .36, .02), 'alu');
  b.add(box(.8, .06, .44, .025), 'alu', .45, .01, 0);
  b.add(ext('rguard', poly([[-.6, .33], [.06, .33], [.06, .04], [-.45, .04], [-.6, .12]], [[[-.52, .27], [0, .27], [0, .1], [-.44, .1], [-.52, .15]]]), .1, .012), 'alu');
  b.add(ext('rtrig', s => { s.moveTo(-.02, .06); s.lineTo(.03, .06); s.quadraticCurveTo(.05, -.06, .0, -.13); s.lineTo(-.022, -.12); s.quadraticCurveTo(.015, -.05, -.02, .06); }, .055, .008), 'steel', -.24, .3, 0);
  b.add(box(.2, .05, .03, .012), 'dark', -.62, .6, -.215, 0, 0, -.2);
  b.add(cylZ(.035, .46), 'steel', -.62, .6, 0);
  b.pin(.72, .64, .2, .045); b.pin(-1.12, .62, .2, .045);
  b.add(cylZ(.055, .44), 'knurl', .02, .46, 0);
  b.add(box(.06, .18, .02, .01), 'dark', -.1, .5, -.205);
  // Guardamanos octogonal con ranuras M-LOK
  b.add(extX('rhg', s => chamferRect(s, .48, .54, .1), 2.9, .02), 'alu', 2.55, 1.0, 0);
  for (let i = 0; i < 6; i++) for (const z of [.272, -.272]) {
    b.add(slot(.28, .075), 'hole', 1.45 + i * .44, 1.08, z);
    b.add(slot(.28, .075), 'hole', 1.45 + i * .44, .9, z);
  }
  for (let i = 0; i < 9; i++) for (const sy of [1, -1]) for (const sz of [1, -1])
    b.add(box(.06, .025, .012, .006), 'hole', 1.35 + i * .32, 1.0 + sy * .238, sz * .208, Math.atan2(-sy, sz), 0, 0);
  b.rail(2.6, 2.65, .72, -1);
  const sg = b.group(3.3, 1.0, .25, Math.PI / 2, 0, 0); b.rail(.9, 0, 0, 1, sg);
  // Cañón y bloque de gas
  b.add(box(.2, .24, .26, .03), 'blued', 4.13, 1.0, 0);
  b.add(lathe('rbarrel', [[0, 4.0], [.1, 4.0], [.1, 4.3], [.085, 4.34], [.085, 5.28], [.07, 5.3], [.07, 5.45], [0, 5.45]]), 'blued', 0, 1.0, 0);
  for (let i = 0; i < 5; i++) b.add(cylX(.072, .008), 'hole', 5.32 + i * .025, 1.0, 0);
  b.add(disc(.035), 'hole', 5.452, 1.0, 0);
  // Tubo del amortiguador
  b.add(lathe('rbuffer', [[0, -3.42], [.14, -3.42], [.155, -3.4], [.155, -1.64], [.2, -1.62], [.2, -1.53], [.16, -1.5], [0, -1.5]]), 'alu', 0, 1.0, 0);
  b.add(cylX(.205, .07), 'knurl', -1.58, 1.0, 0);
  for (let i = 0; i < 6; i++) b.add(box(.04, .012, .07, .004), 'hole', -2.1 - i * .2, .846, 0);
}

/* ── Subfusil ─────────────────────────────────────────────────────── */
function buildSmg(b: Builder) {
  b.add(ext('sreceiver', poly([[-1.0, 1.2], [1.6, 1.2], [1.6, .8], [1.45, .6], [-1.0, .6]]), .32, .025), 'alu');
  b.add(box(.5, .14, .01, .005), 'hole', .55, 1.0, .186);
  b.add(box(.42, .1, .01, .005), 'steel', .55, 1.0, .189);
  b.rail(2.3, .3, 1.2, 1, null, true);
  b.add(lathe('sshroud', [[0, 1.6], [.15, 1.6], [.15, 1.92], [.12, 1.96], [0, 1.96]], 48), 'perf', 0, .95, 0);
  b.add(lathe('sbarrel', [[0, 1.9], [.07, 1.9], [.07, 2.2], [0, 2.2]]), 'blued', 0, .95, 0);
  b.add(disc(.035), 'hole', 2.202, .95, 0);
  // Caja de mecanismos y guardamonte
  b.add(ext('shousing', poly([[-.6, .62], [.42, .62], [.44, .36], [-.55, .34], [-.62, .45]]), .28, .02), 'body');
  b.add(box(.5, .26, .3, .03), 'body', .68, .48, 0);
  b.add(box(.56, .05, .34, .02), 'body', .68, .36, 0);
  b.add(ext('sguard', poly([[-.2, .35], [.4, .35], [.4, .14], [-.1, .14], [-.2, .2]], [[[-.13, .3], [.33, .3], [.33, .19], [-.06, .19], [-.13, .23]]]), .1, .012), 'body');
  b.add(ext('strig', s => { s.moveTo(-.02, .05); s.lineTo(.03, .05); s.quadraticCurveTo(.05, -.05, .0, -.11); s.lineTo(-.022, -.1); s.quadraticCurveTo(.015, -.04, -.02, .05); }, .05, .008), 'steel', .1, .3, 0);
  b.add(box(.14, .05, .03, .012), 'dark', -.35, .52, .155);
  b.pin(-.45, .5, .16, .035); b.pin(.3, .5, .16, .035);
  // Manija de carga
  b.add(box(.5, .03, .01, .005), 'hole', 1.15, 1.08, .162);
  b.add(box(.06, .06, .14, .015), 'dark', 1.3, 1.08, .22);
  b.add(box(.06, .52, .34, .02), 'dark', -1.0, .9, 0);
  b.rail(.7, 1.25, .6, -1);
}

export const PLATFORMS: Record<string, Platform> = {
  pistol: {
    name: 'Pistola compacta', short: 'Pistola', weight: 560, build: buildPistol, group: 'Genéricos',
    tags: ['pistol', 'pistol-mag'],
    slots: [
      { id: 'optic', type: 'optic', pos: [-.35, .87, 0], scale: .8, explode: [0, .55, 0] },
      { id: 'muzzle', type: 'muzzle', pos: [.99, .74, 0], scale: .62, explode: [.6, 0, 0] },
      { id: 'under', type: 'under', pos: [.55, .37, 0], scale: .8, explode: [0, -.5, 0] },
      { id: 'mag', type: 'mag', pos: [-.87, -.6, 0], rot: [0, 0, -.2], explode: [-.12, -.6, 0] },
    ],
    defaults: { mag: 'pmag_std' },
  },
  rifle: {
    name: 'Carabina genérica', short: 'Carabina', weight: 2450, build: buildRifle, group: 'Genéricos',
    tags: ['long', 'long-rifle', 'stanag', 'ar-tube', 'ar-grip'],
    slots: [
      { id: 'optic', type: 'optic', pos: [-.15, 1.365, 0], explode: [0, .85, 0] },
      { id: 'muzzle', type: 'muzzle', pos: [5.45, 1.0, 0], explode: [.9, 0, 0] },
      { id: 'under', type: 'under', pos: [2.7, .63, 0], explode: [0, -.8, 0] },
      { id: 'side', type: 'side', pos: [3.3, 1.0, .34], explode: [0, 0, .7] },
      { id: 'mag', type: 'mag', pos: [.45, -.02, 0], explode: [0, -.85, 0] },
      { id: 'stock', type: 'stock', pos: [-2.0, 1.0, 0], explode: [-.9, 0, 0] },
      { id: 'grip', type: 'grip', pos: [-.75, .3, 0], rot: [0, 0, -.36], explode: [-.2, -.6, 0] },
    ],
    defaults: { mag: 'rmag_metal', stock: 'rstock_ret', grip: 'grip_std' },
  },
  smg: {
    name: 'Subfusil genérico', short: 'Subfusil', weight: 1750, build: buildSmg, group: 'Genéricos',
    tags: ['long', 'smg-mag', 'smg-stock', 'ar-grip'],
    slots: [
      { id: 'optic', type: 'optic', pos: [.25, 1.29, 0], scale: .9, explode: [0, .65, 0] },
      { id: 'muzzle', type: 'muzzle', pos: [2.2, .95, 0], scale: .8, explode: [.7, 0, 0] },
      { id: 'under', type: 'under', pos: [1.25, .51, 0], scale: .85, explode: [0, -.6, 0] },
      { id: 'mag', type: 'mag', pos: [.68, .34, 0], explode: [0, -.7, 0] },
      { id: 'stock', type: 'stock', pos: [-1.03, .95, 0], explode: [-.8, 0, 0] },
      { id: 'grip', type: 'grip', pos: [-.3, .36, 0], rot: [0, 0, -.3], scale: .92, explode: [-.15, -.55, 0] },
    ],
    defaults: { mag: 'smag_curve', stock: 'sstock_fold', grip: 'grip_std' },
  },
};
