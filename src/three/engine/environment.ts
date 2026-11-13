import * as THREE from 'three';
import { Builder } from '../core/builder';
import { ADAPTERS, PLATFORMS, partById } from '../registry';
import { COLORS } from '../types';

/**
 * Estudio fotográfico virtual para los reflejos: sala oscura con cajas de luz
 * (cenital, tiras laterales y contraluz). Da brillos limpios en metal y polímero.
 */
export function studioScene() {
  const s = new THREE.Scene();
  const room = new THREE.Mesh(new THREE.BoxGeometry(24, 14, 24), new THREE.MeshBasicMaterial({ color: '#1b1d21', side: THREE.BackSide }));
  room.position.y = 5; s.add(room);
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(24, 24), new THREE.MeshBasicMaterial({ color: '#1d1f23' }));
  floor.rotation.x = -Math.PI / 2; floor.position.y = -1.9; s.add(floor);
  const panel = (w: number, h: number, i: number, pos: [number, number, number], tint: [number, number, number] = [1, 1, 1]) => {
    const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ color: new THREE.Color(tint[0] * i, tint[1] * i, tint[2] * i), side: THREE.DoubleSide }));
    m.position.set(...pos); m.lookAt(0, 1, 0); s.add(m);
  };
  panel(12, 5, 9, [0, 11, 1]);
  panel(2.4, 9, 7, [-10, 4, 4], [1, 0.97, 0.93]);
  panel(2.4, 9, 6, [10, 4, -2], [0.93, 0.97, 1]);
  panel(16, 1.6, 8, [0, 4, -11]);
  // Caja de luz frontal grande: da brillo visible a los costados del arma (vista lateral)
  panel(13, 5, 4.2, [0, 3, 11]);
  return s;
}

/** Ensambla una plataforma con sus piezas de serie (para miniaturas del selector). */
export function assemblePlatform(pid: string) {
  const P = PLATFORMS[pid]; const g = new THREE.Group();
  const bb = new Builder(COLORS[P.baseColor ?? 'negro']); P.build(bb); g.add(bb.g);
  for (const slot of P.slots) {
    const id = P.defaults[slot.id]; const part = id ? partById(id) : undefined; if (!part) continue;
    const pb = new Builder(COLORS[part.color ?? 'negro']); part.build(pb);
    if (slot.adapter && ADAPTERS[slot.adapter]) { const ab = new Builder(COLORS.negro); ADAPTERS[slot.adapter](ab); pb.g.add(ab.g); }
    const c = new THREE.Group(); c.add(pb.g); c.position.fromArray(slot.pos); c.rotation.set(...(slot.rot ?? [0, 0, 0])); c.scale.setScalar(slot.scale ?? 1); g.add(c);
  }
  return g;
}
