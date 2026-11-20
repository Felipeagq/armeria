// Imágenes de apoyo de una ficha: cuadrícula con las fotos de la galería (BD). Sin hooks: sirve en servidor.
import type { Foto } from '@/catalogo/tipos';
import { MOSTRAR_CREDITOS } from '@/config';

export default function Galeria({ fotos, nombre }: { fotos: Foto[]; nombre: string }) {
  if (!fotos.length) return null;
  return (
    <section className="wgal" aria-labelledby="wgal-t">
      <h2 id="wgal-t">Más imágenes</h2>
      <ul>
        {fotos.map(g => (
          <li key={g.url}>
            <figure>
              <a className="wgimg" href={g.url} target="_blank" rel="noopener noreferrer" aria-label={`Ver ampliada: ${g.titulo || nombre}`}>
                <img src={g.url} alt={g.alt || nombre} loading="lazy" decoding="async" width={900} height={675} />
              </a>
              {(g.titulo || (MOSTRAR_CREDITOS && g.fuenteUrl)) && (
                <figcaption>
                  {g.titulo}
                  {MOSTRAR_CREDITOS && g.fuenteUrl && (<>
                    . {g.autor && `${g.autor}. `}
                    {g.licenciaUrl ? <a href={g.licenciaUrl} target="_blank" rel="noopener noreferrer">{g.licencia}</a> : g.licencia}.{' '}
                    <a href={g.fuenteUrl} target="_blank" rel="noopener noreferrer">Wikimedia Commons</a>
                  </>)}
                </figcaption>
              )}
            </figure>
          </li>
        ))}
      </ul>
    </section>
  );
}
