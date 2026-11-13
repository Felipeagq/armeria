import * as THREE from 'three';
import { box, cylZ } from './geometry';
import { createMat, type MatKey } from './materials';

/** Construye un grupo de mallas con materiales teñidos por `color` (creados bajo demanda). */
export class Builder {
  readonly g = new THREE.Group();
  private readonly mats = new Map<MatKey, THREE.Material>();
  constructor(private readonly color: THREE.ColorRepresentation) {}

  mat(key: MatKey): THREE.Material {
    let m = this.mats.get(key);
    if (!m) { m = createMat(key, this.color); this.mats.set(key, m); }
    return m;
  }

  add(geo: THREE.BufferGeometry, mat: MatKey | THREE.Material, x = 0, y = 0, z = 0, rx = 0, ry = 0, rz = 0, parent: THREE.Object3D | null = null) {
    const mesh = new THREE.Mesh(geo, typeof mat === 'string' ? this.mat(mat) : mat);
    mesh.position.set(x, y, z); mesh.rotation.set(rx, ry, rz);
    mesh.castShadow = true; mesh.receiveShadow = true;
    (parent ?? this.g).add(mesh);
    return mesh;
  }

  group(x: number, y: number, z: number, rx = 0, ry = 0, rz = 0, parent: THREE.Object3D | null = null) {
    const g = new THREE.Group(); g.position.set(x, y, z); g.rotation.set(rx, ry, rz);
    (parent ?? this.g).add(g);
    return g;
  }

  /** Riel picatinny centrado en x, apoyado en y; crece hacia dir (+1 arriba, -1 abajo). */
  rail(len: number, x: number, y: number, dir = 1, parent: THREE.Object3D | null = null, numbered = false) {
    this.add(box(len, 0.05, 0.2, 0.01, 2), 'rail', x, y + dir * 0.025, 0, 0, 0, 0, parent);
    const n = Math.max(2, Math.round(len / 0.1));
    const step = (len - 0.06) / (n - 1);
    for (let i = 0; i < n; i++) {
      const px = x - len / 2 + 0.03 + i * step;
      this.add(box(0.052, 0.045, 0.245, 0.01, 2), 'rail', px, y + dir * 0.072, 0, 0, 0, 0, parent);
      if (numbered && i % 2 === 0) this.add(box(0.012, 0.012, 0.004, 0.002), 'steel', px + 0.05, y + dir * 0.06, 0.112, 0, 0, 0, parent);
    }
  }

  /** Pasador transversal con cabeza visible a ambos lados. */
  pin(x: number, y: number, half = 0.2, r = 0.04, mat: MatKey = 'steel', parent: THREE.Object3D | null = null) {
    this.add(cylZ(r, half * 2 + 0.02), mat, x, y, 0, 0, 0, 0, parent);
  }
}

type WithEmissive = THREE.Material & { emissive: THREE.Color; emissiveIntensity: number };
const hasEmissive = (m: THREE.Material): m is WithEmissive => 'emissive' in m;

/** Materiales resaltables (no fijos y con emisivo) de un objeto. */
export function collectMats(obj: THREE.Object3D): WithEmissive[] {
  const set = new Set<WithEmissive>();
  obj.traverse(o => {
    if (!(o as THREE.Mesh).isMesh) return;
    const mat = (o as THREE.Mesh).material;
    for (const m of Array.isArray(mat) ? mat : [mat]) if (!m.userData.fixed && hasEmissive(m)) set.add(m);
  });
  return [...set];
}

export function disposeMats(obj: THREE.Object3D) {
  obj.traverse(o => {
    if (!(o as THREE.Mesh).isMesh) return;
    const mat = (o as THREE.Mesh).material;
    for (const m of Array.isArray(mat) ? mat : [mat]) m.dispose();
  });
}
