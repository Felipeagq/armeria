// Motor 3D del constructor: escena, post-proceso, cámara, selección y exportación.
// No depende de React; la UI lo controla mediante sus métodos públicos.
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { GTAOPass } from 'three/examples/jsm/postprocessing/GTAOPass.js';
import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass.js';
import { Builder, collectMats, disposeMats } from '../core/builder';
import { cached, sphere } from '../core/geometry';
import { ADAPTERS, PLATFORMS, partById } from '../registry';
import { COLORS, type BuildState, type Slot } from '../types';
import { studioScene } from './environment';

export type ViewName = 'side' | 'three' | 'top';
export type Quality = 'high' | 'normal';
export interface ViewerCallbacks {
  onPick: (id: string | null) => void;
  onHover: (id: string | null) => void;
  onBounds: (lengthMm: number) => void;
}

const ACCENT = new THREE.Color('#ff7a1a');
const V3 = THREE.Vector3;
const easeIO = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);

type HL = THREE.Material & { emissive: THREE.Color; emissiveIntensity: number };
interface Container extends THREE.Group { userData: { slotId: string; slot: Slot; mats: HL[]; anim: number } }

export class Viewer {
  private renderer: THREE.WebGLRenderer;
  private scene = new THREE.Scene();
  private camera = new THREE.PerspectiveCamera(32, 1, 0.05, 300);
  private controls: OrbitControls;
  private composer: EffectComposer;
  private gtao: GTAOPass | null = null;
  private key = new THREE.DirectionalLight('#ffffff', 2.4);
  private ground: THREE.Mesh;
  private grid: THREE.GridHelper;
  private buildGroup = new THREE.Group();
  private markerGroup = new THREE.Group();
  private baseMats: HL[] = [];
  private containers: Record<string, Container> = {};
  private bounds = { center: new V3(), size: new V3(1, 1, 1), radius: 1 };
  private explodeT = 0;
  private explodeTarget = 0;
  private tween: { p0: THREE.Vector3; t0: THREE.Vector3; p1: THREE.Vector3; t1: THREE.Vector3; k: number } | null = null;
  private quality: Quality = 'high';
  private selected: string | null = null;
  private hovered: string | null = null;
  private raf = 0;
  private clock = new THREE.Clock();
  private ray = new THREE.Raycaster();
  private ptr = new THREE.Vector2();
  private downAt: [number, number] | null = null;
  private moveRaf = 0;
  private resizeObs: ResizeObserver;
  private disposed = false;

  constructor(private container: HTMLElement, private cb: ViewerCallbacks) {
    const r = new THREE.WebGLRenderer({ antialias: true });
    r.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    r.shadowMap.enabled = true; r.shadowMap.type = THREE.PCFSoftShadowMap;
    r.toneMapping = THREE.ACESFilmicToneMapping; r.toneMappingExposure = 1.1;
    container.prepend(r.domElement);
    this.renderer = r;

    const s = this.scene;
    s.background = (() => {
      const c = document.createElement('canvas'); c.width = 64; c.height = 512; const x = c.getContext('2d')!;
      const g = x.createLinearGradient(0, 0, 0, 512); g.addColorStop(0, '#4b4f58'); g.addColorStop(0.55, '#2c2f35'); g.addColorStop(1, '#17181b');
      x.fillStyle = g; x.fillRect(0, 0, 64, 512);
      const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
    })();
    s.environment = new THREE.PMREMGenerator(r).fromScene(studioScene(), 0.02).texture;
    s.environmentIntensity = 1.15;

    this.controls = new OrbitControls(this.camera, r.domElement);
    Object.assign(this.controls, { enableDamping: true, dampingFactor: 0.08, minDistance: 0.6, maxDistance: 60, autoRotateSpeed: 1.4 });

    const key = this.key;
    key.castShadow = true; key.shadow.mapSize.set(2048, 2048); key.shadow.bias = -0.0003; key.shadow.normalBias = 0.02;
    Object.assign(key.shadow.camera, { left: -9, right: 9, top: 9, bottom: -9, near: 0.5, far: 50 });
    s.add(key, key.target);
    const rim = new THREE.DirectionalLight('#e6eeff', 1.2); rim.position.set(-6, 4, -6); s.add(rim);
    const fill = new THREE.DirectionalLight('#ffffff', 0.35); fill.position.set(-3, -2, 6); s.add(fill);
    this.ground = new THREE.Mesh(new THREE.PlaneGeometry(80, 80), new THREE.ShadowMaterial({ opacity: 0.42 }));
    this.ground.rotation.x = -Math.PI / 2; this.ground.receiveShadow = true; s.add(this.ground);
    this.grid = new THREE.GridHelper(60, 120, '#383b42', '#24262b');
    (this.grid.material as THREE.Material).transparent = true; (this.grid.material as THREE.Material).opacity = 0.22;
    s.add(this.grid, this.buildGroup, this.markerGroup);

    // Post-proceso: oclusión ambiental (GTAO) para el contacto entre piezas
    this.composer = new EffectComposer(r, new THREE.WebGLRenderTarget(1, 1, { type: THREE.HalfFloatType, samples: 4 }));
    this.composer.addPass(new RenderPass(s, this.camera));
    try {
      this.gtao = new GTAOPass(s, this.camera, 1, 1);
      this.gtao.updateGtaoMaterial({ radius: 0.3, distanceExponent: 1.6, thickness: 1, scale: 1.15, samples: 16 });
      this.composer.addPass(this.gtao);
    } catch (e) { console.warn('GTAO no disponible', e); }
    this.composer.addPass(new OutputPass());

    this.resizeObs = new ResizeObserver(() => this.resize());
    this.resizeObs.observe(container);
    this.bindPointer();
    this.resize();
    this.tick();
  }

  /* ── API pública ─────────────────────────────────────────────── */
  setBuild(state: BuildState, addedSlot: string | null) {
    this.platformId = state.platform;
    disposeMats(this.buildGroup); this.buildGroup.clear(); this.containers = {};
    const P = PLATFORMS[state.platform];
    const bb = new Builder(COLORS[state.baseColor]); P.build(bb);
    bb.g.userData = { isBase: true };
    this.baseMats = collectMats(bb.g) as HL[];
    this.buildGroup.add(bb.g);
    for (const slot of P.slots) {
      const inst = state.parts[slot.id]; const part = inst ? partById(inst.id) : undefined;
      if (!inst || !part) continue;
      const pb = new Builder(COLORS[inst.color]); part.build(pb);
      if (slot.adapter && ADAPTERS[slot.adapter]) { const ab = new Builder(COLORS.negro); ADAPTERS[slot.adapter](ab); pb.g.add(ab.g); }
      const c = new THREE.Group() as Container; c.add(pb.g);
      c.position.fromArray(slot.pos); c.rotation.set(...(slot.rot ?? [0, 0, 0])); c.scale.setScalar(slot.scale ?? 1);
      c.userData = { slotId: slot.id, slot, mats: collectMats(pb.g) as HL[], anim: slot.id === addedSlot ? 0 : 1 };
      this.buildGroup.add(c); this.containers[slot.id] = c;
    }
    this.buildGroup.updateMatrixWorld(true);
    const b3 = new THREE.Box3().setFromObject(this.buildGroup);
    const size = b3.getSize(new V3());
    this.bounds = { center: b3.getCenter(new V3()), size, radius: size.length() / 2 };
    this.ground.position.y = this.grid.position.y = b3.min.y - 0.012;
    this.key.position.copy(this.bounds.center).add(new V3(4, 10, 6)); this.key.target.position.copy(this.bounds.center);
    const sc = Math.max(4, this.bounds.radius * 1.3);
    Object.assign(this.key.shadow.camera, { left: -sc, right: sc, top: sc, bottom: -sc }); this.key.shadow.camera.updateProjectionMatrix();
    this.gtao?.updateGtaoMaterial({ radius: THREE.MathUtils.clamp(this.bounds.radius * 0.05, 0.12, 0.4) });
    this.applyHighlight();
    this.cb.onBounds(Math.round(size.x * 100));
  }

  setHighlight(selected: string | null, hovered: string | null) {
    this.selected = selected; this.hovered = hovered; this.applyHighlight();
  }

  setView(name: ViewName, instant = false) {
    const { center, radius } = this.bounds;
    const vfov = THREE.MathUtils.degToRad(this.camera.fov);
    const hfov = 2 * Math.atan(Math.tan(vfov / 2) * this.camera.aspect);
    const d = radius / Math.sin(Math.min(vfov, hfov) / 2) * 0.92;
    const dir = name === 'side' ? new V3(0, 0.06, 1) : name === 'top' ? new V3(0, 1, 0.02) : new V3(0.5, 0.34, 0.85);
    const pos = center.clone().add(dir.normalize().multiplyScalar(d));
    if (instant) { this.camera.position.copy(pos); this.controls.target.copy(center); this.controls.update(); return; }
    this.tween = { p0: this.camera.position.clone(), t0: this.controls.target.clone(), p1: pos, t1: center.clone(), k: 0 };
  }

  setExplode(on: boolean) { this.explodeTarget = on ? 1 : 0; }
  setAutoRotate(on: boolean) { this.controls.autoRotate = on; }
  setQuality(q: Quality) {
    this.quality = q;
    this.renderer.setPixelRatio(q === 'high' ? Math.min(window.devicePixelRatio, 2) : 1);
    this.resize();
  }

  showMarkers(type: string | null) {
    this.markerGroup.clear();
    if (!type || type === 'all') return;
    const s = THREE.MathUtils.clamp(this.bounds.radius / 5, 0.35, 1.1);
    const dotMat = new THREE.MeshBasicMaterial({ color: ACCENT, transparent: true, opacity: 0.95, depthTest: false });
    const ringMat = new THREE.MeshBasicMaterial({ color: ACCENT, transparent: true, opacity: 0.6, depthTest: false, side: THREE.DoubleSide });
    for (const slot of PLATFORMS[this.currentPlatform()]?.slots.filter(sl => sl.type === type) ?? []) {
      const g = new THREE.Group(); g.position.fromArray(slot.pos);
      const dot = new THREE.Mesh(sphere(0.06), dotMat); dot.renderOrder = 10;
      const ring = new THREE.Mesh(cached('ring', () => new THREE.RingGeometry(0.1, 0.13, 40)), ringMat); ring.renderOrder = 10;
      g.add(dot, ring); g.scale.setScalar(s); g.userData.ring = ring; this.markerGroup.add(g);
    }
  }

  /** Captura el lienzo con una banda inferior de título y datos. Devuelve el canvas compuesto. */
  capture(title: string, info: string): HTMLCanvasElement {
    const prev: [string | null, string | null] = [this.selected, this.hovered];
    this.setHighlight(null, null);
    this.markerGroup.visible = false; this.draw();
    const src = this.renderer.domElement, dpr = this.renderer.getPixelRatio();
    const W = src.width, H = src.height, band = Math.round(70 * dpr);
    const c = document.createElement('canvas'); c.width = W; c.height = H + band;
    const x = c.getContext('2d')!;
    x.drawImage(src, 0, 0);
    x.fillStyle = '#16171a'; x.fillRect(0, H, W, band); x.fillStyle = '#ff7a1a'; x.fillRect(0, H, W, Math.max(2, 2 * dpr));
    x.fillStyle = '#ecebe7'; x.font = `600 ${20 * dpr}px 'Space Grotesk Variable', sans-serif`; x.textBaseline = 'middle';
    x.fillText(title, 22 * dpr, H + band / 2);
    x.font = `${13 * dpr}px 'JetBrains Mono Variable', monospace`; x.fillStyle = '#8d9097'; x.textAlign = 'right';
    x.fillText(info, W - 22 * dpr, H + band / 2);
    this.markerGroup.visible = true; this.setHighlight(...prev);
    return c;
  }

  dispose() {
    this.disposed = true;
    cancelAnimationFrame(this.raf);
    this.resizeObs.disconnect();
    disposeMats(this.buildGroup);
    this.controls.dispose(); this.composer.dispose(); this.renderer.dispose();
    this.renderer.domElement.remove();
  }

  /* ── Internos ────────────────────────────────────────────────── */
  private platformId = '';
  private currentPlatform() { return this.platformId; }
  setPlatformId(id: string) { this.platformId = id; }

  private applyHighlight() {
    const level = (id: string) => (id === this.selected ? 0.32 : id === this.hovered ? 0.13 : 0);
    const paint = (mats: HL[], l: number) => mats.forEach(m => {
      if (!m.userData.em0) m.userData.em0 = [m.emissive.clone(), m.emissiveIntensity];
      if (l > 0) { m.emissive.copy(ACCENT); m.emissiveIntensity = l; }
      else { const [c, i] = m.userData.em0 as [THREE.Color, number]; m.emissive.copy(c); m.emissiveIntensity = i; }
    });
    for (const id in this.containers) paint(this.containers[id].userData.mats, level(id));
    paint(this.baseMats, level('base'));
  }

  private resize() {
    const w = this.container.clientWidth, h = this.container.clientHeight;
    if (!w || !h) return;
    this.renderer.setSize(w, h, false);
    this.composer.setPixelRatio(this.renderer.getPixelRatio()); this.composer.setSize(w, h);
    this.camera.aspect = w / h; this.camera.updateProjectionMatrix();
  }

  private draw() {
    if (this.quality === 'high' && this.gtao) this.composer.render();
    else this.renderer.render(this.scene, this.camera);
  }

  private tick = () => {
    if (this.disposed) return;
    const dt = Math.min(this.clock.getDelta(), 0.05);
    this.explodeT += (this.explodeTarget - this.explodeT) * Math.min(1, dt * 7);
    for (const id in this.containers) {
      const c = this.containers[id], u = c.userData, s = u.slot;
      if (u.anim < 1) u.anim = Math.min(1, u.anim + dt * 2.6);
      const k = this.explodeT + (1 - easeOut(u.anim)) * 1.5;
      c.position.set(s.pos[0] + s.explode[0] * k, s.pos[1] + s.explode[1] * k, s.pos[2] + s.explode[2] * k);
    }
    if (this.tween) {
      const tw = this.tween; tw.k = Math.min(1, tw.k + dt * 2.2); const e = easeIO(tw.k);
      this.camera.position.lerpVectors(tw.p0, tw.p1, e); this.controls.target.lerpVectors(tw.t0, tw.t1, e);
      if (tw.k >= 1) this.tween = null;
    }
    const t = performance.now() / 1000;
    this.markerGroup.children.forEach(g => { g.quaternion.copy(this.camera.quaternion); (g.userData.ring as THREE.Object3D).scale.setScalar(1 + 0.25 * Math.sin(t * 5)); });
    this.controls.update();
    this.draw();
    this.raf = requestAnimationFrame(this.tick);
  };

  private hit(e: PointerEvent): string | null {
    const r = this.renderer.domElement.getBoundingClientRect();
    this.ptr.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
    this.ray.setFromCamera(this.ptr, this.camera);
    for (const h of this.ray.intersectObjects(this.buildGroup.children, true)) {
      const m = (h.object as THREE.Mesh).material as THREE.Material;
      if (m?.transparent && m.opacity < 0.6) continue;
      let o: THREE.Object3D | null = h.object;
      while (o && o !== this.buildGroup) {
        if (o.userData.slotId) return o.userData.slotId as string;
        if (o.userData.isBase) return 'base';
        o = o.parent;
      }
    }
    return null;
  }

  private bindPointer() {
    const el = this.renderer.domElement;
    el.addEventListener('pointerdown', e => { this.downAt = [e.clientX, e.clientY]; });
    el.addEventListener('pointerup', e => {
      if (!this.downAt || Math.hypot(e.clientX - this.downAt[0], e.clientY - this.downAt[1]) > 5) return;
      this.cb.onPick(this.hit(e));
    });
    el.addEventListener('pointermove', e => {
      if (this.moveRaf || e.buttons) return;
      this.moveRaf = requestAnimationFrame(() => {
        this.moveRaf = 0; const h = this.hit(e);
        el.style.cursor = h ? 'pointer' : 'grab';
        this.cb.onHover(h);
      });
    });
    el.addEventListener('pointerleave', () => this.cb.onHover(null));
  }
}
