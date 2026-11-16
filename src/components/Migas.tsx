// Migas de pan: dónde estás y cómo subir un nivel. El último elemento es la página actual (sin enlace).
// Sin hooks: sirve en servidor.
import Link from 'next/link';

export interface Miga { label: string; href?: string }

export function Migas({ items }: { items: Miga[] }) {
  return (
    <nav className="migas" aria-label="Ruta de navegación">
      <ol>
        {items.map((m, i) => (
          <li key={i}>{m.href ? <Link href={m.href}>{m.label}</Link> : <span aria-current="page">{m.label}</span>}</li>
        ))}
      </ol>
    </nav>
  );
}
