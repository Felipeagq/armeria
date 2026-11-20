// Explicación breve de los términos del glosario bajo el dato («Sistema / cerrojo», «Réplica airsoft» o el texto de un accesorio).
// Cada término es un desplegable nativo (<details>): sin hooks ni JS, sirve en servidor y en cliente y se maneja con teclado.
// Los términos llegan ya calculados (catalogo.sistemasDe): este componente no lee datos.
import Link from 'next/link';
import type { TerminoLite } from '@/catalogo/tipos';

export function SistemaNotas({ items }: { items: TerminoLite[] }) {
  if (!items.length) return null;
  return (
    <ul className="wglos">
      {items.map(s => (
        <li key={s.id}>
          <details>
            <summary>{s.nombre}</summary>
            <p>{s.corto} <Link href={`/sistemas/#${s.id}`} aria-label={`Más sobre ${s.nombre}`}>Más ›</Link></p>
          </details>
        </li>
      ))}
    </ul>
  );
}
