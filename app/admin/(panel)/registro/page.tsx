import type { Metadata } from 'next';
import Link from 'next/link';
import { exigirAdmin } from '@/server/auth';
import { ENTIDADES, SEGMENTOS, type TipoReg } from '@/admin/entidades';
import { leerRegistro } from '@/admin/repo';
import { Historial } from '../_ui/Historial';
import { IconChevron } from '@/components/icons';

export const metadata: Metadata = { title: 'Registro de cambios' };
export const dynamic = 'force-dynamic';
type Props = { searchParams: Promise<{ tipo?: string; id?: string; p?: string }> };
const POR_PAGINA = 40;

export default async function RegistroPage({ searchParams }: Props) {
  await exigirAdmin();
  const { tipo, id, p } = await searchParams;
  const tipoOk = SEGMENTOS.map(s => ENTIDADES[s].tipo).find(t => t === tipo) as TipoReg | undefined;
  const pagina = Math.max(1, Math.floor(Number(p) || 1));
  const { filas, total } = await leerRegistro({ tipo: tipoOk, entidadId: id && /^[a-z0-9][a-z0-9-]{0,59}$/.test(id) ? id : undefined, pagina, porPagina: POR_PAGINA });
  const paginas = Math.max(1, Math.ceil(total / POR_PAGINA));
  const enlace = (n: number) => `/admin/registro/?${new URLSearchParams({ ...(tipoOk ? { tipo: tipoOk } : {}), ...(id ? { id } : {}), p: String(n) })}`;

  return (
    <>
      <h1>Registro de cambios <span className="admcuenta">({total})</span></h1>
      <form className="admfiltros" method="get">
        <select name="tipo" defaultValue={tipoOk ?? ''} aria-label="Tipo">
          <option value="">Todo</option>
          {SEGMENTOS.map(s => <option key={s} value={ENTIDADES[s].tipo}>{ENTIDADES[s].plural}</option>)}
        </select>
        <input type="text" name="id" defaultValue={id ?? ''} placeholder="Identificador (opcional)" aria-label="Identificador" />
        <button className="ghost" type="submit">Filtrar</button>
      </form>
      <Historial filas={filas} enlazar />
      {paginas > 1 && (
        <nav className="admpaginas" aria-label="Páginas">
          {pagina > 1 ? <Link className="ghost sm" href={enlace(pagina - 1)}><IconChevron className="ic-prev" />Anteriores</Link> : <span />}
          <span>Página {pagina} de {paginas}</span>
          {pagina < paginas ? <Link className="ghost sm" href={enlace(pagina + 1)}>Siguientes<IconChevron className="ic-next" /></Link> : <span />}
        </nav>
      )}
    </>
  );
}
