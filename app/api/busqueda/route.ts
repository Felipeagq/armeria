import { indiceBusqueda } from '@/three/data/busqueda';

// El catálogo es estático: el índice se genera en el build y el buscador lo descarga solo la primera vez que se abre.
export const dynamic = 'force-static';

export function GET() {
  return Response.json(indiceBusqueda());
}
