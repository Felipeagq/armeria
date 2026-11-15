// Glosario de sistemas de funcionamiento, cerrojos y mecanismos de disparo que aparecen en el campo «Sistema / cerrojo».
// Módulo ligero (sin geometría ni three): lo usan páginas de servidor y componentes de cliente.
// `patron` detecta el término en el texto de una ficha (en español o en inglés, como llega de Wikipedia).

export type GrupoSistema = 'Cómo se recarga' | 'Cómo se cierra' | 'Cómo se dispara';
export interface Sistema {
  id: string;
  nombre: string;
  grupo: GrupoSistema;
  /** Una frase: se muestra junto al dato en las fichas. */
  corto: string;
  /** Algo más de detalle: página del glosario. */
  detalle: string;
  patron: RegExp;
}

export const SISTEMAS: Sistema[] = [
  { id: 'impulsion-directa', nombre: 'Impulsión directa de gases', grupo: 'Cómo se recarga',
    corto: 'Los gases del disparo viajan por un tubito hasta el portacerrojo y lo empujan directamente, sin pistón.',
    detalle: 'Es el sistema del AR-15 y del M4. Tiene pocas piezas móviles, es ligero y preciso. A cambio, los gases calientes y sucios entran en el interior del arma, que se ensucia y se calienta más y pide más limpieza.',
    patron: /impulsi[oó]n directa|direct impingement/i },
  { id: 'piston-corto', nombre: 'Pistón de carrera corta', grupo: 'Cómo se recarga',
    corto: 'Un pistón recibe los gases, golpea una varilla que empuja el portacerrojo y se detiene; el resto del recorrido lo hace la inercia.',
    detalle: 'Lo usan, por ejemplo, el HK416 y el SCAR. Mantiene los gases fuera del mecanismo, así que el arma funciona más limpia y más fría y se desgasta menos. A cambio añade piezas y peso en la parte delantera.',
    patron: /pist[oó]n[^·]*?\bcort[oa]|carrera corta|short[- ]stroke/i },
  { id: 'piston-largo', nombre: 'Pistón de carrera larga', grupo: 'Cómo se recarga',
    corto: 'El pistón va unido al portacerrojo y se mueve con él durante todo el recorrido.',
    detalle: 'Es el sistema de la familia Kalashnikov. Es muy robusto y tolera bien la suciedad. La masa que se mueve en cada disparo es mayor, lo que añade algo de retroceso y vibración.',
    patron: /pist[oó]n[^·]*?\blarg[oa]|carrera larga|long[- ]stroke/i },
  { id: 'regulador-gas', nombre: 'Regulador de gas', grupo: 'Cómo se recarga',
    corto: 'Permite ajustar cuánto gas llega al pistón.',
    detalle: 'Con más gas el arma funciona aunque esté sucia o lleve supresor; con menos, el cierre golpea más suave y el retroceso baja. Aparece en los sistemas de pistón.',
    patron: /regulable|regulador|adjustable gas/i },
  { id: 'retroceso-corto', nombre: 'Retroceso corto', grupo: 'Cómo se recarga',
    corto: 'La fuerza del disparo empuja hacia atrás la corredera y el cañón unidos un tramo corto; después se separan y la corredera recarga.',
    detalle: 'Es el sistema de casi todas las pistolas semiautomáticas modernas. Mientras la bala sale, el cañón y la corredera permanecen bloqueados (recámara bloqueada); al retroceder un poco se desbloquean, el cañón se detiene y la corredera sigue hasta expulsar el casquillo y cargar el siguiente cartucho.',
    patron: /retroceso|recoil|recámara bloqueada|locked breech/i },
  { id: 'cerrojo-rotativo', nombre: 'Cerrojo rotativo', grupo: 'Cómo se cierra',
    corto: 'El cerrojo gira unos grados para encajar sus tetones en el cañón y queda bloqueado mientras dura el disparo.',
    detalle: 'Es el cierre de los fusiles de asalto modernos. Varios tetones reparten la presión del cartucho: el AR-15 usa siete y el AK, dos. «Multitetón» indica que lleva varios.',
    patron: /cerrojo rotativ|rotating bolt|multiteto|multitetón/i },
  { id: 'canon-basculante', nombre: 'Cañón basculante', grupo: 'Cómo se cierra',
    corto: 'Al retroceder, el cañón se inclina y se suelta de la corredera para poder abrir la recámara.',
    detalle: 'Es el cierre de tipo Browning, usado por ejemplo en la Glock y la CZ 75. Es compacto y fiable en pistolas; al ir el cañón unido a la corredera por una leva, se desbloquea siempre en el mismo punto del recorrido.',
    patron: /basculante|tilting[- ]barrel/i },
  { id: 'percutor-lanzado', nombre: 'Percutor lanzado (striker)', grupo: 'Cómo se dispara',
    corto: 'En vez de un martillo, un percutor con muelle golpea directamente el fulminante; el gatillo termina de tensarlo.',
    detalle: 'Es el sistema de la Glock. Tiene menos piezas y un tacto de gatillo uniforme. El seguro «Safe Action» agrupa tres seguros automáticos (del gatillo, del percutor y de caída) que solo se liberan al apretar el gatillo.',
    patron: /percutor lanzado|striker/i },
];

export const GRUPOS_SISTEMA: GrupoSistema[] = ['Cómo se recarga', 'Cómo se cierra', 'Cómo se dispara'];

/** Términos del glosario presentes en el texto de «Sistema / cerrojo» de una ficha, en orden del glosario. */
export const sistemasDe = (texto?: string): Sistema[] => (texto ? SISTEMAS.filter(s => s.patron.test(texto)) : []);
