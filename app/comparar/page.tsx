import type { Metadata } from 'next';
import { Suspense } from 'react';
import SiteNav from '@/components/SiteNav';
import SiteFooter from '@/components/SiteFooter';
import Comparador from '@/components/Comparador';
import { getCatalogo } from '@/catalogo/datos';

export const metadata: Metadata = {
  title: 'Comparar armas',
  description: 'Compara fusiles, carabinas y pistolas lado a lado: calibre, peso, cañón, cadencia, cargador y más.',
};

export default async function CompararPage() {
  const cat = await getCatalogo();
  return (
    <>
      <SiteNav current="comparar" />
      <main id="main" className="wikimain wide">
        <h1>Comparar armas</h1>
        <p className="wikilead">Calibre, peso, cañón, cadencia y cargador de dos o tres armas, lado a lado. La comparación se guarda en el enlace.</p>
        <Suspense fallback={<p className="muted">Cargando comparador…</p>}>
          <Comparador armas={cat.comps()} />
        </Suspense>
      </main>
      <SiteFooter />
    </>
  );
}
