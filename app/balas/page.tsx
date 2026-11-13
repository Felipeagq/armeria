import type { Metadata } from 'next';
import Link from 'next/link';
import SiteNav from '@/components/SiteNav';
import { AMMO } from '@/three/data/ammo';

export const metadata: Metadata = {
  title: 'Munición — Armería 3D',
  description: 'Enciclopedia de munición: los cartuchos de las armas del catálogo (5,56×45, 5,45×39, 7,62×39, 7,62×51, .300 BLK) y la bola de 6 mm del airsoft.',
};

export default function BalasPage() {
  return (
    <>
      <SiteNav current="balas" />
      <main className="wikimain">
        <h1>Munición</h1>
        <p className="wikilead">Los cartuchos de las armas del catálogo y la bola de 6 mm que usan las réplicas de airsoft. Cada ficha reúne dimensiones, carga típica y qué armas la usan.</p>
        <div className="wgrid">
          {AMMO.map(c => (
            <Link key={c.id} className="wcard" href={`/balas/${c.id}/`}>
              <div className="wthumb"><img src={`/ammo/${c.photo.file}`} alt={c.photo.alt} loading="lazy" decoding="async" /></div>
              <div>
                <b>{c.name}</b>
                <span>{c.tagline}</span>
                <small>{c.key.map(([, v]) => v).join(' · ')}</small>
              </div>
            </Link>
          ))}
        </div>
      </main>
    </>
  );
}
