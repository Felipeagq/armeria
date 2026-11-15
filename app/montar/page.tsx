import type { Metadata } from 'next';
import ClientApp from '@/components/ClientApp';

export const metadata: Metadata = {
  title: 'Constructor 3D',
  description: 'Monta una réplica de airsoft en 3D: elige modelo, añade accesorios, cambia colores y exporta la imagen.',
};

// El constructor (three.js) solo se carga en esta ruta; el resto del sitio no lo necesita.
export default function MontarPage() {
  return <ClientApp />;
}
