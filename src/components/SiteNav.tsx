// Cabecera de las páginas de la enciclopedia (renderizada en el servidor).
// Es un <div> y no un <header> para no heredar los estilos de la cabecera del constructor.
import Link from 'next/link';
import { Logo } from './icons';

export default function SiteNav({ current }: { current: 'armas' | 'balas' }) {
  return (
    <div className="wikihead" role="banner">
      <Link href="/" className="logo"><Logo /><div>Armería 3D<small>Enciclopedia airsoft</small></div></Link>
      <nav aria-label="Secciones">
        <Link href="/" aria-current={current === 'armas' ? 'page' : undefined}>Armas</Link>
        <Link href="/balas/" aria-current={current === 'balas' ? 'page' : undefined}>Balas</Link>
      </nav>
    </div>
  );
}
