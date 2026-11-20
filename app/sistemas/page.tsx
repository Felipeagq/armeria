import type { Metadata } from 'next';
import Link from 'next/link';
import SiteNav from '@/components/SiteNav';
import SiteFooter from '@/components/SiteFooter';
import { MoaPuntos } from '@/components/MoaPuntos';
import { getCatalogo } from '@/catalogo/datos';
import { GRUPOS_SISTEMA, campoDe, textoAcc } from '@/catalogo/util';

export const metadata: Metadata = {
  title: 'Glosario: sistemas, réplicas, miras y accesorios',
  description: 'Qué significan los sistemas de funcionamiento y los cerrojos de las fichas: impulsión directa, pistón corto y largo, retroceso corto, cerrojo rotativo, cómo funcionan por dentro las réplicas de airsoft (AEG, AEP y blowback de gas) y los términos de miras y accesorios: MOA, riel Picatinny, M-LOK, STANAG, rosca de boca y retícula.',
};

export default async function SistemasPage() {
  const cat = await getCatalogo();
  return (
    <>
      <SiteNav current="glosario" />
      <main id="main" className="wikimain">
        <h1>Glosario</h1>
        <p className="wikilead">En cada disparo un arma hace tres cosas: usa la energía del disparo para recargar, cierra la recámara mientras la presión es alta y percute el siguiente cartucho. Estos son los términos que aparecen en el campo «Sistema / cerrojo» de las fichas, más los que explican cómo funcionan por dentro las réplicas de airsoft y los que aparecen en las fichas de miras y accesorios (MOA, Picatinny, STANAG…).</p>

        {GRUPOS_SISTEMA.map(g => (
          <section key={g} aria-labelledby={`g-${g}`}>
            <h2 id={`g-${g}`}>{g}</h2>
            {cat.sistemas.filter(s => s.grupo === g).map(s => {
              const campo = campoDe(s.grupo);
              const usan = campo === 'accesorio'
                ? cat.accesorios.filter(a => s.patron.test(textoAcc(a))).map(a => ({ id: a.id, name: a.nombre, href: `/accesorios/${a.id}/` }))
                : cat.armas.filter(a => [a.common[campo], ...a.variants.map(v => v.specs[campo])].some(t => t && s.patron.test(t))).map(a => ({ id: a.id, name: a.name, href: `/armas/${a.id}/` }));
              return (
                <article key={s.id} id={s.id} className="wterm">
                  <h3>{s.nombre}</h3>
                  <p className="wterm-short">{s.corto}</p>
                  <p>{s.detalle}</p>
                  {s.id === 'moa' && <MoaPuntos />}
                  {usan.length > 0 && (
                    <p className="wterm-use">
                      <span>En el catálogo:</span>{' '}
                      {usan.map((a, i) => <span key={a.id}>{i > 0 && ', '}<Link href={a.href}>{a.name}</Link></span>)}
                    </p>
                  )}
                </article>
              );
            })}
          </section>
        ))}
      </main>
      <SiteFooter />
    </>
  );
}
