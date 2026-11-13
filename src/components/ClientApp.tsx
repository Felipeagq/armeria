'use client';
import dynamic from 'next/dynamic';

// three.js necesita `window`/WebGL: el constructor se carga solo en el navegador.
const App = dynamic(() => import('./App'), {
  ssr: false,
  loading: () => <div className="boot">Cargando motor 3D…</div>,
});

export default function ClientApp() {
  return <App />;
}
