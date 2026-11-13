// Miniaturas renderizadas en un WebGLRenderer aparte, por lotes para no bloquear la UI.
import * as THREE from 'three';
import { Builder } from '../core/builder';
import { disposeMats } from '../core/builder';
import { PLATFORMS, partById } from '../registry';
import { COLORS } from '../types';
import { assemblePlatform, studioScene } from './environment';

type Job = { key: string; make: () => THREE.Object3D };

const cache = new Map<string, string>();
const listeners = new Set<() => void>();
const queue: Job[] = [];
const queued = new Set<string>();
let renderer: THREE.WebGLRenderer | null = null;
let scene: THREE.Scene, camera: THREE.PerspectiveCamera;
let busy = false;
let version = 0;

function init() {
  if (renderer) return true;
  try { renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, preserveDrawingBuffer: true }); } catch { return false; }
  renderer.setPixelRatio(1); renderer.setSize(240, 168, false); renderer.toneMapping = THREE.ACESFilmicToneMapping;
  scene = new THREE.Scene();
  scene.environment = new THREE.PMREMGenerator(renderer).fromScene(studioScene(), 0.02).texture;
  const l = new THREE.DirectionalLight('#fff', 2.4); l.position.set(3, 6, 5);
  scene.add(l, new THREE.HemisphereLight('#d4dcff', '#202020', 0.5));
  camera = new THREE.PerspectiveCamera(28, 240 / 168, 0.01, 200);
  return true;
}

/** Renderiza un objeto y devuelve un data URL PNG (libera sus materiales después). */
export function renderObject(obj: THREE.Object3D): string | null {
  if (!init() || !renderer) return null;
  scene.add(obj); obj.updateMatrixWorld(true);
  const bx = new THREE.Box3().setFromObject(obj); const c = bx.getCenter(new THREE.Vector3());
  const r = Math.max(bx.getSize(new THREE.Vector3()).length() / 2, 0.01);
  const vf = THREE.MathUtils.degToRad(camera.fov);
  camera.position.copy(c).add(new THREE.Vector3(0.3, 0.2, 0.95).normalize().multiplyScalar(r / Math.sin(vf / 2) * 0.78));
  camera.lookAt(c);
  renderer.render(scene, camera);
  const url = renderer.domElement.toDataURL('image/png');
  scene.remove(obj); disposeMats(obj);
  return url;
}

function pump() {
  busy = true;
  for (let n = 0; n < 4 && queue.length; n++) {
    const job = queue.shift()!; queued.delete(job.key);
    const url = renderObject(job.make());
    if (url) cache.set(job.key, url);
  }
  version++;
  listeners.forEach(fn => fn());
  if (queue.length) setTimeout(pump, 16); else busy = false;
}
function enqueue(job: Job, force = false) {
  if (typeof window === 'undefined') return;
  if (!force && (cache.has(job.key) || queued.has(job.key))) return;
  queue.push(job); queued.add(job.key);
  if (!busy) setTimeout(pump, 0);
}

export const partThumbKey = (id: string) => `part:${id}`;
export const platformThumbKey = (id: string) => `plat:${id}`;

export function requestPartThumb(id: string, force = false) {
  enqueue({ key: partThumbKey(id), make: () => { const p = partById(id)!; const b = new Builder(COLORS[p.color ?? 'negro']); p.build(b); return b.g; } }, force);
}
export function requestPlatformThumb(id: string) {
  if (!PLATFORMS[id]) return;
  enqueue({ key: platformThumbKey(id), make: () => assemblePlatform(id) });
}
export const getThumb = (key: string) => cache.get(key);

/* Integración con useSyncExternalStore */
export const subscribeThumbs = (fn: () => void) => { listeners.add(fn); return () => { listeners.delete(fn); }; };
export const thumbsVersion = () => version;
