// Cabecera de las páginas de la enciclopedia (renderizada en el servidor).
// Es un <div> y no un <header> para no heredar los estilos de la cabecera del constructor.
// En móvil la navegación pasa a un dock de cristal fijo abajo, al alcance del pulgar: por eso cada sección lleva su icono.
import Link from 'next/link';
import { IconAccesorios, IconArmas, IconBalas, IconComparar, IconCube, IconGlosario, Logo } from './icons';
import BuscadorGlobal from './BuscadorGlobal';
import { ENABLE_3D } from '@/config';

type Seccion = 'armas' | 'comparar' | 'accesorios' | 'balas' | 'glosario' | 'montar';

export default function SiteNav({ current }: { current?: Seccion }) {
  const cur = (s: Seccion) => (current === s ? 'page' : undefined);
  return (
    <div className="wikihead" role="banner">
      <Link href="/" className="logo"><Logo /><div><span className="logo-name">Armería 3D</span><small>Enciclopedia airsoft</small></div></Link>
      <div className="whacts">
        <BuscadorGlobal />
        <nav aria-label="Secciones">
          <Link href="/" aria-current={cur('armas')}><IconArmas /><span>Armas</span></Link>
          <Link href="/comparar/" aria-current={cur('comparar')}><IconComparar /><span>Comparar</span></Link>
          <Link href="/accesorios/" aria-current={cur('accesorios')}><IconAccesorios /><span>Accesorios</span></Link>
          <Link href="/balas/" aria-current={cur('balas')}><IconBalas /><span>Balas</span></Link>
          {/* El dock móvil tiene cinco huecos: con el 3D encendido, el glosario cede el sitio al constructor (sigue en el pie y en el buscador). */}
          <Link href="/sistemas/" className={ENABLE_3D ? 'nav-extra' : undefined} aria-current={cur('glosario')}><IconGlosario /><span>Glosario</span></Link>
          {ENABLE_3D && <Link href="/montar/" aria-current={cur('montar')}><IconCube /><span>Montar</span></Link>}
        </nav>
      </div>
    </div>
  );
}
