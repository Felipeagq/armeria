// Explicación visual del MOA: cuánto blanco tapa el punto de una mira según su tamaño y la distancia.
// Vista del tirador: el punto mide siempre lo mismo (en MOA) y el plato se ve cada vez más pequeño al alejarse.
// Componente de servidor, sin JS: una tabla con un dibujo SVG por celda y el tamaño real en centímetros.

const CM_POR_MOA_A_100M = 2.909; // 1 MOA = 1/60° → 2,909 cm a 100 m
const PLATO_CM = 20;             // plato de referencia (≈ 8")
const DISTANCIAS = [25, 50, 100]; // m
const PUNTOS = [2, 4, 6, 8];      // MOA
const DOT = '#d4201c';
const PLATE = '#d3d6d8';

const cm = (moa: number, m: number) => moa * CM_POR_MOA_A_100M * (m / 100);
const fmt = (n: number) => (n < 10 ? n.toFixed(1) : String(Math.round(n))).replace('.', ',');

// Escala del dibujo: en 25 m el plato mide 80 unidades de 100; 1 MOA = 80 / (PLATO_CM / (2,909 · 0,25)) unidades.
const U_POR_MOA = 80 / (PLATO_CM / (CM_POR_MOA_A_100M * 0.25));

export function MoaPuntos() {
  return (
    <figure className="moa">
      <table>
        <caption>Cuánto tapa el punto sobre un plato de {PLATO_CM} cm, visto desde la mira</caption>
        <thead>
          <tr><td /><th scope="col">25 m</th><th scope="col">50 m</th><th scope="col">100 m</th></tr>
        </thead>
        <tbody>
          {PUNTOS.map(p => (
            <tr key={p}>
              <th scope="row">{p} MOA</th>
              {DISTANCIAS.map(d => {
                const plato = 80 * (25 / d);
                return (
                  <td key={d}>
                    <svg viewBox="0 0 100 100" aria-hidden="true" focusable="false">
                      <circle cx="50" cy="50" r={plato / 2} fill={PLATE} />
                      <circle cx="50" cy="50" r={(p * U_POR_MOA) / 2} fill={DOT} />
                      <circle cx="50" cy="50" r={plato / 2} fill="none" stroke="#14161a" strokeOpacity=".55" strokeWidth=".7" />
                    </svg>
                    <span>{fmt(cm(p, d))} cm</span>
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
      <figcaption>
        1 MOA mide ≈ 2,9 cm a 100 m. El punto no cambia, pero el blanco se ve más pequeño cuanto más lejos está, así que cada vez lo tapa más:
        a 100 m, un punto de 8 MOA (≈ 23 cm) cubre del todo un plato de 20 cm. Por eso los puntos pequeños (2 MOA) son mejores para tirar lejos y los grandes, para disparar deprisa de cerca.
      </figcaption>
    </figure>
  );
}
