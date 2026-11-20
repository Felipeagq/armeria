// Pie de las páginas de la enciclopedia (servidor): mismas secciones que la cabecera, más el glosario, y de dónde salen los datos.
import Link from 'next/link';
import { ENABLE_3D } from '@/config';

export default function SiteFooter({ ancho = false }: { ancho?: boolean }) {
  return (
    <footer className={`wikifoot${ancho ? ' wide' : ''}`}>
      <nav aria-label="Pie de página">
        <ul>
          <li><Link href="/">Armas</Link></li>
          <li><Link href="/comparar/">Comparar</Link></li>
          <li><Link href="/accesorios/">Accesorios</Link></li>
          <li><Link href="/balas/">Balas</Link></li>
          <li><Link href="/sistemas/">Glosario</Link></li>
          {ENABLE_3D && <li><Link href="/montar/">Montar en 3D</Link></li>}
        </ul>
      </nav>
      <p>Enciclopedia de armas reales y de sus réplicas de airsoft. Los datos vienen de Wikipedia y de los fabricantes; cada ficha cita su fuente y la autoría de sus fotos. Los valores varían según configuración y munición.</p>
    </footer>
  );
}
