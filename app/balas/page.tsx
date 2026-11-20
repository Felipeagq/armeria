import type { Metadata } from 'next';
import Link from 'next/link';
import SiteNav from '@/components/SiteNav';
import SiteFooter from '@/components/SiteFooter';
import { getCatalogo } from '@/catalogo/datos';
import { IconCube } from '@/components/icons';

export const metadata: Metadata = {
  title: 'Munición',
  description: 'Enciclopedia de munición: los cartuchos de las armas del catálogo (5,56×45, 5,45×39, 7,62×39, 7,62×51, .300 BLK, 9×19 y .45 ACP) y la bola de 6 mm del airsoft.',
};

export default async function BalasPage() {
  const cat = await getCatalogo();
  return (
    <>
      <SiteNav current="balas" />
      <main id="main" className="wikimain">
        <h1>Munición</h1>
        <p className="wikilead">Los cartuchos de las armas del catálogo y la bola de 6 mm de las réplicas de airsoft. Cada ficha reúne dimensiones, carga típica y qué armas la usan.</p>
        <ul className="windex">
          {cat.ammo.map(c => (
            <li key={c.id}>
              <Link href={`/balas/${c.id}/`}>
                <span className="wi-thumb">{c.foto ? <img src={c.foto.url} alt="" width={160} height={100} loading="lazy" decoding="async" /> : <IconCube aria-hidden />}</span>
                <span className="wi-name">{c.name}</span>
                <span className="wi-maker">{c.tagline}</span>
                <span className="wi-spec">{c.key.map(([, v]) => v).join(', ')}</span>
              </Link>
            </li>
          ))}
        </ul>
      </main>
      <SiteFooter />
    </>
  );
}
