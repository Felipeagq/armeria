'use client';

import { archivarAccion } from '../acciones-contenido';

/** Archivar pide confirmación (se puede deshacer); restaurar no. */
export function BotonArchivar({ seg, id, archivado, nombre }: { seg: string; id: string; archivado: boolean; nombre: string }) {
  return (
    <form action={archivarAccion} onSubmit={e => { if (!archivado && !confirm(`¿Archivar «${nombre}»?\n\nDejará de verse en el sitio. Podrás restaurarlo cuando quieras.`)) e.preventDefault(); }}>
      <input type="hidden" name="seg" value={seg} />
      <input type="hidden" name="id" value={id} />
      <input type="hidden" name="archivar" value={archivado ? '0' : '1'} />
      <button type="submit" className={archivado ? 'primary' : 'ghost sm admpeligro'}>{archivado ? 'Restaurar' : 'Archivar'}</button>
    </form>
  );
}
