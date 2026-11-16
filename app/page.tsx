import type { Metadata } from 'next';
import { Suspense } from 'react';
import SiteNav from '@/components/SiteNav';
import SiteFooter from '@/components/SiteFooter';
import ArmasBuscador from '@/components/ArmasBuscador';
import { ArmasLista } from '@/components/ArmasLista';
import { ARMAS, ARMA_GROUPS, armaCards, has3d } from '@/three/data/armas';

export const metadata: Metadata = {
  title: { absolute: 'Armería 3D: fichas de armas y réplicas airsoft' },
  description: 'Fichas técnicas de fusiles, carabinas y pistolas reales con datos de sus réplicas de airsoft. Compara modelos y monta algunos en 3D con accesorios.',
};

export default function HomePage() {
  const n3d = ARMAS.filter(has3d).length;
  const cards = armaCards();
  return (
    <>
      <SiteNav current="armas" />
      <main id="main" className="wikimain">
        <h1>Armas</h1>
        <p className="wikilead">Ficha técnica de cada arma real y de su réplica de airsoft. {ARMAS.length} modelos; {n3d} se pueden montar en 3D.</p>
        {/* Los filtros viven en la URL (useSearchParams): el HTML inicial lleva el índice completo y el cliente lo hidrata */}
        <Suspense fallback={<ArmasLista cards={cards} groups={ARMA_GROUPS} />}>
          <ArmasBuscador cards={cards} groups={ARMA_GROUPS} />
        </Suspense>
      </main>
      <SiteFooter />
    </>
  );
}
