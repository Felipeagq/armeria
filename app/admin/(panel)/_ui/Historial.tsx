import Link from 'next/link';
import type { FilaRegistro } from '@/admin/repo';
import { segDeTipo } from '@/admin/entidades';
import { cambios } from '@/admin/diff';
import { fechaCorta } from '@/admin/util';

const ACCION: Record<string, string> = {
  crear: 'Creó', editar: 'Editó', archivar: 'Archivó', restaurar: 'Restauró',
  'imagen-añadir': 'Añadió imagen', 'imagen-editar': 'Editó imagen', 'imagen-ordenar': 'Ordenó imágenes', 'imagen-archivar': 'Quitó imagen', 'imagen-restaurar': 'Restauró imagen',
};

/** Lista de cambios con el antes y el después de cada campo modificado. Componente de servidor. */
export function Historial({ filas, enlazar = false }: { filas: FilaRegistro[]; enlazar?: boolean }) {
  if (!filas.length) return <p className="admayuda">Todavía no hay cambios registrados.</p>;
  return (
    <ul className="admreg">
      {filas.map(f => {
        const seg = segDeTipo(f.entidadTipo);
        const dif = f.accion === 'crear' ? [] : cambios(f.antes, f.despues);
        return (
          <li key={f.id}>
            <details>
              <summary>
                <span className={`admacc ${f.accion}`}>{ACCION[f.accion] ?? f.accion}</span>
                {enlazar && seg
                  ? <Link href={`/admin/${seg}/${encodeURIComponent(f.entidadId)}/`}>{f.entidadTipo} · {f.entidadId}</Link>
                  : null}
                <small>{f.usuario} · <time dateTime={new Date(f.fecha).toISOString()}>{fechaCorta(f.fecha)}</time>{dif.length ? ` · ${dif.length} campo${dif.length === 1 ? '' : 's'}` : ''}</small>
              </summary>
              {f.accion === 'crear'
                ? <p className="admayuda">Ficha creada.</p>
                : dif.length === 0 ? <p className="admayuda">Sin diferencias de contenido.</p>
                : <dl className="admdif">{dif.map(c => (
                    <div key={c.campo}>
                      <dt>{c.campo}</dt>
                      <dd><pre className="antes">{c.antes}</pre><pre className="despues">{c.despues}</pre></dd>
                    </div>
                  ))}</dl>}
            </details>
          </li>
        );
      })}
    </ul>
  );
}
