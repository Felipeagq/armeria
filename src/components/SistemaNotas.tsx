// Explicación breve de los términos del glosario bajo el dato («Sistema / cerrojo» o «Réplica airsoft»).
// Cada término es un desplegable nativo (<details>): sin hooks ni JS, sirve en servidor y en cliente y se maneja con teclado.
import Link from 'next/link';
import { sistemasDe, type CampoGlosario } from '@/three/data/sistemas';

export function SistemaNotas({ texto, campo = 'sistema' }: { texto?: string; campo?: CampoGlosario }) {
  const items = sistemasDe(texto, campo);
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
