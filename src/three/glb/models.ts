// Carga, normalización, anclaje y persistencia de modelos GLB.
//
// Convenciones:
//  · Unidades internas: 1 = 100 mm. Se convierte desde m / cm / mm.
//  · Ejes internos: +X hacia la boca del cañón, +Y arriba.
//  · Cuerpos base: nodos vacíos slot_optic, slot_muzzle, slot_under, slot_side, slot_mag,
//    slot_stock, slot_grip marcan dónde se anclan las piezas.
//  · Piezas: un nodo "attach" marca el anclaje; si falta, se calcula según el tipo.
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { MeshoptDecoder } from 'three/examples/jsm/libs/meshopt_decoder.module.js';
import { SLOT_TYPES, type Slot, type SlotType, type Vec3 } from '../types';

export type Units = 'auto' | 'm' | 'cm' | 'mm';
export type Forward = '+x' | '-x' | '+z' | '-z';
export interface ImportOptions { units?: Units; forward?: Forward; slotType?: SlotType }

/** Registro persistido de un modelo importado (sin el binario). */
export interface ModelRecord {
  id: string;
  kind: 'part' | 'base';
  name: string;
  slot?: SlotType;
  family?: string;
  platforms?: string[];
  units?: Units;
  forward?: Forward;
  weight?: number;
  replaces?: string;
  source: 'local' | 'manifest';
  created?: number;
}

export const MAX_BYTES = 80 * 1024 * 1024;
const SLOT_RE = /^slot[_\-. ]?(optic|muzzle|under|side|mag|stock|grip)/i;
const UNIT: Record<Exclude<Units, 'auto'>, number> = { m: 10, cm: 0.1, mm: 0.01 };
const FORWARD: Record<Forward, number> = { '+x': 0, '-x': Math.PI, '+z': Math.PI / 2, '-z': -Math.PI / 2 };
const EXPLODE: Record<SlotType, Vec3> = { optic: [0, 0.8, 0], muzzle: [0.8, 0, 0], under: [0, -0.7, 0], side: [0, 0, 0.6], mag: [0, -0.8, 0], stock: [-0.8, 0, 0], grip: [-0.15, -0.6, 0] };

let loader: GLTFLoader | null = null;
function getLoader() {
  if (!loader) {
    loader = new GLTFLoader();
    try { loader.setMeshoptDecoder(MeshoptDecoder); } catch { /* el navegador no admite WebAssembly */ }
  }
  return loader;
}

/** Parsea un ArrayBuffer .glb. Lanza un Error con mensaje legible si falla. */
export function parseGLB(buffer: ArrayBuffer): Promise<THREE.Group> {
  if (buffer.byteLength > MAX_BYTES) return Promise.reject(new Error('El archivo supera 80 MB.'));
  const magic = new TextDecoder().decode(new Uint8Array(buffer, 0, 4));
  if (magic !== 'glTF') return Promise.reject(new Error('No es un .glb binario válido. Exporta como glTF Binary (.glb).'));
  return new Promise((res, rej) => getLoader().parse(buffer, '', g => res(g.scene), e => {
    const msg = String((e as unknown as { message?: string })?.message ?? e);
    rej(new Error(/draco/i.test(msg) ? 'El modelo usa compresión Draco, que no está soportada. Re-exporta sin Draco o con Meshopt.' : `No se pudo leer el modelo: ${msg}`));
  }));
}

export function guessUnits(maxDim: number, kind: 'part' | 'base'): Exclude<Units, 'auto'> {
  if (kind === 'base') return maxDim > 300 ? 'mm' : maxDim > 12 ? 'cm' : 'm';
  return maxDim > 40 ? 'mm' : maxDim > 2 ? 'cm' : 'm';
}

function normalize(scene: THREE.Object3D, { units = 'auto', forward = '+x' }: ImportOptions, kind: 'part' | 'base') {
  const orient = new THREE.Group(); orient.rotation.y = FORWARD[forward] ?? 0; orient.add(scene);
  orient.updateMatrixWorld(true);
  const raw = new THREE.Box3().setFromObject(orient).getSize(new THREE.Vector3());
  const u = units === 'auto' ? guessUnits(Math.max(raw.x, raw.y, raw.z), kind) : units;
  const root = new THREE.Group(); root.scale.setScalar(UNIT[u]); root.add(orient);
  root.updateMatrixWorld(true);
  root.traverse(o => { if ((o as THREE.Mesh).isMesh) { o.castShadow = true; o.receiveShadow = true; } });
  const box = new THREE.Box3().setFromObject(root);
  return { root, units: u, box, sizeMm: box.getSize(new THREE.Vector3()).multiplyScalar(100) };
}

function autoAnchor(box: THREE.Box3, type: SlotType | undefined) {
  const c = box.getCenter(new THREE.Vector3()), s = box.getSize(new THREE.Vector3());
  switch (type) {
    case 'optic': return new THREE.Vector3(c.x, box.min.y, c.z);
    case 'muzzle': return new THREE.Vector3(box.min.x, c.y, c.z);
    case 'side': return new THREE.Vector3(c.x, c.y, box.min.z);
    case 'stock': return new THREE.Vector3(box.max.x, box.max.y - s.y * 0.18, c.z);
    default: return new THREE.Vector3(c.x, box.max.y, c.z);
  }
}

export function preparePart(scene: THREE.Object3D, opts: ImportOptions) {
  const n = normalize(scene, opts, 'part');
  let anchor: THREE.Vector3 | null = null;
  n.root.traverse(o => { if (!anchor && /^attach/i.test(o.name)) anchor = o.getWorldPosition(new THREE.Vector3()); });
  const anchorNode = anchor !== null;
  const a: THREE.Vector3 = anchor ?? autoAnchor(n.box, opts.slotType);
  const wrap = new THREE.Group(); n.root.position.sub(a); wrap.add(n.root);
  wrap.updateMatrixWorld(true);
  return { model: wrap, units: n.units, sizeMm: n.sizeMm, anchorNode };
}

export function prepareBase(scene: THREE.Object3D, opts: ImportOptions) {
  const n = normalize(scene, opts, 'base');
  n.root.position.y -= n.box.min.y;
  const wrap = new THREE.Group(); wrap.add(n.root); wrap.updateMatrixWorld(true);
  const box = new THREE.Box3().setFromObject(wrap), size = box.getSize(new THREE.Vector3()), c = box.getCenter(new THREE.Vector3());
  const k = THREE.MathUtils.clamp(Math.max(size.x, size.y) / 9, 0.3, 1.2);
  const ex = (t: SlotType) => EXPLODE[t].map(v => v * k) as Vec3;
  const slots: Slot[] = []; const seen = new Set<SlotType>();
  wrap.traverse(o => {
    const m = SLOT_RE.exec(o.name || ''); if (!m) return;
    const type = m[1].toLowerCase() as SlotType; if (seen.has(type)) return; seen.add(type);
    const e = new THREE.Euler().setFromQuaternion(o.getWorldQuaternion(new THREE.Quaternion()));
    slots.push({ id: type, type, pos: o.getWorldPosition(new THREE.Vector3()).toArray() as Vec3, rot: [e.x, e.y, e.z], explode: ex(type) });
  });
  const found = slots.map(s => s.type);
  if (!seen.has('optic')) slots.push({ id: 'optic', type: 'optic', pos: [c.x - size.x * 0.1, box.max.y, c.z], explode: ex('optic'), guessed: true });
  if (!seen.has('muzzle')) slots.push({ id: 'muzzle', type: 'muzzle', pos: [box.max.x, box.min.y + size.y * 0.72, c.z], explode: ex('muzzle'), guessed: true });
  slots.sort((a, b) => SLOT_TYPES.indexOf(a.type) - SLOT_TYPES.indexOf(b.type));
  return { model: wrap, units: n.units, sizeMm: n.sizeMm, slots, found };
}

/** Clon independiente con materiales propios (para poder resaltarlo sin afectar a otros). */
export function instantiate(model: THREE.Object3D) {
  const c = model.clone(true);
  c.traverse(o => {
    const mesh = o as THREE.Mesh;
    if (!mesh.isMesh) return;
    mesh.material = Array.isArray(mesh.material) ? mesh.material.map(m => m.clone()) : mesh.material.clone();
  });
  return c;
}

/* ── Persistencia local (IndexedDB) ───────────────────────────────── */
const DB = 'armeria3d', STORE = 'models';
function open(): Promise<IDBDatabase> {
  return new Promise((res, rej) => {
    const r = indexedDB.open(DB, 1);
    r.onupgradeneeded = () => { if (!r.result.objectStoreNames.contains(STORE)) r.result.createObjectStore(STORE, { keyPath: 'id' }); };
    r.onsuccess = () => res(r.result); r.onerror = () => rej(r.error);
  });
}
async function run<T>(mode: IDBTransactionMode, fn: (s: IDBObjectStore) => IDBRequest<T> | void): Promise<T | undefined> {
  const db = await open();
  return new Promise((res, rej) => {
    const tx = db.transaction(STORE, mode); const req = fn(tx.objectStore(STORE));
    tx.oncomplete = () => { res(req ? req.result : undefined); db.close(); };
    tx.onerror = () => { rej(tx.error); db.close(); };
  });
}
export type StoredModel = ModelRecord & { buffer: ArrayBuffer };
export const storeModel = (rec: StoredModel) => run('readwrite', s => s.put(rec));
export const deleteStoredModel = (id: string) => run('readwrite', s => s.delete(id));
export const listStoredModels = async () => ((await run<StoredModel[]>('readonly', s => s.getAll() as IDBRequest<StoredModel[]>)) ?? []);

/* ── Modelos publicados con el sitio (public/models/manifest.json) ── */
export interface ManifestEntry {
  id?: string; kind?: 'part' | 'base'; name?: string; file: string; slot?: SlotType; family?: string;
  platforms?: string[]; units?: Units; forward?: Forward; weight?: number; replaces?: string;
}
export async function loadManifest(basePath = ''): Promise<ManifestEntry[]> {
  try {
    const r = await fetch(`${basePath}/models/manifest.json`, { cache: 'no-cache' });
    if (!r.ok) return [];
    const j: unknown = await r.json();
    const models = (j as { models?: unknown }).models;
    return Array.isArray(models) ? models.filter((m): m is ManifestEntry => typeof m?.file === 'string') : [];
  } catch { return []; }
}
export async function fetchModelFile(file: string, basePath = '') {
  // Solo rutas relativas simples dentro de /models (evita path traversal y URLs externas)
  if (!/^[\w\-./]+\.glb$/i.test(file) || file.includes('..') || file.startsWith('/')) throw new Error('Ruta de modelo no válida');
  const r = await fetch(`${basePath}/models/${file}`);
  if (!r.ok) throw new Error(`No se encontró models/${file}`);
  return r.arrayBuffer();
}
