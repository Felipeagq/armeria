// Accesorios que se pueden montar en un arma (servidor). Enlaza a la ficha técnica de cada uno.
import Link from 'next/link';
import type { Arma } from '@/three/data/armas';
import { accesoriosPara, accesoriosPorGrupo } from '@/three/data/accesorios-compat';

export function AccesoriosCompat({ arma }: { arma: Arma }) {
  const grupos = accesoriosPorGrupo(accesoriosPara(arma));
  if (!grupos.length) return null;
  return (
    <>
      <h2>Accesorios compatibles</h2>
      <div className="fspecs">
        <dl>
          {grupos.map(([g, list]) => (
            <div className="sr" key={g}>
              <dt>{g}</dt>
              <dd className="wacc">{list.map((a, k) => <span key={a.id}>{k > 0 && ', '}<Link href={`/accesorios/${a.id}/`}>{a.nombre}</Link></span>)}</dd>
            </div>
          ))}
        </dl>
        <p className="src">Los que se pueden montar en el constructor 3D. Cada ficha reúne sus datos técnicos.</p>
      </div>
    </>
  );
}
