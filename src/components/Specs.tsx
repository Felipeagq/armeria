'use client';
// Piezas compartidas de la ficha técnica: la usan el inspector (escritorio/tableta) y la vista «Ficha» (móvil).
import type { Platform, Specs } from '@/three/types';
import { photoFor, photoUrl } from '@/three/data/photos';

export const SPEC_LABELS: [keyof Specs, string][] = [
  ['calibre', 'Calibre'], ['peso', 'Peso'], ['cañon', 'Cañón'], ['sistema', 'Sistema / cerrojo'], ['cadencia', 'Cadencia'],
  ['velocidad', 'Velocidad inicial'], ['alcance', 'Alcance eficaz'], ['cargador', 'Cargador'], ['airsoft', 'Réplica airsoft'], ['extra', 'Notas'],
];

/** Filas de la ficha que tienen dato para esta plataforma. */
export const specRows = (P: Platform) => SPEC_LABELS.filter(([k]) => P.specs?.[k]);

export function SpecRows({ P }: { P: Platform }) {
  return (
    <dl>
      {specRows(P).map(([k, label]) => (
        <div className="sr" key={k}><dt>{label}</dt><dd>{P.specs?.[k]}</dd></div>
      ))}
    </dl>
  );
}

export const SpecSource = ({ P }: { P: Platform }) => (
  <p className="src">Datos del arma real. Fuente: {P.specs?.fuente ?? '—'}. Los valores varían según configuración y munición.</p>
);

export function PhotoFigure({ pid, name }: { pid: string; name: string }) {
  const photo = photoFor(pid);
  if (!photo) return null;
  const real = photo.kind === 'real';
  return (
    // key: al cambiar de modelo se descarta el estado «oculta» de una foto que falló al cargar
    <figure className="spfig" key={pid}>
      <img src={photoUrl(photo)} alt={`${name}: foto ${real ? 'del arma real' : 'de la réplica de airsoft'}`} loading="lazy" decoding="async"
        onError={e => e.currentTarget.closest('figure')?.setAttribute('hidden', '')} />
      <figcaption>
        {real ? 'Foto del arma real' : 'Foto de la réplica de airsoft'} · {photo.author} ·{' '}
        {photo.licenseUrl ? <a href={photo.licenseUrl} target="_blank" rel="noopener noreferrer">{photo.license}</a> : photo.license} ·{' '}
        <a href={photo.source} target="_blank" rel="noopener noreferrer">Wikimedia Commons</a>
      </figcaption>
    </figure>
  );
}
