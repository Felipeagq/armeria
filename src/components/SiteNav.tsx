// Cabecera de las páginas de la enciclopedia (renderizada en el servidor).
// Es un <div> y no un <header> para no heredar los estilos de la cabecera del constructor.
import Link from 'next/link';
import { Logo } from './icons';
import BuscadorGlobal from './BuscadorGlobal';

type Seccion = 'armas' | 'comparar' | 'accesorios' | 'balas' | 'glosario' | 'montar';

export default function SiteNav({ current }: { current?: Seccion }) {
  const cur = (s: Seccion) => (current === s ? 'page' : undefined);
  return (
    <div className="wikihead" role="banner">
      <Link href="/" className="logo"><Logo /><div>Armería 3D<small>Enciclopedia airsoft</small></div></Link>
      <div className="whacts">
        <BuscadorGlobal />
        <nav aria-label="Secciones">
          <Link href="/" aria-current={cur('armas')}>Armas</Link>
          <Link href="/comparar/" aria-current={cur('comparar')}>Comparar</Link>
          <Link href="/accesorios/" aria-current={cur('accesorios')}>Accesorios</Link>
          <Link href="/balas/" aria-current={cur('balas')}>Balas</Link>
          {/* En móvil la barra inferior solo tiene 5 huecos: el glosario sigue en el pie, en el buscador y en los enlaces «Más ›». */}
          <Link href="/sistemas/" className="nav-extra" aria-current={cur('glosario')}>Glosario</Link>
          <Link href="/montar/" aria-current={cur('montar')}>Montar</Link>
        </nav>
      </div>
    </div>
  );
}
