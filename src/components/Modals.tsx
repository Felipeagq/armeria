'use client';
import { useEffect, useMemo, useState } from 'react';
import * as THREE from 'three';
import { useStore } from '@/state/store';
import { totalWeight } from '@/state/build';
import { GROUPS, PLATFORMS, pickerEntries, registerModel, unregisterModel } from '@/three/registry';
import { getViewer } from '@/three/engine/viewerRef';
import { renderObject } from '@/three/engine/thumbs';
import * as GLB from '@/three/glb/models';
import { SLOT_LABEL, SLOT_TYPES, type SlotType } from '@/three/types';
import { usePlatformThumb } from './useThumb';
import { IconClose, IconSearch } from './icons';

const norm = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
const uid = () => (crypto.randomUUID?.() ?? Date.now().toString(36) + Math.random().toString(36).slice(2)).replace(/-/g, '').slice(0, 12);
const FAMILIES: Record<string, string> = { pistol: 'Pistola', rifle: 'Carabina', smg: 'Subfusil' };

function Modal({ children, onClose, className = '', dismissable = true }: { children: React.ReactNode; onClose: () => void; className?: string; dismissable?: boolean }) {
  return (
    <div className="modal" role="dialog" aria-modal="true" onClick={e => { if (dismissable && e.target === e.currentTarget) onClose(); }}>
      <div className={`sheet ${className}`}>{children}</div>
    </div>
  );
}
const CloseBtn = ({ onClick }: { onClick: () => void }) => <button className="iconbtn" title="Cerrar" aria-label="Cerrar" onClick={onClick}><IconClose /></button>;

/* ───────────── Selector de modelo ───────────── */
function PickerCard({ name, maker, ids, labels }: { name: string; maker: string; ids: string[]; labels: string[] }) {
  const platform = useStore(s => s.build.platform);
  const { setPlatform, openModal } = useStore.getState();
  const first = ids.find(id => id === platform) ?? ids[0];
  const thumb = usePlatformThumb(first);
  const P = PLATFORMS[first];
  const choose = (id: string) => { openModal(null); setPlatform(id); };
  return (
    <div className={`pcard ${ids.includes(platform) ? 'on' : ''}`} onClick={() => choose(first)}>
      <div className="thumb">{thumb ? <img src={thumb} alt="" /> : <div className="ph" />}</div>
      <div className="pn">{name}</div><div className="pm">{maker}</div>
      {P.specs && <div className="ps">{P.specs.calibre}{P.specs.cadencia ? ` · ${P.specs.cadencia}` : ''}</div>}
      <div className="chips">
        {ids.map((id, i) => (
          <button key={id} className={`vchip ${id === platform ? 'on' : ''}`} onClick={e => { e.stopPropagation(); choose(id); }}>{labels[i]}</button>
        ))}
      </div>
    </div>
  );
}

export function PickerModal() {
  const [q, setQ] = useState('');
  const registryVersion = useStore(s => s.registryVersion);
  const close = () => useStore.getState().openModal(null);
  const entries = useMemo(() => pickerEntries(), [registryVersion]); // eslint-disable-line react-hooks/exhaustive-deps
  const nq = norm(q.trim());
  const list = entries.filter(e => !nq || norm(`${e.name} ${e.maker} ${e.labels.join(' ')}`).includes(nq));
  return (
    <Modal onClose={close} className="picker">
      <div className="row"><strong>Elegir modelo</strong><CloseBtn onClick={close} /></div>
      <label className="search"><IconSearch /><input autoFocus placeholder="Buscar modelo, fabricante o variante" value={q} onChange={e => setQ(e.target.value)} /></label>
      <div className="scroll">
        {GROUPS.map(g => {
          const items = list.filter(e => e.group === g); if (!items.length) return null;
          return (
            <div key={g}><h4>{g}</h4>
              <div className="pgrid">{items.map(e => <PickerCard key={e.ids[0]} {...e} />)}</div>
            </div>
          );
        })}
        {!list.length && <p className="muted">Ningún modelo coincide.</p>}
      </div>
    </Modal>
  );
}

/* ───────────── Exportar PNG ───────────── */
export function ExportModal() {
  const build = useStore(s => s.build);
  const lengthMm = useStore(s => s.lengthMm);
  const close = () => useStore.getState().openModal(null);
  const [msg, setMsg] = useState('Usa «Descargar» o clic derecho → «Guardar imagen como…».');
  // Captura única al abrir el diálogo (el componente solo existe en el navegador)
  const [capture] = useState(() => {
    const v = getViewer(); if (!v) return null;
    const w = totalWeight(build);
    const info = `${PLATFORMS[build.platform].name} · ${lengthMm} mm · ${w ? (w / 1000).toFixed(2) + ' kg' : '—'} · Armería 3D`;
    const canvas = v.capture(build.name, info);
    return { canvas, url: canvas.toDataURL('image/png') };
  });
  const img = capture?.url ?? '';

  const fileName = `${build.name.replace(/[^\w\-áéíóúñ ]+/gi, '').trim().replace(/\s+/g, '-') || 'build'}.png`;
  const copy = () => capture?.canvas.toBlob(async blob => {
    if (!blob) return;
    try { await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]); setMsg('Imagen copiada al portapapeles.'); }
    catch { setMsg('Tu navegador no permitió copiar. Usa «Descargar».'); }
  }, 'image/png');

  return (
    <Modal onClose={close}>
      <div className="row"><strong>Exportar imagen</strong><CloseBtn onClick={close} /></div>
      {img && <img src={img} alt="Vista previa del build exportado" />}
      <div className="row"><p>{msg}</p>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="ghost" onClick={copy}>Copiar</button>
          <a className="primary" href={img} download={fileName}>Descargar</a>
        </div>
      </div>
    </Modal>
  );
}

/* ───────────── Modelos GLB: gestión ───────────── */
export function ModelsModal({ records, onPickFile, onDeleted }: { records: GLB.ModelRecord[]; onPickFile: (f: File) => void; onDeleted: (id: string) => void }) {
  const close = () => useStore.getState().openModal(null);
  const [confirm, setConfirm] = useState<string | null>(null);
  const del = async (id: string) => {
    if (confirm !== id) { setConfirm(id); setTimeout(() => setConfirm(c => (c === id ? null : c)), 2500); return; }
    try { await GLB.deleteStoredModel(id); } catch { /* */ }
    unregisterModel(id); onDeleted(id);
  };
  return (
    <Modal onClose={close} className="form">
      <div className="row"><strong>Modelos 3D</strong><CloseBtn onClick={close} /></div>
      <div className="scroll">
        <label className="dropzone">
          <input type="file" accept=".glb,model/gltf-binary" hidden onChange={e => { const f = e.target.files?.[0]; e.target.value = ''; if (f) onPickFile(f); }} />
          <b>Elige un archivo .glb</b> o arrástralo al lienzo
        </label>
        <h4>Importados</h4>
        <div>
          {records.length ? records.map(r => (
            <div className="mrow" key={r.id}>
              <div><b>{r.name}</b><span>{r.kind === 'base' ? `Cuerpo · ${FAMILIES[r.family ?? ''] ?? ''}` : `${r.slot ? SLOT_LABEL[r.slot] : ''}${r.replaces ? ` · reemplaza ${r.replaces}` : ''}`} · {r.source === 'manifest' ? 'publicado' : 'este navegador'}</span></div>
              {r.source === 'local' && <button className="ghost sm" onClick={() => del(r.id)}>{confirm === r.id ? '¿Seguro?' : 'Eliminar'}</button>}
            </div>
          )) : <p className="muted">Aún no has importado modelos.</p>}
        </div>
        <h4>Cómo preparar los modelos</h4>
        <div className="guide">
          <ul>
            <li>Formato <code>.glb</code> con texturas incluidas. Se admite compresión Meshopt; Draco no.</li>
            <li>Orientación: cañón hacia <code>+X</code> y arriba <code>+Y</code> (se puede corregir al importar).</li>
            <li><b>Cuerpos base:</b> nodos vacíos <code>slot_optic</code>, <code>slot_muzzle</code>, <code>slot_under</code>, <code>slot_side</code>, <code>slot_mag</code>, <code>slot_stock</code>, <code>slot_grip</code>.</li>
            <li><b>Piezas:</b> un vacío <code>attach</code> marca el anclaje; si falta, se calcula según el tipo.</li>
            <li>Recomendado: &lt; 50k triángulos y texturas de 1–2K por pieza.</li>
          </ul>
          Para que todos los visitantes vean un modelo, súbelo a <code>public/models/</code> y decláralo en <code>public/models/manifest.json</code> (ver README).
        </div>
      </div>
    </Modal>
  );
}

/* ───────────── Modelos GLB: importación ───────────── */
export function ImportModal({ file, onDone, onCancel }: { file: File; onDone: (rec: GLB.ModelRecord) => void; onCancel: () => void }) {
  const platform = useStore(s => s.build.platform);
  const [scene, setScene] = useState<THREE.Group | null>(null);
  const [buffer, setBuffer] = useState<ArrayBuffer | null>(null);
  const [err, setErr] = useState('');
  const [kind, setKind] = useState<'part' | 'base'>('part');
  const [name, setName] = useState(file.name.replace(/\.glb$/i, '').replace(/[_-]+/g, ' ').slice(0, 40));
  const [slotType, setSlotType] = useState<SlotType>('optic');
  const [family, setFamily] = useState(PLATFORMS[platform]?.family ?? (platform in FAMILIES ? platform : 'rifle'));
  const [plats, setPlats] = useState({ pistol: true, long: true });
  const [units, setUnits] = useState<GLB.Units>('auto');
  const [forward, setForward] = useState<GLB.Forward>('+x');
  const [weight, setWeight] = useState('');

  useEffect(() => {
    let alive = true;
    file.arrayBuffer().then(async buf => {
      const sc = await GLB.parseGLB(buf);
      if (alive) { setBuffer(buf); setScene(sc); }
    }).catch((e: Error) => alive && setErr(e.message));
    return () => { alive = false; };
  }, [file]);

  const preview = useMemo(() => {
    if (!scene) return null;
    const opts = { units, forward, slotType };
    const prep = kind === 'base' ? GLB.prepareBase(scene.clone(true), opts) : GLB.preparePart(scene.clone(true), opts);
    const s = prep.sizeMm;
    let info = `≈ ${Math.round(s.x)} × ${Math.round(s.y)} × ${Math.round(s.z)} mm (largo × alto × ancho) · unidades: ${prep.units}`;
    if ('found' in prep) info += prep.found.length ? ` · anclajes: ${prep.found.map(t => SLOT_LABEL[t]).join(', ')}` : ' · sin nodos slot_* (se estiman óptica y bocacha)';
    else info += prep.anchorNode ? ' · usa el nodo «attach»' : ' · anclaje automático';
    const g = new THREE.Group(); g.add(GLB.instantiate(prep.model)); g.add(new THREE.AxesHelper(Math.max(s.x, s.y) / 100 * 0.35));
    return { info, img: renderObject(g) };
  }, [scene, kind, units, forward, slotType]);

  const submit = async () => {
    if (!scene || !buffer) return;
    const platforms = Object.entries(plats).filter(([, v]) => v).map(([k]) => k);
    if (kind === 'part' && !platforms.length) { setErr('Elige al menos un tipo de arma compatible.'); return; }
    const rec: GLB.ModelRecord = {
      id: 'glb_' + uid(), kind, name: name.trim().slice(0, 40) || 'Modelo importado',
      slot: kind === 'part' ? slotType : undefined, family: kind === 'base' ? family : undefined,
      platforms: kind === 'part' ? platforms : undefined, units, forward,
      weight: Math.max(0, Math.round(Number(weight) || 0)), source: 'local', created: Date.now(),
    };
    registerModel(rec, scene);
    try { await GLB.storeModel({ ...rec, buffer }); } catch { useStore.getState().notify('Modelo añadido (no se pudo guardar en este navegador)'); }
    onDone(rec);
  };

  return (
    <Modal onClose={onCancel} className="form" dismissable={false}>
      <div className="row"><strong>Importar modelo GLB</strong></div>
      <div className="preview">
        {preview?.img ? <img src={preview.img} alt="Vista previa del modelo" /> : <img alt="" />}
        <div className="inf">{err ? '' : preview?.info ?? 'Leyendo modelo…'}</div>
      </div>
      <div className="fgrid">
        <div className="field">Tipo
          <div className="radios">
            <label><input type="radio" checked={kind === 'part'} onChange={() => setKind('part')} />Pieza</label>
            <label><input type="radio" checked={kind === 'base'} onChange={() => setKind('base')} />Cuerpo base</label>
          </div>
        </div>
        <label className="field">Nombre<input type="text" maxLength={40} value={name} onChange={e => setName(e.target.value)} /></label>
        {kind === 'part' ? (<>
          <label className="field">Ranura
            <select value={slotType} onChange={e => setSlotType(e.target.value as SlotType)}>
              {SLOT_TYPES.map(t => <option key={t} value={t}>{SLOT_LABEL[t]}</option>)}
            </select>
          </label>
          <div className="field">Compatible con
            <div className="checks">
              <label><input type="checkbox" checked={plats.pistol} onChange={e => setPlats(p => ({ ...p, pistol: e.target.checked }))} />Pistolas</label>
              <label><input type="checkbox" checked={plats.long} onChange={e => setPlats(p => ({ ...p, long: e.target.checked }))} />Armas largas</label>
            </div>
          </div>
        </>) : (
          <label className="field">Se comporta como (piezas compatibles)
            <select value={family} onChange={e => setFamily(e.target.value)}>
              {Object.entries(FAMILIES).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </select>
          </label>
        )}
        <label className="field">Unidades del archivo
          <select value={units} onChange={e => setUnits(e.target.value as GLB.Units)}>
            <option value="auto">Detectar automáticamente</option><option value="m">Metros</option><option value="cm">Centímetros</option><option value="mm">Milímetros</option>
          </select>
        </label>
        <label className="field">Hacia dónde apunta el cañón
          <select value={forward} onChange={e => setForward(e.target.value as GLB.Forward)}>
            <option value="+x">+X</option><option value="-x">−X</option><option value="+z">+Z</option><option value="-z">−Z</option>
          </select>
        </label>
        <label className="field">Peso aproximado (g, opcional)<input type="number" min={0} max={20000} step={1} value={weight} onChange={e => setWeight(e.target.value)} /></label>
      </div>
      <div className="err">{err}</div>
      <div className="row"><p className="muted">En la vista previa, el eje rojo debe apuntar hacia la boca y el verde hacia arriba.</p>
        <div style={{ display: 'flex', gap: 8 }}><button className="ghost" onClick={onCancel}>Cancelar</button><button className="primary" disabled={!scene} onClick={submit}>Añadir</button></div>
      </div>
    </Modal>
  );
}
