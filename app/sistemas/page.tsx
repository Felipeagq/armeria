import type { Metadata } from 'next';
import Link from 'next/link';
import SiteNav from '@/components/SiteNav';
import { ARMAS } from '@/three/data/armas';
import { GRUPOS_SISTEMA, SISTEMAS } from '@/three/data/sistemas';

export const metadata: Metadata = {
  title: 'Sistemas y cerrojos',
  description: 'Qué significan los sistemas de funcionamiento y los cerrojos de las fichas: impulsión directa, pistón corto y largo, retroceso corto, cerrojo rotativo y más.',
};

export default function SistemasPage() {
  return (
    <>
      <SiteNav current="armas" />
      <main id="main" className="wikimain">
        <p className="crumbs"><Link href="/">← Armas</Link></p>
        <h1>Sistemas y cerrojos</h1>
        <p className="wikilead">En cada disparo un arma hace tres cosas: usa la energía del disparo para recargar, cierra la recámara mientras la presión es alta y percute el siguiente cartucho. Estos son los términos que aparecen en el campo «Sistema / cerrojo» de las fichas.</p>

        {GRUPOS_SISTEMA.map(g => (
          <section key={g} aria-labelledby={`g-${g}`}>
            <h2 id={`g-${g}`}>{g}</h2>
            {SISTEMAS.filter(s => s.grupo === g).map(s => {
              const usan = ARMAS.filter(a => [a.common.sistema, ...a.variants.map(v => v.specs.sistema)].some(t => t && s.patron.test(t)));
              return (
                <article key={s.id} id={s.id} className="wterm">
                  <h3>{s.nombre}</h3>
                  <p className="wterm-short">{s.corto}</p>
                  <p>{s.detalle}</p>
                  {usan.length > 0 && (
                    <p className="wterm-use">
                      <span>En el catálogo:</span>{' '}
                      {usan.map((a, i) => <span key={a.id}>{i > 0 && ', '}<Link href={`/armas/${a.id}/`}>{a.name}</Link></span>)}
                    </p>
                  )}
                </article>
              );
            })}
          </section>
        ))}
      </main>
    </>
  );
}
