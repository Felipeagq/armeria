import Link from 'next/link';
import { exigirAdmin } from '@/server/auth';
import { ENTIDADES, SEGMENTOS } from '@/admin/entidades';
import { leerRegistro, resumenPanel } from '@/admin/repo';
import { Historial } from './_ui/Historial';

export const dynamic = 'force-dynamic';

export default async function AdminInicio() {
  const { usuario } = await exigirAdmin();
  const [r, { filas }] = await Promise.all([resumenPanel(), leerRegistro({ porPagina: 8 })]);
  const pendientes = r.accesoriosSinArmas.length > 0 || r.armasSinRevisar > 0;
  return (
    <>
      <h1>Panel</h1>
      <p className="muted">Sesión iniciada como <b>{usuario}</b>. Lo que guardes se publica en el sitio al instante.</p>

      <ul className="admtarjetas">
        {SEGMENTOS.map(s => (
          <li key={s}>
            <Link href={`/admin/${s}/`}>
              <b>{r[s].activos}</b>
              <span>{ENTIDADES[s].plural}</span>
              {r[s].archivados > 0 && <small>{r[s].archivados} archivados</small>}
            </Link>
          </li>
        ))}
      </ul>

      {pendientes && (
        <section className="admpend">
          <h2>Por completar</h2>
          <ul>
            {r.armasSinRevisar > 0 && <li><Link href="/admin/armas/">{r.armasSinRevisar} arma{r.armasSinRevisar === 1 ? '' : 's'} sin revisar</Link> (traídas de Wikipedia o de la IA; no se muestran hasta revisarlas).</li>}
            {r.accesoriosSinArmas.length > 0 && (
              <li>
                {r.accesoriosSinArmas.length} accesorio{r.accesoriosSinArmas.length === 1 ? '' : 's'} sin armas asociadas:{' '}
                {r.accesoriosSinArmas.map((a, i) => <span key={a.id}>{i > 0 && ', '}<Link href={`/admin/accesorios/${a.id}/`}>{a.nombre}</Link></span>)}.
              </li>
            )}
          </ul>
        </section>
      )}

      <section className="admhistorial">
        <h2>Últimos cambios</h2>
        <Historial filas={filas} enlazar />
        <p className="admayuda"><Link href="/admin/registro/">Ver todo el registro</Link></p>
      </section>
    </>
  );
}
