'use client';
import { useEffect, useState } from 'react';
import { useStore } from '@/state/store';
import { loadSaved } from '@/state/build';
import { getViewer } from '@/three/engine/viewerRef';
import { requestPartThumb } from '@/three/engine/thumbs';
import { onPartRegistered, partById, registerModel } from '@/three/registry';
import * as GLB from '@/three/glb/models';
import Header from './Header';
import Catalog from './Catalog';
import Viewport from './Viewport';
import Inspector from './Inspector';
import Ficha from './Ficha';
import { ExportModal, ImportModal, ModelsModal, PickerModal } from './Modals';

const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? '';

/** Carga modelos publicados (manifest) e importados por el usuario (IndexedDB). */
async function loadCustomModels(): Promise<GLB.ModelRecord[]> {
  const records: GLB.ModelRecord[] = [];
  const tasks: Promise<void>[] = [];
  for (const m of await GLB.loadManifest(BASE_PATH)) {
    tasks.push((async () => {
      try {
        const scene = await GLB.parseGLB(await GLB.fetchModelFile(m.file, BASE_PATH));
        const replaced = m.replaces ? partById(m.replaces) : undefined;
        const rec: GLB.ModelRecord = {
          id: String(m.id ?? m.replaces ?? m.file), kind: m.kind === 'base' ? 'base' : 'part', name: String(m.name ?? m.id ?? 'Modelo'),
          slot: replaced?.type ?? m.slot, family: m.family, platforms: m.platforms, units: m.units, forward: m.forward,
          weight: Number(m.weight) || 0, replaces: m.replaces, source: 'manifest',
        };
        if (rec.kind === 'part' && !rec.slot) throw new Error('slot no válido');
        registerModel(rec, scene); records.push(rec);
      } catch (e) { console.warn('Manifiesto:', m.file, (e as Error).message); }
    })());
  }
  try {
    for (const r of await GLB.listStoredModels()) {
      tasks.push((async () => {
        try { const { buffer, ...rec } = r; registerModel(rec, await GLB.parseGLB(buffer)); records.push(rec); }
        catch (e) { console.warn('Modelo local:', r.name, (e as Error).message); }
      })());
    }
  } catch { /* IndexedDB no disponible */ }
  await Promise.all(tasks);
  return records;
}

export default function App() {
  const modal = useStore(s => s.modal);
  const toast = useStore(s => s.toast);
  const panel = useStore(s => s.panel);
  const pieceCount = useStore(s => Object.keys(s.build.parts).length + 1);
  const [records, setRecords] = useState<GLB.ModelRecord[]>([]);
  const [importFile, setImportFile] = useState<File | null>(null);
  const [dragging, setDragging] = useState(false);

  // Arranque: restaurar build guardado y cargar modelos GLB
  useEffect(() => {
    const saved = loadSaved();
    const s = useStore.getState();
    s.hydrate(saved);
    const off = onPartRegistered(p => requestPartThumb(p.id, true));
    loadCustomModels().then(recs => {
      if (!recs.length) return;
      setRecords(recs);
      s.hydrate(saved); // ahora las piezas/cuerpos GLB guardados ya existen
      s.bumpRegistry();
    });
    return () => { off(); };
  }, []);

  // Atajos de teclado
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement;
      if (t.matches('input, textarea, select')) return;
      const s = useStore.getState();
      const mod = e.ctrlKey || e.metaKey;
      if (mod && e.key.toLowerCase() === 'z') { e.preventDefault(); if (e.shiftKey) s.redo(); else s.undo(); return; }
      if (mod && e.key.toLowerCase() === 'y') { e.preventDefault(); s.redo(); return; }
      if (e.key === 'Escape') { if (importFile) setImportFile(null); else if (s.modal) s.openModal(null); else s.select(null); return; }
      if ((e.key === 'Delete' || e.key === 'Backspace') && s.selected && s.selected !== 'base') { e.preventDefault(); s.remove(s.selected); return; }
      if (mod || s.modal) return;
      const k = e.key.toLowerCase();
      if (k === 'e') s.toggleExplode();
      else if (k === 'r') s.toggleSpin();
      else if (k === '1') getViewer()?.setView('side');
      else if (k === '2') getViewer()?.setView('three');
      else if (k === '3') getViewer()?.setView('top');
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [importFile]);

  // Arrastrar y soltar un .glb en cualquier parte
  useEffect(() => {
    let depth = 0;
    const isFiles = (e: DragEvent) => !!e.dataTransfer && [...e.dataTransfer.types].includes('Files');
    const enter = (e: DragEvent) => { if (isFiles(e)) { depth++; setDragging(true); } };
    const leave = () => { if (--depth <= 0) { depth = 0; setDragging(false); } };
    const over = (e: DragEvent) => e.preventDefault();
    const drop = (e: DragEvent) => { e.preventDefault(); depth = 0; setDragging(false); const f = e.dataTransfer?.files[0]; if (f) openImport(f); };
    window.addEventListener('dragenter', enter); window.addEventListener('dragleave', leave);
    window.addEventListener('dragover', over); window.addEventListener('drop', drop);
    return () => { window.removeEventListener('dragenter', enter); window.removeEventListener('dragleave', leave); window.removeEventListener('dragover', over); window.removeEventListener('drop', drop); };
  }, []);

  function openImport(f: File) {
    if (!/\.glb$/i.test(f.name)) { useStore.getState().notify('Usa un archivo .glb (glTF binario)'); return; }
    if (f.size > GLB.MAX_BYTES) { useStore.getState().notify('El archivo supera 80 MB'); return; }
    useStore.getState().openModal(null);
    setImportFile(f);
  }
  function onImported(rec: GLB.ModelRecord) {
    setImportFile(null);
    setRecords(r => [...r, rec]);
    const s = useStore.getState();
    s.bumpRegistry();
    if (rec.kind === 'base') s.setPlatform(rec.id); else s.install(rec.id);
    s.notify(`${rec.name} añadido`);
  }

  return (
    <div className="app">
      <Header />
      <div className={`layout ${dragging ? 'dragging' : ''}`} data-panel={panel}>
        <Catalog />
        <Viewport />
        <Inspector />
        <Ficha />
        {/* Solo visible en móvil (CSS): alterna el panel que se muestra junto al visor */}
        <nav className="tabs" aria-label="Paneles">
          <button aria-pressed={panel === 'ficha'} onClick={() => useStore.getState().setPanel('ficha')}>Ficha</button>
          <button aria-pressed={panel === 'parts'} onClick={() => useStore.getState().setPanel('parts')}>Catálogo</button>
          <button aria-pressed={panel === 'build'} onClick={() => useStore.getState().setPanel('build')}>Lienzo <b>{pieceCount}</b></button>
        </nav>
      </div>
      {modal === 'picker' && <PickerModal />}
      {modal === 'export' && <ExportModal />}
      {modal === 'models' && <ModelsModal records={records} onPickFile={openImport} onDeleted={id => { setRecords(r => r.filter(x => x.id !== id)); const s = useStore.getState(); s.bumpRegistry(); s.hydrate(s.build); s.notify('Modelo eliminado'); }} />}
      {importFile && <ImportModal file={importFile} onDone={onImported} onCancel={() => setImportFile(null)} />}
      {/* El aviso se remonta con cada mensaje (key) y se oculta solo mediante animación CSS */}
      {toast && <div key={toast.id} className="toast flash" role="status" aria-live="polite">{toast.msg}</div>}
    </div>
  );
}
