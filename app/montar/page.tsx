import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import ClientApp from '@/components/ClientApp';
import { ENABLE_3D } from '@/config';

export const metadata: Metadata = {
  title: 'Constructor 3D',
  description: 'Monta una réplica de airsoft en 3D: elige modelo, añade accesorios, cambia colores y exporta la imagen.',
};

// El constructor (three.js) solo se carga en esta ruta; el resto del sitio no lo necesita.
// Con el interruptor apagado (NEXT_PUBLIC_ENABLE_3D distinto de «true») la ruta no existe: responde 404.
export default function MontarPage() {
  if (!ENABLE_3D) notFound();
  return <ClientApp />;
}
