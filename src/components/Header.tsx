'use client';
import Link from 'next/link';
import { useStore } from '@/state/store';
import { PLATFORMS } from '@/three/registry';
import { IconChevron, IconCube, IconDownload, IconRedo, IconReset, IconUndo, Logo } from './icons';

export default function Header() {
  const build = useStore(s => s.build);
  const canUndo = useStore(s => s.past.length > 0);
  const canRedo = useStore(s => s.future.length > 0);
  const { undo, redo, reset, rename, openModal } = useStore.getState();
  const P = PLATFORMS[build.platform];

  return (
    <header>
      <div className="logo"><Logo /><div>Armería 3D<small>Constructor airsoft</small></div></div>
      <div className="sep" />
      <input
        className="name" aria-label="Nombre del build" maxLength={48}
        key={build.name} defaultValue={build.name}
        onBlur={e => rename(e.target.value)}
        onKeyDown={e => { if (e.key === 'Enter') e.currentTarget.blur(); }}
      />
      <div className="spacer" />
      <button className="modelbtn" title="Elegir modelo" aria-haspopup="dialog" onClick={() => openModal('picker')}>
        <span className="mk">{P.short || P.name}</span>
        {P.variant && <span className="vr">{P.variant}</span>}
        <IconChevron />
      </button>
      <div className="sep" />
      <button className="iconbtn" title="Deshacer (Ctrl+Z)" disabled={!canUndo} onClick={undo}><IconUndo /></button>
      <button className="iconbtn" title="Rehacer (Ctrl+Shift+Z)" disabled={!canRedo} onClick={redo}><IconRedo /></button>
      <button className="iconbtn" title="Restablecer build" onClick={reset}><IconReset /></button>
      <Link className="ghost hnav" href="/balas/" title="Enciclopedia de munición">Balas</Link>
      {/* En pantallas estrechas solo se muestra el icono (.lbl se oculta); title/aria-label mantienen el nombre accesible */}
      <button className="ghost" title="Importar y gestionar modelos GLB" aria-label="Modelos 3D" onClick={() => openModal('models')}><IconCube /><span className="lbl">Modelos 3D</span></button>
      <button className="primary" title="Exportar PNG" aria-label="Exportar PNG" onClick={() => openModal('export')}><IconDownload /><span className="lbl">Exportar PNG</span></button>
    </header>
  );
}
