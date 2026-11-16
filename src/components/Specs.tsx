'use client';
// Piezas compartidas de la ficha técnica: la usan el inspector (escritorio/tableta) y la vista «Ficha» (móvil).
import Link from 'next/link';
import type { Platform } from '@/three/types';
import { ammoForCalibre } from '@/three/data/ammo';
import { SistemaNotas } from './SistemaNotas';
import { specRowsOf } from '@/three/data/spec-labels';
import { photoFor, photoUrl } from '@/three/data/photos';
import { PLATFORMS } from '@/three/registry';

/** Filas de la ficha que tienen dato para esta plataforma. */
export const specRows = (P: Platform) => specRowsOf(P.specs);

/** Enlaces a la ficha de munición de los cartuchos que menciona el texto de calibre. */
function AmmoLinks({ calibre }: { calibre?: string }) {
  const list = ammoForCalibre(calibre);
  if (!list.length) return null;
  return <span className="ammrow">{list.map(c => <Link key={c.id} className="ammlink" href={`/balas/${c.id}/`}>Ver {c.short} ›</Link>)}</span>;
}

/** `skip`: campos que la vista ya muestra aparte (p. ej. en la fila de cifras clave). */
export function SpecRows({ P, skip = [], glosario = false }: { P: Platform; skip?: string[]; glosario?: boolean }) {
  return (
    <dl>
      {specRows(P).filter(([k]) => !skip.includes(k)).map(([k, label]) => (
        <div className="sr" key={k}><dt>{label}</dt><dd>{P.specs?.[k]}{k === 'calibre' && <AmmoLinks calibre={P.specs?.[k]} />}{glosario && (k === 'sistema' || k === 'airsoft') && <SistemaNotas texto={P.specs?.[k]} campo={k} />}</dd></div>
      ))}
    </dl>
  );
}

export const SpecSource = ({ P }: { P: Platform }) => (
  <p className="src">Datos del arma real. Fuente: {P.specs?.fuente ?? '—'}. Los valores varían según configuración y munición.</p>
);

export function PhotoFigure({ pid, name }: { pid: string; name: string }) {
  const photo = photoFor(pid, PLATFORMS[pid]?.model);
  if (!photo) return null;
  const real = photo.kind === 'real';
  return (
    // key: al cambiar de modelo se descarta el estado «oculta» de una foto que falló al cargar
    <figure className="spfig" key={pid}>
      <img src={photoUrl(photo)} alt={`${name}: foto ${real ? 'del arma real' : 'de la réplica de airsoft'}`} width={1600} height={900} loading="lazy" decoding="async"
        onError={e => e.currentTarget.closest('figure')?.setAttribute('hidden', '')} />
      <figcaption>
        {real ? 'Foto del arma real' : 'Foto de la réplica de airsoft'}{photo.author && ` · ${photo.author}`}
        {photo.license && <> · {photo.licenseUrl ? <a href={photo.licenseUrl} target="_blank" rel="noopener noreferrer">{photo.license}</a> : photo.license}</>}
        {photo.source && <> · <a href={photo.source} target="_blank" rel="noopener noreferrer">Wikimedia Commons</a></>}
      </figcaption>
    </figure>
  );
}
