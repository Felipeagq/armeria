// Explicación breve de los términos de «Sistema / cerrojo» bajo el dato. Sin hooks: sirve en servidor y en cliente.
import Link from 'next/link';
import { sistemasDe } from '@/three/data/sistemas';

export function SistemaNotas({ texto }: { texto?: string }) {
  const items = sistemasDe(texto);
  if (!items.length) return null;
  return (
    <ul className="wglos">
      {items.map(s => (
        <li key={s.id}><b>{s.nombre}.</b> {s.corto} <Link href={`/sistemas/#${s.id}`} aria-label={`Más sobre ${s.nombre}`}>Más ›</Link></li>
      ))}
    </ul>
  );
}
