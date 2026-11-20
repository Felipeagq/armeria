import type { Metadata } from 'next';
import { Suspense } from 'react';
import SiteNav from '@/components/SiteNav';
import SiteFooter from '@/components/SiteFooter';
import ArmasBuscador from '@/components/ArmasBuscador';
import { ArmasLista } from '@/components/ArmasLista';
import { getCatalogo } from '@/catalogo/datos';
import { ARMA_GROUPS } from '@/catalogo/util';
import { ENABLE_3D } from '@/config';

export const metadata: Metadata = {
  title: { absolute: 'Armería 3D: fichas de armas y réplicas airsoft' },
  description: `Fichas técnicas de fusiles, carabinas y pistolas reales con datos de sus réplicas de airsoft. Compara modelos${ENABLE_3D ? ' y monta algunos en 3D con accesorios' : ''}.`,
};

export default async function HomePage() {
  const cat = await getCatalogo();
  const n3d = cat.armas.filter(a => a.variants.some(v => v.platform)).length;
  const cards = cat.cards();
  return (
    <>
      <SiteNav current="armas" />
      <main id="main" className="wikimain wide">
        <h1>Armas</h1>
        <p className="wikilead">Ficha técnica de cada arma real y de su réplica de airsoft. {cat.armas.length} modelos{ENABLE_3D && `; ${n3d} se pueden montar en 3D`}.</p>
        {/* Los filtros viven en la URL (useSearchParams): el HTML inicial lleva el índice completo y el cliente lo hidrata */}
        <Suspense fallback={<ArmasLista cards={cards} groups={ARMA_GROUPS} />}>
          <ArmasBuscador cards={cards} groups={ARMA_GROUPS} />
        </Suspense>
      </main>
      <SiteFooter />
    </>
  );
}
