import type { Metadata } from 'next';
import Link from 'next/link';
import SiteNav from '@/components/SiteNav';
import SiteFooter from '@/components/SiteFooter';
import { IconCube } from '@/components/icons';
import { getCatalogo } from '@/catalogo/datos';
import { GRUPOS_ACC, slugGrupo as slug } from '@/catalogo/util';

export const metadata: Metadata = {
  title: 'Accesorios',
  description: 'Enciclopedia de accesorios: miras, bocachas, linternas y láseres, empuñaduras, cargadores y culatas. Datos técnicos, cómo funcionan, ventajas, límites y qué cambia en airsoft.',
};

export default async function AccesoriosPage() {
  const cat = await getCatalogo();
  return (
    <>
      <SiteNav current="accesorios" />
      <main id="main" className="wikimain">
        <h1>Accesorios</h1>
        <p className="wikilead">{cat.accesorios.length} fichas de miras, bocachas, luces, empuñaduras, cargadores y culatas. Cada una explica cómo funciona, da sus datos técnicos y dice en qué armas del catálogo se puede montar.</p>
        <nav className="wjump" aria-label="Grupos de accesorios">
          {GRUPOS_ACC.map(g => <a className="wchip" key={g} href={`#${slug(g)}`}>{g}<b>{cat.accDelGrupo(g).length}</b></a>)}
        </nav>
        {GRUPOS_ACC.map(g => (
          <section key={g} aria-labelledby={`h-${slug(g)}`} id={slug(g)} className="wgrp">
            <h2 id={`h-${slug(g)}`}>{g}</h2>
            <ul className="windex acc">
              {cat.accDelGrupo(g).map(a => (
                <li key={a.id}>
                  <Link href={`/accesorios/${a.id}/`}>
                    <span className="wi-thumb">{a.foto ? <img src={a.foto.miniUrl ?? a.foto.url} alt="" width={160} height={110} loading="lazy" decoding="async" /> : <IconCube aria-hidden />}</span>
                    <span className="wi-name">{a.nombre}<small lang="en">{a.tecnico[0]}</small></span>
                    <span className="wi-maker">{a.resumen}</span>
                    <span className="wi-spec">{a.clave.slice(0, 2).map(([, v]) => v).join(' · ')}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </main>
      <SiteFooter />
    </>
  );
}
