// Modelos reales (silueta estilizada, sin logotipos) con variantes y ficha técnica.
// Escala real: 1 unidad = 100 mm. Eje del ánima en y = 1.0, boca hacia +X.
import * as THREE from 'three';
import type { Builder } from '../core/builder';
import type { MatKey } from '../core/materials';
import { box, cylX, cylY, cylZ, lathe, ext, extX, poly, roundRect, chamferRect, slot, disc, sphere, torus } from '../core/geometry';
import type { ColorKey, Part, Platform, Slot, Specs } from '../types';

type Pt = [number, number];
type Hg = 'ris' | 'hk' | 'hkey' | 'mlok' | 'mcx' | 'iur' | 'm4';
/** Opciones geométricas de una variante. */
export interface Opts {
  hg?: Hg; hgEnd: number; muzzle: number; sights?: boolean; piston?: 'sig' | 'hk';
  hkLower?: boolean; buffer?: boolean; noFA?: boolean; covers?: boolean; heavy?: boolean; handle?: boolean;
}
export interface Variant {
  id: string; name: string; barrel: number; color: ColorKey; w?: number; specs: Specs;
  o?: Opts; build?: (b: Builder) => void; defaults?: Record<string, string>; tags?: string[];
}
export interface Model { id: string; name: string; maker: string; group: string; common: Specs; variants: Variant[] }
// Modelos reales (silueta estilizada, sin logotipos) con variantes y ficha técnica.
// Escala real: 1 unidad = 100 mm. Eje del ánima en y = 1.0, boca hacia +X.

const IN = .254;                                   // 1 pulgada en unidades
const arMuzzle = (inches: number) => +(0.85 + (inches - 0.6) * IN).toFixed(3);
const arHgEnd = (inches: number) => +(0.85 + inches * IN).toFixed(3);
const EXP: Record<string, [number, number, number]> = { optic: [0, .85, 0], muzzle: [.9, 0, 0], under: [0, -.8, 0], side: [0, 0, .7], mag: [0, -.9, 0], stock: [-.9, 0, 0], grip: [-.2, -.6, 0] };

/* ───────────────────────── Piezas comunes ───────────────────────── */
function barrel(b: Builder, x0: number, x1: number, r = .095, key = '') {
  const k = `brl${key}${x0}-${x1}-${r}`;
  const mid = x0 + (x1 - x0) * .35;
  b.add(lathe(k, [[0, x0], [r, x0], [r, mid], [r * .85, mid + .03], [r * .85, x1 - .16], [r * .75, x1 - .14], [r * .75, x1], [0, x1]]), 'blued', 0, 1, 0);
  for (let i = 0; i < 4; i++) b.add(cylX(r * .77, .008), 'hole', x1 - .12 + i * .028, 1, 0);
  b.add(disc(r * .4), 'hole', x1 + .002, 1, 0);
}
function sideRail(b: Builder, x: number, len: number, z: number, y = 1) {
  const g = b.group(x, y, z, Math.sign(z) * Math.PI / 2, 0, 0); b.rail(len, 0, 0, 1, g);
}
function triggerRing(b: Builder, key: string, outer: Pt[], hole: Pt[], depth = .09, mat: MatKey = 'alu') {
  b.add(ext(key, poly(outer, [hole]), depth, .012), mat);
}
function trigger(b: Builder, x: number, y: number, mat: MatKey = 'steel') {
  b.add(ext('trigblade', s => { s.moveTo(-.02, .05); s.lineTo(.03, .05); s.quadraticCurveTo(.05, -.06, 0, -.12); s.lineTo(-.022, -.11); s.quadraticCurveTo(.015, -.05, -.02, .05); }, .05, .008), mat, x, y, 0);
}
function foldSight(b: Builder, x: number, y: number, front: boolean) {
  b.add(box(.1, .06, .14, .015), 'dark', x, y + .03, 0);
  b.add(box(.06, front ? .1 : .08, .1, .012), 'dark', x, y + (front ? .1 : .09), 0);
  if (front) b.add(box(.012, .07, .012, .004), 'steel', x, y + .17, 0);
  else for (const z of [.03, -.03]) b.add(box(.04, .05, .015, .005), 'dark', x, y + .15, z);
}
/* Detalles pequeños que dan escala y realismo */
const rivet = (b: Builder, x: number, y: number, z: number, r = .017) => b.add(sphere(r), 'steel', x, y, z);
const paintDot = (b: Builder, x: number, y: number, z: number, s = .014) => b.add(box(s, s, .004, .002), 'paint', x, y, z);
function qd(b: Builder, x: number, y: number, z: number) { b.add(cylZ(.038, .03), 'steel', x, y, z); b.add(cylZ(.019, .034), 'hole', x, y, z); }
function swivel(b: Builder, x: number, y: number, z = 0, rot = 0) { b.add(torus(.05, .011, 24), 'steel', x, y, z, 0, 0, rot); }
function screwHead(b: Builder, x: number, y: number, z: number) { b.add(cylZ(.022, .012), 'steel', x, y, z); b.add(box(.034, .006, .014, .002), 'hole', x, y, z + Math.sign(z) * .004); }
/** Tapa de riel tipo escalera (rail cover). where: z del lateral (±) o 'bottom'. */
function ladder(b: Builder, x: number, len: number, where: number | 'bottom', y = 1) {
  const n = Math.floor(len / .1);
  if (where === 'bottom') {
    b.add(box(len, .03, .2, .012), 'rubber', x, y, 0);
    for (let i = 0; i < n; i++) b.add(box(.035, .02, .21, .006), 'rubber', x - len / 2 + .05 + i * .1, y - .022, 0);
  } else {
    const z = where;
    b.add(box(len, .2, .03, .012), 'rubber', x, y, z);
    for (let i = 0; i < n; i++) b.add(box(.035, .21, .02, .006), 'rubber', x - len / 2 + .05 + i * .1, y, z + Math.sign(z) * .022);
  }
}

/* ───────────────────────── Familia AR-15 ───────────────────────── */
function arLower(b: Builder, hk = false) {
  b.add(ext('arlow2', s => {
    s.moveTo(-1.1, .74); s.lineTo(.75, .74); s.lineTo(.75, .6); s.quadraticCurveTo(.74, .55, .68, .54);
    s.lineTo(.71, .1); s.quadraticCurveTo(.72, .04, .66, .04); s.lineTo(.1, .04); s.quadraticCurveTo(.04, .04, .05, .1);
    s.lineTo(.06, .3); s.lineTo(-.6, .3); s.quadraticCurveTo(-.7, .31, -.72, .42); s.lineTo(-.92, .46); s.quadraticCurveTo(-1.1, .48, -1.1, .6); s.closePath();
  }, .3, .022), 'alu');
  // brocal del cargador ensanchado
  b.add(ext('arflare', s => { s.moveTo(-.38, 0); s.lineTo(.38, 0); s.quadraticCurveTo(.42, 0, .42, -.04); s.lineTo(.4, -.07); s.lineTo(-.4, -.07); s.lineTo(-.42, -.04); s.quadraticCurveTo(-.42, 0, -.38, 0); }, .38, .012), 'alu', .38, .11, 0);
  if (hk) { for (const z of [.2, -.2]) b.add(box(.2, .28, .03, .012), 'alu', .66, .3, z); }
  // relieve lateral alrededor del selector
  for (const z of [.176, -.176]) b.add(box(.5, .18, .012, .01), 'alu', -.25, .62, z);
  triggerRing(b, 'arguard', [[-.5, .31], [.03, .31], [.03, .05], [-.38, .05], [-.5, .12]], [[-.43, .26], [-.02, .26], [-.02, .1], [-.36, .1], [-.43, .15]]);
  b.pin(-.42, .2, .06, .015);
  trigger(b, -.2, .29);
  // selector con marcas
  b.add(cylZ(.03, .38), 'steel', -.52, .58, 0);
  for (const z of [-.185, .185]) b.add(box(.16, .045, .025, .01), 'dark', -.52, .58, z, 0, 0, -.25);
  for (const [dx, dy] of [[-.08, .06], [0, .1], [.08, .06]]) paintDot(b, -.52 + dx, .58 + dy, .184);
  b.pin(.66, .64, .18, .04); b.pin(-.92, .62, .18, .04);
  b.pin(-.24, .56, .175, .022); b.pin(-.06, .56, .175, .022);
  b.add(cylZ(.045, .38), 'knurl', .0, .45, 0);
  b.add(ext('arbcatch', poly([[-.04, .1], [.04, .1], [.05, -.08], [-.02, -.1]]), .02, .006), 'dark', -.08, .52, -.195);
  qd(b, -1.06, .66, .17); qd(b, -1.06, .66, -.17);
}
function arUpper(b: Builder, o: Opts) {
  b.add(ext('arup2', s => {
    s.moveTo(-1.0, 1.27); s.lineTo(.85, 1.27); s.lineTo(.85, .8); s.quadraticCurveTo(.84, .74, .78, .74);
    s.lineTo(-.85, .74); s.quadraticCurveTo(-.98, .76, -1.0, .84); s.closePath();
  }, .32, .022), 'alu');
  // ventana de expulsión con cerrojo visible y tapa abierta
  b.add(box(.44, .13, .01, .005), 'hole', .05, .98, .19);
  b.add(box(.36, .08, .012, .005), 'steel', .05, .98, .195);
  for (let i = 0; i < 3; i++) b.add(box(.02, .06, .012, .004), 'hole', .14 + i * .04, .98, .2);
  b.add(box(.46, .01, .06, .004), 'alu', .05, .9, .215);
  b.add(cylX(.008, .5), 'steel', .05, .905, .19);
  if (!o.noFA) { const fa = b.group(-.62, .97, .18, 0, .45, 0); b.add(cylX(.06, .24), 'alu', 0, 0, 0, 0, 0, 0, fa); b.add(cylX(.065, .07), 'knurl', -.15, 0, 0, 0, 0, 0, fa); }
  b.add(ext('ardeflect', s => { s.moveTo(-.06, -.07); s.lineTo(.06, -.07); s.quadraticCurveTo(.07, .06, -.02, .07); s.lineTo(-.06, .07); s.closePath(); }, .07, .012), 'alu', -.28, 1.02, .2);
  // manija de carga en T
  b.add(box(.07, .05, .36, .015), 'dark', -1.03, 1.21, 0);
  b.add(box(.05, .06, .08, .012), 'dark', -1.03, 1.23, .2);
  b.pin(.72, 1.02, .17, .02);
}
function bufferTube(b: Builder) {
  b.add(lathe('artube', [[0, -2.95], [.14, -2.95], [.15, -2.93], [.15, -1.18], [.19, -1.16], [.19, -1.1], [.15, -1.08], [0, -1.08]]), 'alu', 0, 1, 0);
  b.add(cylX(.195, .06), 'knurl', -1.14, 1, 0);
  b.add(box(.06, .3, .34, .02), 'steel', -1.1, .95, 0);
  for (let i = 0; i < 6; i++) b.add(box(.035, .01, .06, .004), 'hole', -1.65 - i * .2, .852, 0);
}
function arHandguard(b: Builder, o: Opts) {
  const x0 = .85, x1 = o.hgEnd, L = x1 - x0, c = (x0 + x1) / 2, k = `${o.hg}${x1}`;
  switch (o.hg) {
    case 'ris': case 'hk': {
      if (o.hg === 'ris') {
        b.add(box(L, .54, .44, .05), 'alu', c, 1, 0);
        b.add(box(.12, .5, .48, .03), 'alu', x0 + .06, 1, 0);
        for (let i = 0; i < 3; i++) screwHead(b, x0 + .06, .92 + i * .08, .245);
      } else {
        b.add(extX('hk' + k, s => roundRect(s, .44, .52, .1), L, .015), 'alu', c, 1, 0);
        // nariz frontal característica del HK416 y respiraderos
        b.add(ext('hknose', s => { s.moveTo(0, .27); s.lineTo(.06, .27); s.quadraticCurveTo(.12, .2, .12, 0); s.quadraticCurveTo(.12, -.2, .06, -.27); s.lineTo(0, -.27); s.closePath(); }, .44, .02), 'alu', x1 - .01, 1, 0);
        for (let i = 0; i < 3; i++) for (const z of [.236, -.236]) b.add(slot(.14, .045), 'hole', x1 - .45 + i * .14, 1.0, z);
      }
      b.rail(L - .04, c, .73, -1);
      for (const z of [.22, -.22]) sideRail(b, c, L - .1, z);
      if (o.covers) {
        ladder(b, c - L * .18, L * .5, .32); ladder(b, c - L * .18, L * .5, -.32);
        ladder(b, c - L * .25, L * .4, 'bottom', .625);
      }
      break;
    }
    case 'hkey': {
      b.add(extX('hkey' + k, s => roundRect(s, .44, .52, .12), L, .015), 'alu', c, 1, 0);
      b.add(ext('hknose2', s => { s.moveTo(0, .26); s.lineTo(.05, .26); s.quadraticCurveTo(.1, .18, .1, 0); s.quadraticCurveTo(.1, -.18, .05, -.26); s.lineTo(0, -.26); s.closePath(); }, .44, .02), 'alu', x1 - .01, 1, 0);
      b.rail(L * .55, x1 - L * .28, .74, -1);
      for (let i = 0; i < Math.floor(L / .28); i++) for (const z of [.236, -.236]) { b.add(slot(.16, .05), 'hole', x0 + .25 + i * .28, 1.08, z); b.add(slot(.16, .05), 'hole', x0 + .25 + i * .28, .92, z); }
      sideRail(b, x1 - .35, .5, .22);
      break;
    }
    case 'mlok': case 'mcx': {
      const w = o.hg === 'mcx' ? .4 : .44;
      b.add(extX('ml' + k + w, s => chamferRect(s, w, .52, .1), L, .015), 'alu', c, 1, 0);
      for (let i = 0; i < Math.floor((L - .2) / .38); i++) for (const z of [w / 2 + .016, -w / 2 - .016]) { b.add(slot(.26, .07), 'hole', x0 + .3 + i * .38, 1.07, z); b.add(slot(.26, .07), 'hole', x0 + .3 + i * .38, .92, z); }
      for (let i = 0; i < Math.floor((L - .2) / .38); i++) b.add(slot(.26, .07), 'hole', x0 + .3 + i * .38, .735, 0, Math.PI / 2, 0, 0);
      b.rail(Math.min(.9, L * .5), x1 - .5, .74, -1);
      sideRail(b, x1 - .4, .5, w / 2 + .01);
      b.add(box(.08, .48, w + .02, .03), 'alu', x0 + .04, 1, 0);
      break;
    }
    case 'iur': {
      b.add(extX('iur' + k, s => roundRect(s, .42, .54, .07), L, .012), 'alu', c, 1, 0);
      b.rail(Math.min(1.2, L * .6), x1 - .65, .73, -1);
      sideRail(b, x1 - .35, .45, .21);
      for (let i = 0; i < Math.floor((L - .5) / .34); i++) for (const z of [.222, -.222]) b.add(slot(.22, .06), 'hole', x0 + .3 + i * .34, 1.05, z);
      // tapa de riel de perfil bajo
      ladder(b, x1 - .65, Math.min(1.1, L * .55), 'bottom', .625);
      break;
    }
    case 'm4': {
      b.add(cylX(.26, .08), 'blued', x0 + .04, 1, 0);
      b.add(lathe('m4hg' + x1, [[0, x0 + .08], [.22, x0 + .08], [.22, x0 + .14], [.2, x0 + .2], [.2, x1 - .1], [.215, x1 - .05], [.215, x1], [0, x1]], 32), 'dark', 0, 1, 0);
      for (let a = 0; a < 8; a++) { const t = a * Math.PI / 4 + Math.PI / 8; b.add(box(L - .3, .025, .035, .008), 'dark', c, 1 + Math.cos(t) * .205, Math.sin(t) * .205, t, 0, 0); }
      for (let i = 0; i < 6; i++) b.add(cylZ(.025, .43), 'hole', x0 + .35 + i * .22, 1.12, 0);
      const f = x1 + .3;
      b.add(cylX(.13, .2), 'blued', f, 1, 0);
      b.add(ext('fsb', poly([[-.11, 0], [.11, 0], [.035, .36], [-.035, .36]]), .09, .01), 'blued', f, 1.06, 0);
      for (const z of [.05, -.05]) b.add(box(.05, .14, .03, .008), 'blued', f, 1.4, z);
      b.add(box(.02, .12, .02, .005), 'steel', f, 1.39, 0);
      b.add(box(.12, .08, .06, .01), 'blued', f + .04, .86, 0);
      swivel(b, f, .78, 0, 0);
      b.pin(f - .03, 1.0, .07, .012); b.pin(f + .03, 1.22, .05, .012);
      break;
    }
  }
  if (o.piston === 'sig') { b.add(box(.14, .22, .26, .03), 'blued', x1 + .08, 1.08, 0); b.add(cylX(.06, .1), 'knurl', x1 + .2, 1.18, 0); for (let i = 0; i < 4; i++) paintDot(b, x1 + .26, 1.1 + i * .03, 0); }
  if (o.piston === 'hk') b.add(box(.12, .2, .24, .03), 'blued', x1 + .07, 1.04, 0);
}
function buildAR(o: Opts) {
  return (b: Builder) => {
    arUpper(b, o); arLower(b, o.hkLower); arHandguard(b, o);
    const railEnd = o.hg === 'm4' ? .83 : o.hgEnd - .02;
    b.rail(railEnd + .98, (railEnd - .98) / 2, 1.27, 1, null, true);
    if (o.buffer !== false) bufferTube(b);
    else {
      // MCX: sin tubo; bloque de bisagra de culata y nervio lateral del cajón
      b.add(box(.14, .36, .32, .04), 'alu', -1.06, 1.0, 0);
      b.add(cylY(.04, .4), 'steel', -1.11, 1.0, 0);
      for (const z of [.184, -.184]) b.add(box(1.4, .05, .012, .01), 'alu', -.15, .8, z);
    }
    barrel(b, .85, o.muzzle, o.hkLower ? .1 : .09, 'ar' + (o.hkLower ? 'hk' : ''));
    if (o.sights) { foldSight(b, -.82, 1.36, false); if (o.hg !== 'm4') foldSight(b, o.hgEnd - .1, 1.36, true); }
  };
}
function arSlots(o: Opts): Slot[] {
  const s: Slot[] = [
    { id: 'optic', type: 'optic', pos: [-.25, 1.36, 0], explode: EXP.optic },
    { id: 'muzzle', type: 'muzzle', pos: [o.muzzle, 1, 0], explode: EXP.muzzle },
    { id: 'mag', type: 'mag', pos: [.38, .05, 0], scale: 1.12, explode: EXP.mag },
    { id: 'stock', type: 'stock', pos: o.buffer === false ? [-1.13, 1, 0] : [-1.55, 1, 0], explode: EXP.stock },
    { id: 'grip', type: 'grip', pos: [-.56, .3, 0], rot: [0, 0, -.36], explode: EXP.grip },
  ];
  if (o.hg !== 'm4') {
    s.splice(2, 0, { id: 'under', type: 'under', pos: [o.hgEnd - .6, .64, 0], explode: EXP.under },
      { id: 'side', type: 'side', pos: [o.hgEnd - (o.hg === 'ris' || o.hg === 'hk' ? .6 : .4), 1, o.hg === 'mcx' ? .3 : .32], explode: EXP.side });
  }
  return s;
}

/* ───────────────────────── Familia Kalashnikov ───────────────────────── */
function akReceiver(b: Builder, o: { ribs?: boolean; dovetail?: boolean; rail?: boolean }) {
  b.add(ext('akrec', poly([[-1.15, 1.03], [1.05, 1.03], [1.05, .6], [.98, .56], [-.95, .56], [-1.15, .7]]), .28, .012), 'blued');
  // tapa del cajón (estampada, con nervios en el AK-74M)
  b.add(extX('akcover', s => { s.moveTo(-.15, 0); s.lineTo(.15, 0); s.quadraticCurveTo(.16, .13, 0, .17); s.quadraticCurveTo(-.16, .13, -.15, 0); }, 1.95, .01), 'blued', -.14, 1.0, 0);
  if (o.ribs) for (let i = 0; i < 5; i++) b.add(box(.04, .03, .2, .01), 'blued', -.85 + i * .16, 1.165, 0);
  b.add(cylX(.04, .05), 'steel', -1.15, 1.06, 0);
  // remaches de los muñones y relieves guía del cargador (rasgos clásicos del AK)
  for (const z of [.152, -.152]) {
    for (const [x, y] of [[.86, .66], [.94, .74], [.86, .82], [-.92, .66], [-1.0, .76], [-.84, .76], [.2, .6], [-.3, .6]]) rivet(b, x, y, z, .016);
    b.add(ext('akdimple', s => s.absellipse(0, 0, .09, .035, 0, Math.PI * 2, false), .012, .006), 'blued', .78, .74, z * 1.03);
  }
  // bloque del alza
  b.add(box(.32, .2, .28, .03), 'blued', 1.02, 1.1, 0);
  if (!o.rail) { b.add(box(.32, .03, .12, .01), 'blued', 1.0, 1.22, 0, 0, 0, .05); b.add(box(.04, .05, .08, .01), 'blued', 1.12, 1.25, 0); }
  // palanca selectora grande del lado derecho
  b.add(ext('aksel', poly([[-.62, .04], [.5, .04], [.56, -.02], [.5, -.07], [-.62, -.04]]), .014, .004), 'blued', .3, .9, .163);
  b.add(cylZ(.035, .03), 'steel', -.3, .9, .15);
  // manija de carga del portacerrojos (lado derecho)
  b.add(box(.06, .05, .1, .012), 'steel', .72, 1.0, .19);
  b.add(sphere(.055), 'steel', .72, 1.0, .25);
  triggerRing(b, 'akguard', [[-.25, .58], [.48, .58], [.42, .32], [-.12, .3], [-.25, .4]], [[-.17, .53], [.38, .53], [.33, .37], [-.08, .36], [-.17, .44]], .06, 'blued');
  trigger(b, .05, .54);
  b.add(box(.06, .1, .08, .015), 'blued', .52, .5, 0);
  b.pin(-.6, .7, .15, .03); b.pin(.65, .65, .15, .03);
  if (o.dovetail) { b.add(box(.9, .12, .03, .01), 'blued', -.2, .85, -.155); for (let i = 0; i < 6; i++) b.add(box(.012, .1, .01, .003), 'hole', -.6 + i * .16, .85, -.172); }
  b.add(box(.12, .36, .3, .03), 'blued', -1.18, .9, 0);
}
function buildAK74M(b: Builder) {
  akReceiver(b, { ribs: true, dovetail: true });
  barrel(b, 1.05, 5.05, .085, 'ak');
  // guardamanos de polímero (inferior con estrías) y cubretubo de gases
  b.add(ext('ak74hg', poly([[1.35, 1.02], [3.05, 1.02], [3.1, .93], [3.05, .74], [1.4, .74], [1.35, .82]]), .34, .03), 'body');
  for (let i = 0; i < 6; i++) b.add(box(.04, .2, .37, .01), 'body', 1.6 + i * .24, .82, 0);
  b.add(box(.06, .12, .38, .02), 'blued', 1.33, .9, 0);
  b.add(box(.08, .04, .03, .01), 'blued', 1.33, .96, .2);
  b.add(extX('ak74gt', s => roundRect(s, .26, .18, .08), 1.5, .02), 'body', 2.2, 1.25, 0);
  b.add(cylX(.07, .7), 'blued', 3.3, 1.25, 0);
  for (let i = 0; i < 3; i++) b.add(cylZ(.022, .15), 'hole', 3.2 + i * .1, 1.25, 0);
  b.add(box(.22, .38, .22, .04), 'blued', 3.75, 1.12, 0, 0, 0, -.35);
  // bloque de mira delantera con orejas, tetón de bayoneta y anilla
  b.add(box(.18, .32, .2, .03), 'blued', 4.6, 1.12, 0);
  for (const z of [.06, -.06]) b.add(box(.04, .16, .03, .008), 'blued', 4.6, 1.34, z);
  b.add(box(.015, .12, .015, .004), 'steel', 4.6, 1.33, 0);
  b.add(box(.14, .06, .1, .015), 'blued', 4.62, .88, 0);
  swivel(b, 3.75, .88, 0, 0);
  b.add(cylX(.03, 1.9), 'steel', 3.8, .87, 0);
  b.add(sphere(.035), 'steel', 4.75, .87, 0);
}
function buildAK12(b: Builder) {
  akReceiver(b, { rail: true });
  b.rail(1.85, -.12, 1.17, 1, null, true);
  // diópter trasero del modelo 2023
  b.add(box(.12, .14, .16, .02), 'dark', -1.0, 1.32, 0);
  b.add(cylX(.03, .14), 'hole', -1.0, 1.33, 0);
  barrel(b, 1.05, 5.05, .085, 'ak12');
  b.add(extX('ak12hg', s => roundRect(s, .36, .44, .09), 1.75, .02), 'body', 2.28, 1.04, 0);
  b.rail(1.7, 2.28, 1.26, 1);
  b.rail(1.1, 2.6, .82, -1);
  for (let i = 0; i < 4; i++) for (const z of [.19, -.19]) b.add(slot(.22, .065), 'hole', 1.65 + i * .32, 1.02, z);
  b.add(box(.2, .3, .2, .03), 'blued', 3.5, 1.08, 0);
  b.add(box(.12, .14, .14, .02), 'dark', 3.5, 1.3, 0);
  b.add(box(.012, .08, .012, .004), 'steel', 3.5, 1.4, 0);
  // selector de pulgar sobre la empuñadura (rasgo del AK-12)
  b.add(box(.06, .08, .12, .015), 'dark', -.15, .64, .16);
  swivel(b, 3.5, .9, 0, 0);
}
function buildACE(o: Opts) {
  return (b: Builder) => {
    akReceiver(b, { rail: true });
    b.rail(o.hgEnd + 1.12, (o.hgEnd - 1.12) / 2, 1.17, 1, null, true);
    // carcasa inferior de polímero con empuñadura integrada
    b.add(ext('acelow', s => { s.moveTo(-.95, .62); s.lineTo(.5, .62); s.lineTo(.5, .5); s.lineTo(-.15, .5); s.lineTo(-.28, .42); s.lineTo(-.36, -.25); s.quadraticCurveTo(-.4, -.34, -.5, -.33); s.lineTo(-.72, -.33); s.quadraticCurveTo(-.8, -.3, -.78, -.2); s.lineTo(-.62, .4); s.lineTo(-.95, .5); s.closePath(); }, .3, .03), 'grip');
    // palanca selectora de pulgar estilo Galil (lado izquierdo)
    b.add(ext('acesel', poly([[0, 0], [.22, .02], [.24, -.03], [0, -.05]]), .02, .006), 'dark', -.55, .55, -.198);
    const L = o.hgEnd - 1.15, c = (o.hgEnd + 1.15) / 2;
    b.add(extX('acehg' + o.hgEnd, s => roundRect(s, .4, .42, .1), L, .02), 'body', c, 1.0, 0);
    for (let i = 0; i < Math.floor(L / .2); i++) for (const z of [.222, -.222]) b.add(box(.1, .05, .01, .012), 'hole', 1.3 + i * .2, 1.05, z);
    b.rail(L - .1, c, .79, -1);
    sideRail(b, o.hgEnd - .4, .5, .2);
    barrel(b, 1.05, o.muzzle, .085, 'ace');
    b.add(box(.18, .26, .2, .03), 'blued', o.hgEnd + .14, 1.05, 0);
    foldSight(b, o.hgEnd - .1, 1.26, true); foldSight(b, -.95, 1.26, false);
    // manija de carga del lado izquierdo, doblada hacia arriba (rasgo Galil)
    b.add(box(.06, .05, .12, .012), 'steel', .72, 1.0, -.2);
    b.add(cylY(.03, .14), 'steel', .72, 1.08, -.26);
    b.add(sphere(.04), 'steel', .72, 1.16, -.26);
    // tubo plegable para culatas tipo AR
    b.add(box(.14, .32, .3, .04), 'blued', -1.2, 1.0, 0);
    b.add(cylY(.04, .36), 'steel', -1.27, 1.0, 0);
    b.add(lathe('acetube', [[0, -2.95], [.14, -2.95], [.15, -2.93], [.15, -1.28], [0, -1.28]]), 'alu', 0, 1, 0);
  };
}

/* ───────────────────────── FN SCAR ───────────────────────── */
function buildSCAR(o: Opts) {
  return (b: Builder) => {
    const f = o.heavy ? 3.1 : 2.95;
    b.add(ext('scarup' + f, s => {
      s.moveTo(-1.45, 1.3); s.lineTo(f, 1.3); s.lineTo(f, .86); s.quadraticCurveTo(f, .8, f - .06, .8);
      s.lineTo(1.0, .8); s.lineTo(.95, .72); s.lineTo(-1.4, .72); s.quadraticCurveTo(-1.45, .72, -1.45, .78); s.closePath();
    }, .4, .022), 'alu');
    b.rail(f + 1.4, (f - 1.45) / 2 + .02, 1.3, 1, null, true);
    b.rail(1.15, f - .62, .8, -1);
    for (const z of [.22, -.22]) sideRail(b, f - .55, .9, z);
    // nervios inferiores del cajón monolítico
    for (const z of [.225, -.225]) { b.add(box(1.9, .035, .02, .01), 'alu', .0, .84, z); b.add(box(1.9, .02, .015, .006), 'hole', .0, .9, z); }
    // canal y manija de carga lateral (izquierda), inclinada hacia arriba
    b.add(box(1.3, .035, .01, .005), 'hole', .35, 1.08, -.222);
    b.add(box(.14, .06, .08, .015), 'dark', 1.0, 1.08, -.26);
    b.add(ext('scarch', s => { s.moveTo(0, 0); s.lineTo(.08, 0); s.quadraticCurveTo(.1, .08, .06, .16); s.lineTo(.0, .16); s.quadraticCurveTo(.03, .08, 0, 0); }, .08, .015), 'dark', .98, 1.06, -.32);
    b.add(box(.5, .12, .01, .005), 'hole', .1, .96, .222);
    // separación visible entre cajón superior (aluminio) e inferior (polímero)
    for (const z of [.21, -.21]) b.add(box(2.4, .012, .01, .004), 'hole', -.25, .735, z);
    b.add(ext('scarlow' + (o.heavy ? 'h' : 'l'), s => {
      s.moveTo(-1.45, .74); s.lineTo(.95, .74); s.lineTo(.95, .6); s.quadraticCurveTo(.92, .55, .88, .55);
      s.lineTo(.9, .08); s.quadraticCurveTo(.9, .02, .84, .02); s.lineTo(.28, .02); s.quadraticCurveTo(.22, .02, .22, .08);
      s.lineTo(.22, .3); s.lineTo(-.55, .3); s.quadraticCurveTo(-.62, .32, -.62, .42); s.lineTo(-1.2, .5); s.quadraticCurveTo(-1.45, .52, -1.45, .6); s.closePath();
    }, .36, .025), 'body');
    triggerRing(b, 'scarguard', [[-.52, .31], [.16, .31], [.16, .04], [-.4, .04], [-.52, .12]], [[-.45, .26], [.1, .26], [.1, .1], [-.38, .1], [-.45, .15]], .1, 'body');
    trigger(b, -.18, .29);
    for (const z of [.2, -.2]) b.add(box(.16, .045, .025, .01), 'dark', -.55, .58, z, 0, 0, -.25);
    for (const [dx, dy] of [[-.08, .06], [0, .1], [.08, .06]]) paintDot(b, -.55 + dx, .58 + dy, .207);
    b.pin(-.9, .62, .2, .035); b.pin(.7, .62, .2, .035);
    b.add(box(.14, .3, .42, .04), 'alu', -1.47, 1.0, 0);
    qd(b, -1.35, .9, .215); qd(b, -1.35, .9, -.215);
    barrel(b, f, o.muzzle, o.heavy ? .105 : .095, 'scar' + (o.heavy ? 'h' : 'l'));
    b.add(box(.12, .22, .22, .03), 'blued', f + .1, 1.05, 0);
    b.add(cylX(.05, .08), 'knurl', f + .1, 1.2, 0);
    foldSight(b, f - .12, 1.39, true); foldSight(b, -1.25, 1.39, false);
  };
}

/* ───────────────────────── HK G36 ───────────────────────── */
function buildG36(o: Opts) {
  return (b: Builder) => {
    b.add(ext('g36rec', s => {
      s.moveTo(-1.25, 1.2); s.lineTo(1.55, 1.2); s.lineTo(1.55, .78); s.quadraticCurveTo(1.55, .66, 1.42, .62);
      s.lineTo(-1.1, .62); s.quadraticCurveTo(-1.25, .64, -1.25, .76); s.closePath();
    }, .32, .03), 'body');
    // nervios laterales del cajón de polímero y pasadores de desarme
    for (let i = 0; i < 4; i++) for (const z of [.172, -.172]) b.add(box(.3, .025, .01, .006), 'hole', -.9 + i * .38, .82, z);
    for (const x of [-1.0, -.1, .9, 1.4]) b.pin(x, .7, .17, .028);
    if (o.handle) {
      // asa de transporte con visor integrado (G36K)
      b.add(ext('g36handle', poly([[-1.05, 1.2], [-.95, 1.56], [1.1, 1.56], [1.25, 1.2]], [[[-.7, 1.27], [.95, 1.27], [.95, 1.46], [-.7, 1.46]]]), .28, .03), 'body');
      b.add(lathe('g36optic', [[0, -1.0], [.11, -1.0], [.13, -.92], [.13, -.55], [.1, -.5], [0, -.5]], 40), 'dark', 0, 1.38, 0);
      b.add(disc(.1), 'glass', -.49, 1.38, 0);
      b.add(lathe('g36dome', [[0, -.15], [.09, -.15], [.1, -.05], [.06, .12], [0, .14]], 32), 'dark', -.6, 1.62, 0, 0, 0, Math.PI / 2);
      b.rail(1.0, .6, 1.56, 1);
    } else b.rail(2.6, .15, 1.2, 1, null, true);
    // manija de carga plegable bajo el riel/asa
    b.add(box(.12, .06, .22, .02), 'dark', 1.3, 1.16, 0);
    b.add(box(.05, .05, .1, .015), 'dark', 1.3, 1.18, .14);
    b.add(box(.5, .26, .3, .04), 'body', .6, .5, 0);
    b.add(box(.12, .1, .2, .02), 'body', .9, .42, 0);
    b.add(ext('g36grip', s => { s.moveTo(-.32, .64); s.lineTo(.42, .64); s.lineTo(.42, .3); s.lineTo(.3, .3); s.lineTo(.3, .56); s.lineTo(-.12, .56); s.lineTo(-.2, .5); s.lineTo(-.3, -.22); s.quadraticCurveTo(-.33, -.3, -.42, -.3); s.lineTo(-.62, -.3); s.quadraticCurveTo(-.7, -.27, -.68, -.18); s.lineTo(-.5, .5); s.closePath(); }, .3, .03), 'grip');
    triggerRing(b, 'g36guard', [[-.18, .5], [.3, .5], [.3, .26], [-.1, .26], [-.18, .32]], [[-.12, .45], [.25, .45], [.25, .31], [-.06, .31], [-.12, .35]], .08, 'body');
    trigger(b, .06, .44);
    for (const z of [.17, -.17]) b.add(box(.14, .05, .025, .01), 'dark', -.3, .62, z, 0, 0, -.2);
    for (const [dx, dy] of [[-.07, .05], [0, .08], [.07, .05]]) paintDot(b, -.3 + dx, .62 + dy, .186);
    const L = o.hgEnd - 1.55, c = (o.hgEnd + 1.55) / 2;
    b.add(extX('g36hg' + o.hgEnd, s => roundRect(s, .34, .44, .12), L, .02), 'body', c, .96, 0);
    for (let i = 0; i < Math.floor(L / .18); i++) for (const z of [.186, -.186]) b.add(box(.1, .06, .01, .01), 'hole', 1.65 + i * .18, .98, z);
    b.rail(Math.min(.6, L - .1), o.hgEnd - .35, .74, -1);
    b.add(box(.1, .28, .3, .03), 'body', -1.27, 1.0, 0);
    swivel(b, -1.2, .7, .17, 0);
    barrel(b, 1.55, o.muzzle, .085, 'g36');
    b.add(box(.12, .14, .16, .02), 'blued', o.hgEnd + .1, .96, 0);
  };
}

/* ───────────────────────── CZ BREN 2 ───────────────────────── */
function buildBREN(o: Opts) {
  return (b: Builder) => {
    const f = o.hgEnd;
    b.add(ext('brenup' + f, s => {
      s.moveTo(-1.05, 1.27); s.lineTo(f, 1.27); s.lineTo(f, .82); s.quadraticCurveTo(f, .76, f - .06, .76);
      s.lineTo(1.0, .76); s.lineTo(.95, .72); s.lineTo(-1.0, .72); s.quadraticCurveTo(-1.05, .72, -1.05, .78); s.closePath();
    }, .38, .02), 'alu');
    b.rail(f + 1.03, (f - 1.05) / 2, 1.27, 1, null, true);
    for (let i = 0; i < Math.floor((f - 1.2) / .36); i++) for (const z of [.208, -.208]) b.add(slot(.24, .07), 'hole', 1.3 + i * .36, 1.0, z);
    b.rail(Math.min(.8, f - 1.3), f - .5, .76, -1);
    sideRail(b, f - .35, .45, .2);
    // escalón característico del cajón superior y manija de carga izquierda
    for (const z of [.214, -.214]) b.add(box(1.8, .03, .015, .008), 'alu', -.05, 1.1, z);
    b.add(box(.18, .08, .14, .03), 'dark', 1.0, 1.05, -.26);
    b.add(cylZ(.04, .06), 'dark', 1.0, 1.05, -.34);
    b.add(box(.46, .12, .01, .005), 'hole', .15, .96, .2);
    b.add(ext('brenlow', s => { s.moveTo(-1.05, .74); s.lineTo(.95, .74); s.lineTo(.95, .6); s.lineTo(.9, .02); s.lineTo(.36, .02); s.lineTo(.36, .3); s.lineTo(-.15, .3); s.lineTo(-.28, .25); s.lineTo(-.38, -.3); s.quadraticCurveTo(-.42, -.38, -.52, -.38); s.lineTo(-.72, -.38); s.quadraticCurveTo(-.8, -.35, -.78, -.25); s.lineTo(-.62, .42); s.lineTo(-1.05, .55); s.closePath(); }, .34, .03), 'body');
    b.add(ext('brengripp', poly([[-.32, .2], [-.6, .3], [-.74, -.3], [-.42, -.33]]), .38, .015), 'grip');
    triggerRing(b, 'brenguard', [[-.2, .31], [.36, .31], [.36, .06], [-.1, .06], [-.2, .14]], [[-.13, .26], [.3, .26], [.3, .11], [-.05, .11], [-.13, .16]], .1, 'body');
    trigger(b, .06, .29);
    for (const z of [.19, -.19]) b.add(box(.15, .045, .025, .01), 'dark', -.45, .6, z, 0, 0, -.25);
    for (const [dx, dy] of [[-.07, .06], [0, .09], [.07, .06]]) paintDot(b, -.45 + dx, .6 + dy, .205);
    b.pin(-.85, .62, .19, .03); b.pin(.7, .62, .19, .03);
    b.add(box(.12, .34, .4, .04), 'body', -1.08, .95, 0);
    qd(b, -.98, .82, .2); qd(b, -.98, .82, -.2);
    barrel(b, f, o.muzzle, .09, 'bren');
    // regulador de gases de 3 posiciones
    b.add(box(.12, .2, .22, .03), 'blued', f + .08, 1.08, 0);
    b.add(cylX(.055, .08), 'knurl', f + .18, 1.18, 0);
    for (let i = 0; i < 3; i++) paintDot(b, f + .23, 1.12 + i * .03, 0);
    foldSight(b, f - .1, 1.36, true); foldSight(b, -.85, 1.36, false);
  };
}

/* ───────────────────────── Fichas técnicas ───────────────────────── */
const AIRSOFT_AR = 'AEG con gearbox V2, cargadores tipo M4; también GBB';
const AIRSOFT_AK = 'AEG con gearbox V3, cargadores tipo AK';

/** Modelos con variantes. Cada variante se registra como plataforma `${model.id}_${variant.id}`. */
export const MODELS: Model[] = [
  { id: 'm4', name: 'M4 / AR-15', maker: 'Colt (diseño Stoner) · EE. UU.', group: 'Familia AR-15',
    common: { calibre: '5,56×45 mm NATO', sistema: 'Impulsión directa de gases · cerrojo rotativo', cadencia: '700–970 disp./min', alcance: '500 m (puntual) · 600 m (área)', cargador: 'STANAG 30 (caja recta curva)', airsoft: AIRSOFT_AR, fuente: 'Wikipedia (M4 carbine)' },
    variants: [
      { id: 'm4a1', name: 'M4A1', barrel: 14.5, color: 'negro', specs: { peso: '2,88 kg vacío · 3,4 kg con 30 cart.', cañon: '368 mm (14,5")', velocidad: '880 m/s (M855)' },
        o: { hg: 'm4', hgEnd: arHgEnd(7), muzzle: arMuzzle(14.5), sights: true }, defaults: { muzzle: 'mz_a2', stock: 'stock_m4', grip: 'grip_a2' } },
      { id: 'ar15', name: 'AR-15 M-LOK 16"', barrel: 16, color: 'negro', specs: { peso: '≈ 3,0 kg (según configuración)', cañon: '406 mm (16")', velocidad: '≈ 900 m/s (según munición)', cadencia: 'Semiautomático (civil)' },
        o: { hg: 'mlok', hgEnd: arHgEnd(13), muzzle: arMuzzle(16), sights: true }, defaults: { muzzle: 'mz_comp' } },
    ] },
  { id: 'hk416', name: 'HK416', maker: 'Heckler & Koch · Alemania', group: 'Familia AR-15',
    common: { calibre: '5,56×45 mm NATO', sistema: 'Pistón de recorrido corto · cerrojo rotativo multitetón', cadencia: '850 disp./min', cargador: 'STANAG 30 (acero HK)', airsoft: AIRSOFT_AR, fuente: 'Wikipedia, H&K, Bundeswehr (vía TFB)' },
    variants: [
      { id: 'a5', name: 'A5 14,5"', barrel: 14.5, color: 'negro', w: 3500, specs: { peso: '3,12–3,85 kg vacío (11"–20")', cañon: '368 mm (14,5"); también 11", 16,5", 20"', velocidad: '882 m/s (14,5")', alcance: '400 m puntual (14,5")' },
        o: { hg: 'hk', hgEnd: arHgEnd(13.2), muzzle: arMuzzle(14.5), sights: true, piston: 'hk', hkLower: true }, defaults: { muzzle: 'mz_hk', stock: 'stock_hk', mag: 'mag_hk', grip: 'grip_ergo' } },
      { id: 'a7', name: 'A7 (G95)', barrel: 14.5, color: 'tan', specs: { peso: '3,67 kg sin cargador', cañon: '368 mm (14,5")', velocidad: '≈ 880 m/s (14,5")', alcance: '400 m puntual (14,5")', extra: 'Selector a 45°; acabado Flat Dark Earth' },
        o: { hg: 'hkey', hgEnd: arHgEnd(13.2), muzzle: arMuzzle(14.5), sights: true, piston: 'hk', hkLower: true }, defaults: { muzzle: 'mz_hk', stock: 'stock_hk', mag: 'rmag_poly', grip: 'grip_ergo' } },
      { id: 'a8', name: 'A8 (G95A1)', barrel: 16.5, color: 'tan', specs: { peso: '3,4 kg (G95A1) · 3,3 kg (G95KA1, 14")', cañon: '419 mm (16,5")', velocidad: '≈ 890 m/s (16,5")', alcance: 'Hasta 450 m', extra: 'Guardamanos más corto y culata con apoyo regulable' },
        o: { hg: 'hkey', hgEnd: arHgEnd(11.5), muzzle: arMuzzle(16.5), sights: true, piston: 'hk', hkLower: true }, defaults: { muzzle: 'mz_hk', stock: 'stock_hk', mag: 'rmag_poly', grip: 'grip_ergo' } },
    ] },
  { id: 'mk18', name: 'MK18 (RIS II)', maker: 'Daniel Defense · EE. UU.', group: 'Familia AR-15',
    common: { calibre: '5,56×45 mm NATO', sistema: 'Impulsión directa de gases · cerrojo rotativo', cadencia: '700–950 disp./min (militar)', cargador: 'STANAG 30/32', airsoft: AIRSOFT_AR, fuente: 'Daniel Defense / distribuidores' },
    variants: [
      { id: 'mod1', name: 'Mod 1 10,3"', barrel: 10.3, color: 'tan', specs: { peso: '2,67 kg (5,88 lb)', cañon: '262 mm (10,3")', velocidad: '≈ 790 m/s (≈ 2.600 fps)', alcance: '≈ 300 m', extra: 'Guardamanos cuádruple RIS II de 9,55"' },
        o: { hg: 'ris', hgEnd: arHgEnd(9.55), muzzle: arMuzzle(10.3), sights: true, covers: true }, defaults: { muzzle: 'mz_a2', grip: 'grip_ergo' } },
    ] },
  { id: 'sig516', name: 'SIG516', maker: 'SIG Sauer · EE. UU.', group: 'Familia AR-15',
    common: { calibre: '5,56×45 mm NATO', sistema: 'Pistón corto con varilla de empuje (regulador de 4 posiciones) · cerrojo rotativo', cadencia: '750–950 disp./min', alcance: '500 m', cargador: 'STANAG 10/20/30', airsoft: AIRSOFT_AR, fuente: 'SIG Sauer (manual), Wikipedia' },
    variants: [
      { id: 'p145', name: 'Patrol 14,5"', barrel: 14.5, color: 'negro', specs: { peso: '3,29 kg sin cargador', cañon: '370 mm (14,6")', velocidad: '≈ 850 m/s' },
        o: { hg: 'ris', hgEnd: arHgEnd(10), muzzle: arMuzzle(14.6), sights: true, piston: 'sig' }, defaults: { muzzle: 'mz_comp' } },
      { id: 'p16', name: 'Patrol 16"', barrel: 16, color: 'negro', specs: { peso: '3,47 kg sin cargador', cañon: '408 mm (16,1")', velocidad: '850 m/s (406 mm)' },
        o: { hg: 'ris', hgEnd: arHgEnd(11), muzzle: arMuzzle(16.1), sights: true, piston: 'sig' }, defaults: { muzzle: 'mz_comp' } },
    ] },
  { id: 'l119', name: 'L119A2', maker: 'Colt Canada · Reino Unido (UKSF)', group: 'Familia AR-15',
    common: { calibre: '5,56×45 mm NATO', sistema: 'Impulsión directa de gases · cerrojo rotativo', cadencia: '700–950 disp./min (familia C8)', alcance: '400 m (miras) · 550 m (óptica) (C8)', cargador: 'STANAG 30', airsoft: AIRSOFT_AR, fuente: 'Colt Canada / Wikipedia (C8), Small Arms Review' },
    variants: [
      { id: 'iur157', name: 'IUR 15,7"', barrel: 15.7, color: 'negro', specs: { peso: 'No publicado oficialmente', cañon: '400 mm (15,7")', velocidad: '≈ 895 m/s (cañón SFW)', extra: 'Cajón superior integrado (IUR), mandos ambidiestros' },
        o: { hg: 'iur', hgEnd: arHgEnd(12.5), muzzle: arMuzzle(15.7), sights: true }, defaults: { muzzle: 'mz_prong', grip: 'grip_ergo' } },
      { id: 'iur10', name: 'IUR 10"', barrel: 10, color: 'negro', specs: { peso: 'No publicado oficialmente', cañon: '254 mm (10")', velocidad: 'Menor que la versión de 15,7"', extra: 'Versión corta para CQB' },
        o: { hg: 'iur', hgEnd: arHgEnd(9.5), muzzle: arMuzzle(10), sights: true }, defaults: { muzzle: 'mz_prong', grip: 'grip_ergo' } },
    ] },
  { id: 'mcx', name: 'SIG MCX Virtus', maker: 'SIG Sauer · EE. UU.', group: 'Familia AR-15',
    common: { calibre: '5,56×45 mm NATO · .300 BLK', sistema: 'Pistón corto (sin tubo de amortiguador) · cerrojo rotativo', cadencia: '800–900 disp./min', alcance: 'Depende del cañón y la munición', cargador: 'STANAG 30', airsoft: 'AEG y GBB (sistema propio según fabricante)', fuente: 'Wikipedia (SIG MCX), SIG Sauer' },
    variants: [
      { id: 's9', name: 'SBR 9"', barrel: 9, color: 'gris', specs: { peso: '2,61 kg', cañon: '229 mm (9")', velocidad: 'No publicada' },
        o: { hg: 'mcx', hgEnd: arHgEnd(8.5), muzzle: arMuzzle(9), buffer: false, noFA: true }, defaults: { muzzle: 'mz_prong' } },
      { id: 's115', name: 'SBR 11,5"', barrel: 11.5, color: 'gris', specs: { peso: '2,72 kg', cañon: '292 mm (11,5")', velocidad: 'No publicada' },
        o: { hg: 'mcx', hgEnd: arHgEnd(11), muzzle: arMuzzle(11.5), buffer: false, noFA: true }, defaults: { muzzle: 'mz_prong' } },
      { id: 'p16', name: 'Patrol 16"', barrel: 16, color: 'gris', specs: { peso: '3,6 kg (7,9 lb)', cañon: '406 mm (16")', velocidad: 'No publicada' },
        o: { hg: 'mcx', hgEnd: arHgEnd(15), muzzle: arMuzzle(16), buffer: false, noFA: true }, defaults: { muzzle: 'mz_prong' } },
    ] },
  { id: 'ak74m', name: 'AK-74M', maker: 'Kalashnikov Concern · Rusia', group: 'Familia Kalashnikov',
    common: { calibre: '5,45×39 mm', sistema: 'Pistón de recorrido largo · cerrojo rotativo', cadencia: '650 disp./min', alcance: '500 m (puntual) · 800 m (área)', cargador: '30 cart. polímero (45 RPK-74, 60 cofre)', airsoft: AIRSOFT_AK, fuente: 'Wikipedia (AK-74)' },
    variants: [
      { id: 'std', name: 'Estándar', barrel: 16.3, color: 'negro', specs: { peso: '3,4 kg sin cargador', cañon: '415 mm', velocidad: '880–900 m/s', extra: 'Culata plegable lateral y riel cola de milano para ópticas' },
        build: buildAK74M, defaults: { muzzle: 'mz_ak74', mag: 'mag_ak545', stock: 'stock_ak74m', grip: 'grip_ak' } },
    ] },
  { id: 'ak12', name: 'AK-12', maker: 'Kalashnikov Concern · Rusia', group: 'Familia Kalashnikov',
    common: { calibre: '5,45×39 mm', sistema: 'Pistón de recorrido largo · cerrojo rotativo', cadencia: '700 disp./min', alcance: '800 m (fabricante) · 440 m tiro tenso', cargador: '30 cart. polímero', airsoft: AIRSOFT_AK, fuente: 'Rostec, Army Recognition, Wikipedia' },
    variants: [
      { id: 'm2023', name: 'Modelo 2023', barrel: 16.3, color: 'negro', specs: { peso: '3,6 kg sin cargador', cañon: '415 mm', velocidad: '900–915 m/s', extra: 'Apagallamas ranurado fijo y culata plegable regulable' },
        build: buildAK12, defaults: { muzzle: 'mz_ak12', mag: 'mag_ak12', stock: 'stock_ak12', grip: 'grip_ak12' } },
    ] },
  { id: 'ace', name: 'Galil ACE', maker: 'IWI · Israel', group: 'Familia Kalashnikov',
    common: { calibre: '5,56×45 mm NATO (ACE 21/22/23)', sistema: 'Pistón de recorrido largo (tipo Kalashnikov) · cerrojo rotativo', cadencia: '680–880 disp./min', alcance: '300–500 m', cargador: 'Galil 35 cart. (ACE-N: STANAG)', airsoft: 'AEG (gearbox V3 en la mayoría de réplicas)', fuente: 'Wikipedia (IWI ACE), IMFDB' },
    variants: [
      { id: '21', name: 'ACE 21 8,5"', barrel: 8.5, color: 'negro', specs: { peso: '3,0 kg', cañon: '216 mm (8,5")', velocidad: '710 m/s' }, o: { hgEnd: 2.6, muzzle: 3.2 } },
      { id: '22', name: 'ACE 22 13"', barrel: 13, color: 'negro', specs: { peso: '3,4 kg', cañon: '335 mm (13,2")', velocidad: '850 m/s' }, o: { hgEnd: 3.1, muzzle: 4.4 } },
      { id: '23', name: 'ACE 23 18"', barrel: 18, color: 'negro', specs: { peso: '3,6 kg', cañon: '463 mm (18,2")', velocidad: '915 m/s' }, o: { hgEnd: 3.1, muzzle: 5.68 } },
    ] },
  { id: 'scar', name: 'FN SCAR', maker: 'FN Herstal · Bélgica', group: 'Otros',
    common: { sistema: 'Pistón de recorrido corto · cerrojo rotativo', airsoft: 'AEG (gearbox propio/V2 modificado según fabricante) y GBB', fuente: 'FN America (catálogo), Wikipedia' },
    variants: [
      { id: 'l', name: 'SCAR-L (Mk16)', barrel: 14, color: 'tan', specs: { calibre: '5,56×45 mm NATO', peso: '3,29 kg (STD)', cañon: '356 mm (14")', velocidad: '870 m/s (M855)', cadencia: '625 disp./min', alcance: '500 m', cargador: 'STANAG 30' },
        o: { hgEnd: 2.95, muzzle: 4.05 }, defaults: { muzzle: 'mz_flash', mag: 'rmag_poly', stock: 'stock_scar', grip: 'grip_a2' }, tags: ['stanag'] },
      { id: 'h', name: 'SCAR-H (Mk17)', barrel: 16, color: 'tan', specs: { calibre: '7,62×51 mm NATO', peso: '3,58 kg (STD)', cañon: '406 mm (16")', velocidad: '714 m/s (M80)', cadencia: '600 disp./min', alcance: '700 m puntual (FN, 16")', cargador: '20 cart. propietario' },
        o: { hgEnd: 3.1, muzzle: 4.75, heavy: true }, defaults: { muzzle: 'mz_flash', mag: 'mag_scarh', stock: 'stock_scar', grip: 'grip_a2' }, tags: ['scarh-mag'] },
    ] },
  { id: 'g36', name: 'HK G36', maker: 'Heckler & Koch · Alemania', group: 'Otros',
    common: { calibre: '5,56×45 mm NATO', sistema: 'Pistón de recorrido corto · cerrojo rotativo', cadencia: '750 disp./min', cargador: '30 cart. polímero translúcido (C-Mag 100)', airsoft: 'AEG con gearbox V3', fuente: 'Wikipedia (HK G36), weaponsystems.net' },
    variants: [
      { id: 'c', name: 'G36C', barrel: 9, color: 'negro', specs: { peso: '2,82 kg', cañon: '228 mm (9")', velocidad: 'No publicada (menor que G36K)', alcance: 'Corto alcance (sin dato oficial)' }, o: { hgEnd: 2.35, muzzle: 2.95 } },
      { id: 'k', name: 'G36K', barrel: 12.5, color: 'negro', specs: { peso: '3,30 kg', cañon: '318 mm (12,5")', velocidad: '850 m/s', alcance: 'Hasta 600 m (G36 estándar; menor en K)', extra: 'Asa de transporte con visor integrado' }, o: { hgEnd: 3.0, muzzle: 3.85, handle: true } },
    ] },
  { id: 'bren2', name: 'CZ BREN 2', maker: 'Česká zbrojovka · Chequia', group: 'Otros',
    common: { calibre: '5,56×45 mm NATO (también 7,62×39)', sistema: 'Pistón de recorrido corto (gas regulable) · cerrojo rotativo', cadencia: '≈ 850 disp./min (760 ±100 según fuente)', alcance: '≈ 500 m (dato del BREN 805 A1)', cargador: 'STANAG 30', airsoft: 'AEG (réplicas con licencia, sistema según fabricante)', fuente: 'Wikipedia, Modern Firearms, Shephard' },
    variants: [
      { id: '8', name: '8"', barrel: 8, color: 'od', specs: { peso: '≈ 2,9 kg', cañon: '207 mm (8,1")', velocidad: 'No publicada' }, o: { hgEnd: 2.75, muzzle: 3.0 } },
      { id: '11', name: '11"', barrel: 11, color: 'od', specs: { peso: '3,05 kg', cañon: '280 mm (11")', velocidad: 'No publicada' }, o: { hgEnd: 3.4, muzzle: 3.75 } },
      { id: '14', name: '14"', barrel: 14, color: 'od', specs: { peso: '≈ 3,1 kg', cañon: '356 mm (14")', velocidad: 'No publicada' }, o: { hgEnd: 3.9, muzzle: 4.5 } },
    ] },
];

/* ───────────────────────── Construcción de plataformas ───────────────────────── */
const AR_TAGS = ['long', 'long-rifle', 'stanag', 'ar-tube', 'ar-grip'];
function platformFor(model: Model, v: Variant): [string, Platform] | null {
  const id = `${model.id}_${v.id}`;
  const specs = { ...model.common, ...v.specs };
  const base = { name: `${model.name} · ${v.name}`, short: model.name, variant: v.name, model: model.id, group: model.group, maker: model.maker, specs, baseColor: v.color, weight: v.w ?? weightOf(specs.peso) };
  const d = { ...(v.defaults || {}) };
  const o = v.o as Opts;
  const build = v.build as (b: Builder) => void;
  switch (model.id) {
    case 'm4': case 'hk416': case 'mk18': case 'sig516': case 'l119': case 'mcx': {
      const tags = model.id === 'mcx' ? ['long', 'long-rifle', 'stanag', 'mcx-stock', 'ar-grip'] : AR_TAGS;
      return [id, { ...base, build: buildAR(o), slots: arSlots(o), tags,
        defaults: { mag: 'rmag_metal', stock: model.id === 'mcx' ? 'stock_mcx' : 'rstock_ret', grip: 'grip_std', ...d } }];
    }
    case 'ak74m': return [id, { ...base, build: build, tags: ['long', 'long-rifle', 'ak545', 'ak74-stock', 'ak-grip'], defaults: d,
      slots: [
        { id: 'optic', type: 'optic', pos: [-.15, 1.45, 0], explode: EXP.optic, adapter: 'ak-side' },
        { id: 'muzzle', type: 'muzzle', pos: [5.05, 1, 0], explode: EXP.muzzle },
        { id: 'mag', type: 'mag', pos: [.78, .58, 0], explode: EXP.mag },
        { id: 'stock', type: 'stock', pos: [-1.24, .95, 0], explode: EXP.stock },
        { id: 'grip', type: 'grip', pos: [-.32, .58, 0], rot: [0, 0, -.28], explode: EXP.grip },
      ] }];
    case 'ak12': return [id, { ...base, build: build, tags: ['long', 'long-rifle', 'ak545', 'ak12-stock', 'ak-grip'], defaults: d,
      slots: [
        { id: 'optic', type: 'optic', pos: [-.2, 1.26, 0], explode: EXP.optic },
        { id: 'muzzle', type: 'muzzle', pos: [5.05, 1, 0], explode: EXP.muzzle },
        { id: 'under', type: 'under', pos: [2.6, .73, 0], explode: EXP.under },
        { id: 'mag', type: 'mag', pos: [.78, .58, 0], explode: EXP.mag },
        { id: 'stock', type: 'stock', pos: [-1.24, .95, 0], explode: EXP.stock },
        { id: 'grip', type: 'grip', pos: [-.32, .58, 0], rot: [0, 0, -.28], explode: EXP.grip },
      ] }];
    case 'ace': return [id, { ...base, build: buildACE(o), tags: ['long', 'long-rifle', 'galil-mag', 'ar-tube'], defaults: { mag: 'mag_galil', stock: 'rstock_ret', muzzle: 'mz_flash', ...d },
      slots: [
        { id: 'optic', type: 'optic', pos: [-.2, 1.26, 0], explode: EXP.optic },
        { id: 'muzzle', type: 'muzzle', pos: [o.muzzle, 1, 0], explode: EXP.muzzle },
        { id: 'under', type: 'under', pos: [o.hgEnd - .55, .7, 0], explode: EXP.under },
        { id: 'side', type: 'side', pos: [o.hgEnd - .4, 1, .29], explode: EXP.side },
        { id: 'mag', type: 'mag', pos: [.78, .58, 0], explode: EXP.mag },
        { id: 'stock', type: 'stock', pos: [-1.6, 1, 0], explode: EXP.stock },
      ] }];
    case 'scar': {
      const f = o.heavy ? 3.1 : 2.95;
      return [id, { ...base, build: buildSCAR(o), tags: ['long', 'long-rifle', 'scar-stock', 'ar-grip', ...(v.tags ?? [])], defaults: d,
        slots: [
          { id: 'optic', type: 'optic', pos: [-.35, 1.39, 0], explode: EXP.optic },
          { id: 'muzzle', type: 'muzzle', pos: [o.muzzle, 1, 0], explode: EXP.muzzle },
          { id: 'under', type: 'under', pos: [f - .6, .71, 0], explode: EXP.under },
          { id: 'side', type: 'side', pos: [f - .55, 1, .31], explode: EXP.side },
          { id: 'mag', type: 'mag', pos: [.56, .03, 0], scale: 1.12, explode: EXP.mag },
          { id: 'stock', type: 'stock', pos: [-1.54, 1.0, 0], explode: EXP.stock },
          { id: 'grip', type: 'grip', pos: [-.75, .32, 0], rot: [0, 0, -.36], explode: EXP.grip },
        ] }];
    }
    case 'g36': return [id, { ...base, build: buildG36(o), tags: ['long', 'long-rifle', 'g36-mag', 'g36-stock'], defaults: { mag: 'mag_g36', stock: 'stock_g36', muzzle: 'mz_flash' },
      slots: [
        { id: 'optic', type: 'optic', pos: o.handle ? [.55, 1.65, 0] : [.1, 1.29, 0], explode: EXP.optic },
        { id: 'muzzle', type: 'muzzle', pos: [o.muzzle, 1, 0], explode: EXP.muzzle },
        { id: 'under', type: 'under', pos: [o.hgEnd - .35, .65, 0], explode: EXP.under },
        { id: 'mag', type: 'mag', pos: [.6, .37, 0], explode: EXP.mag },
        { id: 'stock', type: 'stock', pos: [-1.32, 1.0, 0], explode: EXP.stock },
      ] }];
    case 'bren2': return [id, { ...base, build: buildBREN(o), tags: ['long', 'long-rifle', 'stanag', 'bren-stock'], defaults: { mag: 'rmag_poly', stock: 'stock_bren', muzzle: 'mz_flash' },
      slots: [
        { id: 'optic', type: 'optic', pos: [-.25, 1.36, 0], explode: EXP.optic },
        { id: 'muzzle', type: 'muzzle', pos: [o.muzzle, 1, 0], explode: EXP.muzzle },
        { id: 'under', type: 'under', pos: [o.hgEnd - .5, .67, 0], explode: EXP.under },
        { id: 'side', type: 'side', pos: [o.hgEnd - .35, 1, .29], explode: EXP.side },
        { id: 'mag', type: 'mag', pos: [.63, .03, 0], scale: 1.12, explode: EXP.mag },
        { id: 'stock', type: 'stock', pos: [-1.14, .95, 0], explode: EXP.stock },
      ] }];
  }
  return null;
}
function weightOf(txt?: string) {
  const m = /([\d]+,[\d]+|\d+)\s*kg/.exec(txt || '');
  return m ? Math.round(parseFloat(m[1].replace(',', '.')) * 1000) : 0;
}
export const REAL_PLATFORMS: Record<string, Platform> = Object.fromEntries(MODELS.flatMap(m => m.variants.map(v => platformFor(m, v))).filter((e): e is [string, Platform] => e !== null));

/** Adaptador de montura lateral de AK para ópticas (coordenadas locales de la ranura). */
export const ADAPTERS: Record<string, (b: Builder) => void> = {
  'ak-side': b => {
    b.add(box(.5, .06, .26, .015), 'blued', 0, -.03, 0);
    b.rail(.46, 0, 0, 1);
    b.add(box(.4, .5, .05, .015), 'blued', 0, -.3, -.2);
    b.add(box(.4, .08, .14, .015), 'blued', 0, -.06, -.12);
    b.add(box(.1, .06, .1, .02), 'dark', .12, -.5, -.25, 0, 0, .3);
  },
};

/* ───────────────────────── Piezas específicas ───────────────────────── */
const ak545Shape = (s: THREE.Shape) => { s.moveTo(-.22, 0); s.lineTo(.24, 0); s.quadraticCurveTo(.34, -.9, .82, -1.72); s.lineTo(.36, -1.9); s.quadraticCurveTo(-.05, -1.0, -.22, 0); };
const akMid = (y: number) => .4 * Math.pow(-y / 1.8, 1.8);

export const RIFLE_PARTS: Part[] = [
  { id: 'mz_a2', name: 'Apagallamas A2 (jaula)', type: 'muzzle', weight: 60, build(b) {
    b.add(lathe('a2fh', [[0, 0], [.1, 0], [.1, .06], [.105, .08], [.105, .45], [.09, .47], [0, .47]]), 'blued');
    for (const a of [-1.25, -.62, 0, .62, 1.25]) b.add(box(.22, .012, .04, .006), 'hole', .3, Math.cos(a) * .103, Math.sin(a) * .103, a, 0, 0);
    b.add(disc(.05), 'hole', .472, 0, 0);
  } },
  { id: 'mz_prong', name: 'Apagallamas de 3 puntas', type: 'muzzle', weight: 65, build(b) {
    b.add(lathe('prongbase', [[0, 0], [.1, 0], [.1, .12], [.105, .15], [0, .15]]), 'blued');
    for (let k = 0; k < 3; k++) {
      const g = b.group(.15, 0, 0, k * Math.PI * 2 / 3, 0, 0);
      b.add(ext('prong', s => { s.moveTo(0, .045); s.lineTo(.3, .03); s.lineTo(.32, 0); s.lineTo(0, 0); s.closePath(); }, .05, .01), 'blued', 0, .055, 0, 0, 0, 0, g);
    }
    b.add(disc(.05), 'hole', .152, 0, 0);
  } },
  { id: 'mz_hk', name: 'Apagallamas HK', type: 'muzzle', weight: 70, build(b) {
    b.add(lathe('hkfh', [[0, 0], [.105, 0], [.105, .1], [.1, .12], [.1, .44], [.085, .46], [0, .46]]), 'blued');
    for (let k = 0; k < 4; k++) { const a = k * Math.PI / 2 + Math.PI / 4; b.add(box(.2, .012, .045, .006), 'hole', .32, Math.cos(a) * .098, Math.sin(a) * .098, a, 0, 0); }
    b.add(disc(.05), 'hole', .462, 0, 0);
  } },
  { id: 'stock_m4', name: 'Culata M4 clásica', type: 'stock', fits: ['ar-tube'], weight: 230, build(b) {
    b.add(ext('m4stock', s => { s.moveTo(0, .17); s.lineTo(-1.25, .2); s.quadraticCurveTo(-1.33, .2, -1.33, .12); s.lineTo(-1.33, -.62); s.lineTo(-1.15, -.64); s.lineTo(-.55, -.2); s.lineTo(0, -.17); s.closePath();
      const h = new THREE.Path(); h.moveTo(-1.2, -.42); h.lineTo(-1.08, -.42); h.lineTo(-1.08, -.5); h.lineTo(-1.2, -.5); h.closePath(); s.holes.push(h); }, .26, .025), 'body');
    for (const z of [.157, -.157]) for (const [x, y] of [[-.4, 0], [-.7, 0], [-1.0, -.05], [-1.0, -.25]]) b.add(box(.22, .12, .01, .02), 'dark', x, y, z);
    b.add(box(.05, .86, .28, .015), 'dark', -1.36, -.22, 0);
    b.add(box(.3, .05, .1, .015), 'dark', -.36, -.2, 0);
  } },
  { id: 'grip_a2', name: 'Empuñadura A2', type: 'grip', fits: ['ar-grip'], weight: 70, build(b) {
    b.add(ext('a2grip', s => { s.moveTo(-.2, 0); s.lineTo(.2, 0); s.lineTo(.17, -.35); s.quadraticCurveTo(.26, -.42, .17, -.5); s.lineTo(.16, -.8); s.quadraticCurveTo(.15, -.88, .07, -.88); s.lineTo(-.12, -.88); s.quadraticCurveTo(-.22, -.87, -.22, -.76); s.closePath(); }, .22, .035), 'grip');
  } },
  { id: 'mz_ak74', name: 'Freno de boca AK-74', type: 'muzzle', weight: 70, build(b) {
    b.add(lathe('ak74brake', [[0, 0], [.115, 0], [.115, .78], [.1, .82], [0, .82]]), 'blued');
    for (const z of [.11, -.11]) b.add(cylZ(.05, .03), 'hole', .3, 0, z);
    b.add(box(.18, .012, .08, .004), 'hole', .55, .112, 0);
    b.add(disc(.05), 'hole', .822, 0, 0);
  } },
  { id: 'mz_ak12', name: 'Apagallamas ranurado AK-12', type: 'muzzle', weight: 90, build(b) {
    b.add(lathe('ak12fh', [[0, 0], [.12, 0], [.12, .08], [.13, .1], [.13, .7], [0, .7]]), 'blued');
    for (let k = 0; k < 6; k++) { const a = k * Math.PI / 3; b.add(box(.36, .012, .05, .006), 'hole', .48, Math.cos(a) * .126, Math.sin(a) * .126, a, 0, 0); }
    b.add(disc(.05), 'hole', .702, 0, 0);
  } },
  { id: 'mag_ak545', name: 'Cargador 5,45 polímero', type: 'mag', fits: ['ak545'], weight: 230, build(b) {
    b.add(ext('ak545', ak545Shape, .25, .014), 'body');
    ribsAlong(b, akMid, 3, -.45, .4, .29, 'body', .36);
    b.add(box(.36, .07, .3, .02), 'body', .6, -1.83, 0, 0, 0, .6);
  } },
  { id: 'mag_ak12', name: 'Cargador AK-12 (ventana)', type: 'mag', fits: ['ak545'], weight: 220, build(b) {
    b.add(ext('ak12m', ak545Shape, .26, .016), 'body');
    ribsAlong(b, akMid, 5, -.35, .26, .3, 'body', .34);
    b.add(box(.05, .6, .012, .006), 'glass', .14, -.9, .14, 0, 0, .55);
    b.add(box(.38, .08, .3, .02), 'grip', .6, -1.83, 0, 0, 0, .6);
  } },
  { id: 'mag_hk', name: 'Cargador HK de acero', type: 'mag', fits: ['stanag'], weight: 250, build(b) {
    b.add(ext('rmhk', s => { s.moveTo(-.27, 0); s.lineTo(.27, 0); s.quadraticCurveTo(.31, -.7, .52, -1.32); s.lineTo(0, -1.4); s.quadraticCurveTo(-.17, -.75, -.27, 0); }, .24, .014), 'blued');
    for (let i = 0; i < 3; i++) { const y = -.3 - i * .35; b.add(box(.06, .26, .26, .01), 'blued', .26 * Math.pow(-y / 1.36, 1.6) - .1, y, 0, 0, 0, .12 + i * .06); }
    b.add(box(.58, .07, .3, .025), 'rubber', .26, -1.385, 0, 0, 0, .15);
  } },
  { id: 'mag_scarh', name: 'Cargador 7,62 (20)', type: 'mag', fits: ['scarh-mag'], weight: 250, build(b) {
    b.add(ext('scarhm', s => { s.moveTo(-.3, 0); s.lineTo(.3, 0); s.quadraticCurveTo(.34, -.6, .44, -1.2); s.lineTo(-.14, -1.24); s.quadraticCurveTo(-.24, -.6, -.3, 0); }, .28, .015), 'blued');
    for (let i = 0; i < 2; i++) b.add(box(.4, .025, .3, .006), 'blued', .04 + i * .06, -.35 - i * .4, 0, 0, 0, .08);
    b.add(box(.62, .08, .32, .025), 'body', .15, -1.24, 0, 0, 0, .06);
  } },
  { id: 'mag_galil', name: 'Cargador Galil (35)', type: 'mag', fits: ['galil-mag'], weight: 280, build(b) {
    b.add(ext('galm', s => { s.moveTo(-.24, 0); s.lineTo(.26, 0); s.quadraticCurveTo(.34, -.8, .66, -1.6); s.lineTo(.18, -1.74); s.quadraticCurveTo(-.06, -.9, -.24, 0); }, .27, .014), 'blued');
    ribsAlong(b, (y: number) => .32 * Math.pow(-y / 1.7, 1.7), 3, -.4, .42, .3, 'blued', .38);
    b.add(box(.4, .07, .31, .02), 'blued', .42, -1.68, 0, 0, 0, .3);
  } },
  { id: 'mag_g36', name: 'Cargador G36 translúcido', type: 'mag', fits: ['g36-mag'], color: 'artico', weight: 130, build(b) {
    b.add(ext('g36m', s => { s.moveTo(-.24, 0); s.lineTo(.24, 0); s.quadraticCurveTo(.28, -.7, .46, -1.3); s.lineTo(-.02, -1.36); s.quadraticCurveTo(-.16, -.7, -.24, 0); }, .24, .014), 'clear');
    for (const z of [.14, -.14]) b.add(box(.08, .1, .04, .01), 'clear', -.2, -.25, z);
    b.add(box(.52, .07, .27, .02), 'dark', .22, -1.34, 0, 0, 0, .12);
  } },
  { id: 'stock_hk', name: 'Culata HK delgada', type: 'stock', fits: ['ar-tube'], weight: 290, build(b) {
    b.add(ext('hkstock', s => { s.moveTo(0, .2); s.lineTo(-1.32, .26); s.quadraticCurveTo(-1.42, .26, -1.42, .16); s.lineTo(-1.42, -.62); s.quadraticCurveTo(-1.42, -.7, -1.34, -.7); s.lineTo(-1.15, -.7); s.lineTo(-.7, -.18); s.lineTo(0, -.2); s.closePath(); }, .28, .035), 'body');
    b.add(ext('hkpad', poly([[0, .3], [.07, .3], [.07, -.74], [0, -.74]]), .3, .02), 'rubber', -1.5, 0, 0);
    b.add(box(.36, .05, .1, .02), 'dark', -.42, -.23, 0);
  } },
  { id: 'stock_ak74m', name: 'Culata plegable AK-74M', type: 'stock', fits: ['ak74-stock'], weight: 400, build(b) {
    b.add(ext('ak74st', s => { s.moveTo(0, .14); s.lineTo(-2.3, .02); s.quadraticCurveTo(-2.38, .02, -2.38, -.06); s.lineTo(-2.38, -.62); s.lineTo(-2.2, -.66); s.lineTo(-.25, -.2); s.lineTo(0, -.18); s.closePath(); }, .26, .03), 'body');
    b.add(ext('ak74pad', poly([[0, .06], [.08, .06], [.08, -.66], [0, -.66]]), .28, .02), 'rubber', -2.46, 0, 0);
    b.add(box(.12, .3, .3, .03), 'blued', -.04, 0, 0);
  } },
  { id: 'stock_ak12', name: 'Culata AK-12 regulable', type: 'stock', fits: ['ak12-stock'], weight: 450, build(b) {
    b.add(box(.14, .34, .3, .03), 'blued', -.05, 0, 0);
    b.add(box(.9, .1, .2, .02), 'blued', -.55, .05, 0);
    b.add(ext('ak12st', s => { s.moveTo(-.7, .22); s.lineTo(-2.25, .3); s.quadraticCurveTo(-2.35, .3, -2.35, .2); s.lineTo(-2.35, -.6); s.lineTo(-2.15, -.64); s.lineTo(-1.2, -.25); s.lineTo(-.7, -.15); s.closePath(); const h = new THREE.Path(); h.absellipse(-1.75, -.12, .28, .1, 0, Math.PI * 2, true); s.holes.push(h); }, .28, .03), 'body');
    b.add(box(.9, .08, .2, .02), 'body', -1.75, .36, 0);
    b.add(ext('ak12pad', poly([[0, .32], [.07, .32], [.07, -.66], [0, -.66]]), .3, .02), 'rubber', -2.42, 0, 0);
  } },
  { id: 'stock_scar', name: 'Culata plegable SCAR', type: 'stock', fits: ['scar-stock'], weight: 450, build(b) {
    b.add(box(.18, .4, .42, .05), 'body', -.08, 0, 0);
    b.add(ext('scarst', s => { s.moveTo(-.15, .25); s.lineTo(-1.3, .36); s.lineTo(-2.3, .34); s.quadraticCurveTo(-2.4, .33, -2.4, .22); s.lineTo(-2.4, -.52); s.lineTo(-2.2, -.58); s.lineTo(-1.5, -.24); s.lineTo(-.15, -.22); s.closePath(); const h = new THREE.Path(); h.absellipse(-1.0, .02, .5, .12, 0, Math.PI * 2, true); s.holes.push(h); }, .34, .035), 'body');
    b.add(box(.9, .08, .3, .03), 'body', -1.7, .42, 0);
    b.add(ext('scarpad', poly([[0, .36], [.08, .36], [.08, -.6], [0, -.6]]), .36, .02), 'rubber', -2.48, 0, 0);
  } },
  { id: 'stock_g36', name: 'Culata esqueleto G36', type: 'stock', fits: ['g36-stock'], weight: 380, build(b) {
    b.add(ext('g36st', poly([[0, .2], [-2.45, .22], [-2.5, .12], [-2.5, -.55], [-2.3, -.6], [-.4, -.16], [0, -.16]], [[[-2.3, .08], [-.5, .07], [-2.3, -.42]]]), .26, .03), 'body');
    b.add(ext('g36pad', poly([[0, .24], [.07, .24], [.07, -.62], [0, -.62]]), .28, .02), 'rubber', -2.57, 0, 0);
  } },
  { id: 'stock_bren', name: 'Culata plegable BREN 2', type: 'stock', fits: ['bren-stock'], weight: 400, build(b) {
    b.add(box(.14, .38, .4, .04), 'body', -.06, 0, 0);
    b.add(ext('brenst', s => { s.moveTo(-.1, .22); s.lineTo(-2.2, .3); s.quadraticCurveTo(-2.3, .3, -2.3, .2); s.lineTo(-2.3, -.56); s.lineTo(-2.1, -.6); s.lineTo(-1.3, -.22); s.lineTo(-.1, -.2); s.closePath(); const h = new THREE.Path(); h.absellipse(-1.3, .02, .55, .1, 0, Math.PI * 2, true); s.holes.push(h); }, .3, .035), 'body');
    b.add(ext('brenpad', poly([[0, .32], [.08, .32], [.08, -.62], [0, -.62]]), .32, .02), 'rubber', -2.38, 0, 0);
  } },
  { id: 'stock_mcx', name: 'Culata plegable MCX', type: 'stock', fits: ['mcx-stock'], weight: 300, build(b) {
    b.add(box(.14, .32, .3, .04), 'alu', -.06, 0, 0);
    for (const y of [.12, -.12]) b.add(lathe('mcxrod', [[0, -1.65], [.035, -1.65], [.035, 0], [0, 0]], 20), 'alu', 0, y, 0);
    b.add(ext('mcxbutt', s => { s.moveTo(0, .28); s.lineTo(.1, .28); s.lineTo(.12, -.55); s.lineTo(-.02, -.62); s.closePath(); }, .3, .03), 'body', -1.72, 0, 0);
    b.add(box(.04, .82, .3, .02), 'rubber', -1.76, -.16, 0);
  } },
  { id: 'grip_ak', name: 'Empuñadura AK', type: 'grip', fits: ['ak-grip'], weight: 70, build(b) {
    b.add(ext('akgrip', s => { s.moveTo(-.18, 0); s.lineTo(.2, 0); s.lineTo(.17, -.82); s.quadraticCurveTo(.16, -.88, .08, -.88); s.lineTo(-.12, -.88); s.quadraticCurveTo(-.2, -.87, -.21, -.78); s.closePath(); }, .22, .03), 'body');
    for (let i = 0; i < 6; i++) b.add(box(.012, .5, .27, .004), 'body', -.12 + i * .05, -.42, 0, 0, 0, .04);
  } },
  { id: 'grip_ak12', name: 'Empuñadura AK-12', type: 'grip', fits: ['ak-grip'], weight: 90, build(b) {
    b.add(ext('ak12grip', s => { s.moveTo(-.22, 0); s.lineTo(.2, 0); s.quadraticCurveTo(.25, -.25, .19, -.35); s.quadraticCurveTo(.25, -.55, .18, -.8); s.lineTo(.14, -.9); s.lineTo(-.16, -.9); s.quadraticCurveTo(-.24, -.86, -.23, -.72); s.closePath(); }, .24, .035), 'grip');
  } },
];
function ribsAlong(b: Builder, mid: (y: number) => number, n: number, from: number, gap: number, depth: number, mat: MatKey, w: number) {
  for (let i = 0; i < n; i++) { const y = from - i * gap; b.add(box(w, .022, depth, .006), mat, mid(y), y, 0, 0, 0, .15 + i * .1); }
}
