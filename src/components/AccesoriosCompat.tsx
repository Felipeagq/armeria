// Accesorios que se pueden montar en un arma (servidor). Enlaza a la ficha técnica de cada uno, con su foto.
import Link from 'next/link';
import type { Arma } from '@/three/data/armas';
import { accesoriosPara, accesoriosPorGrupo } from '@/three/data/accesorios-compat';
import { IconCube } from './icons';

export function AccesoriosCompat({ arma }: { arma: Arma }) {
  const grupos = accesoriosPorGrupo(accesoriosPara(arma));
  if (!grupos.length) return null;
  return (
    <>
      <h2 id="sec-accesorios">Accesorios compatibles</h2>
      {grupos.map(([g, list]) => (
        <section className="wacg" key={g} aria-label={g}>
          <h3>{g}<span>{list.length}</span></h3>
          <ul className="wtiles">
            {list.map(a => (
              <li key={a.id}>
                <Link href={`/accesorios/${a.id}/`}>
                  <span className="wi-thumb">{a.foto ? <img src={`/accesorios/t/${a.foto.file}`} alt="" width={160} height={110} loading="lazy" decoding="async" /> : <IconCube aria-hidden />}</span>
                  <span className="wt-name">{a.nombre}</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ))}
      <p className="src">Los que se pueden montar en el constructor 3D. Cada ficha reúne sus datos técnicos.</p>
    </>
  );
}
