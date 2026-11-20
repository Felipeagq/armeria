import { indiceBusqueda } from '@/catalogo/busqueda';
import { getCatalogo } from '@/catalogo/datos';

// El índice se genera en el build a partir de la BD (y se regenera al guardar en el panel admin); el buscador lo descarga solo la primera vez que se abre.
export const dynamic = 'force-static';

export async function GET() {
  return Response.json(indiceBusqueda(await getCatalogo()));
}
