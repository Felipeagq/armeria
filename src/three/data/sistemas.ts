// Glosario de sistemas de funcionamiento, cerrojos y mecanismos de disparo que aparecen en el campo «Sistema / cerrojo»,
// y de términos de las réplicas de airsoft que aparecen en el campo «Réplica airsoft».
// Módulo ligero (sin geometría ni three): lo usan páginas de servidor y componentes de cliente.
// `patron` detecta el término en el texto de una ficha (en español o en inglés, como llega de Wikipedia).

export type GrupoSistema = 'Cómo se recarga' | 'Cómo se cierra' | 'Cómo se dispara' | 'En las réplicas de airsoft';
/** Campo de la ficha donde se busca cada grupo: el glosario de airsoft se lee en «Réplica airsoft»; el resto, en «Sistema / cerrojo». */
export type CampoGlosario = 'sistema' | 'airsoft';
export const campoDe = (g: GrupoSistema): CampoGlosario => (g === 'En las réplicas de airsoft' ? 'airsoft' : 'sistema');
export interface Sistema {
  id: string;
  nombre: string;
  grupo: GrupoSistema;
  /** Una frase: se muestra junto al dato en las fichas. */
  corto: string;
  /** Algo más de detalle: página del glosario. */
  detalle: string;
  patron: RegExp;
  /** Solo en el glosario de airsoft: sigla y nombre corto para las tarjetas de la ficha (p. ej. «AEG» · «Réplica eléctrica»). */
  sigla?: string;
  apodo?: string;
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
  { id: 'bloque-oscilante', nombre: 'Bloque de cierre oscilante', grupo: 'Cómo se cierra',
    corto: 'Una pieza bajo el cañón sube para bloquear la corredera y baja para soltarla; el cañón retrocede recto, sin inclinarse.',
    detalle: 'Es el cierre de la Beretta 92/M9 (heredado de la Walther P38). Como el cañón no bascula, vuelve siempre al mismo eje, lo que favorece la precisión; es el motivo de la corredera abierta tan característica de la Beretta.',
    patron: /bloque (de cierre )?oscilante|falling (locking )?block|locking block/i },
  { id: 'martillo-dasa', nombre: 'Martillo externo · doble/simple acción', grupo: 'Cómo se dispara',
    corto: 'Un martillo visible golpea el percutor. En doble acción el gatillo monta y suelta el martillo (recorrido largo y pesado); en simple acción solo lo suelta (corto y ligero).',
    detalle: 'En una DA/SA como la Beretta 92/M9, el primer disparo puede hacerse en doble acción con el martillo abatido y los siguientes salen en simple acción: hay que dominar dos tactos de gatillo. Las 1911/2011 (como la TTI Pit Viper) son de simple acción pura: se llevan con el martillo montado y el seguro puesto, y su gatillo es el más corto y ligero.',
    patron: /doble\/?simple acci[oó]n|doble acci[oó]n|simple acci[oó]n|martillo externo|DA\/SA|double[- ]action|single[- ]action/i },
  { id: 'percutor-lanzado', nombre: 'Percutor lanzado (striker)', grupo: 'Cómo se dispara',
    corto: 'En vez de un martillo, un percutor con muelle golpea directamente el fulminante; el gatillo termina de tensarlo.',
    detalle: 'Es el sistema de la Glock. Tiene menos piezas y un tacto de gatillo uniforme. El seguro «Safe Action» agrupa tres seguros automáticos (del gatillo, del percutor y de caída) que solo se liberan al apretar el gatillo.',
    patron: /percutor lanzado|striker/i },
  { id: 'aeg', nombre: 'AEG (réplica eléctrica)', grupo: 'En las réplicas de airsoft',
    corto: 'Un motor y una batería mueven unos engranajes que comprimen un muelle y lanzan cada bola; la corredera o el cerrojo no retroceden.',
    detalle: 'AEG significa «automatic electric gun». Dentro del arma, un motor alimentado por batería hace girar los engranajes de la caja mecánica (gearbox), que tiran de un pistón contra un muelle y lo sueltan: el aire comprimido empuja la bola por el cañón. Es la réplica más extendida: rinde igual con frío o con calor y admite muchas piezas de mejora. A cambio, normalmente no hay retroceso real. «V2», «V3»… son versiones del gearbox y determinan qué piezas de repuesto encajan.',
    patron: /\bAEG\b/, sigla: 'AEG', apodo: 'Réplica eléctrica' },
  { id: 'aep', nombre: 'AEP (pistola eléctrica)', grupo: 'En las réplicas de airsoft',
    corto: 'Una pistola eléctrica: el mismo principio que un AEG, en formato pistola y con una batería pequeña.',
    detalle: 'AEP significa «automatic electric pistol». Un motor pequeño mueve el gearbox, como en un AEG, y algunas dispararán también en ráfaga. Es más barata, ligera y fácil de mantener que una de gas (GBB), y funciona igual con frío; a cambio, el tacto y el sonido son menos realistas porque la corredera no retrocede.',
    patron: /\bAEP\b/, sigla: 'AEP', apodo: 'Pistola eléctrica' },
  { id: 'blowback-gas', nombre: 'Blowback de gas (GBB)', grupo: 'En las réplicas de airsoft',
    corto: 'La corredera de la réplica (o el cerrojo, en un fusil) retrocede en cada disparo, empujada por parte del gas que lanza la bola: arma el martillo y carga la siguiente bola, como en el arma real.',
    detalle: 'GBB significa «gas blowback». El cargador guarda las bolas y el gas (green gas o CO₂). Al apretar el gatillo se libera una pequeña descarga: una parte empuja la bola por el cañón y otra empuja la corredera (o el cerrojo) hacia atrás, que arma el martillo y, al volver por el muelle, carga la siguiente bola. Da un retroceso y un ruido parecidos a los de una pistola real, y la corredera queda abierta al vaciar el cargador. A cambio rinde peor con frío (el gas pierde presión), hay que recargar el gas y es más cara y delicada que una réplica de corredera fija (NBB) o eléctrica (AEP). Ojo: es un término de la réplica. Las armas reales del catálogo no son blowback (las pistolas de 9×19 mm son de cierre bloqueado y retroceso corto, y los fusiles funcionan por gases); el blowback real (cerrojo sin cierre, retenido solo por su masa y el muelle) es propio de cartuchos de poca presión y de muchos subfusiles.',
    patron: /\bGBB\b|blow-?back/i, sigla: 'GBB', apodo: 'Blowback de gas' },
];

export const GRUPOS_SISTEMA: GrupoSistema[] = ['Cómo se recarga', 'Cómo se cierra', 'Cómo se dispara', 'En las réplicas de airsoft'];

/** Términos del glosario presentes en el texto de un campo de la ficha («Sistema / cerrojo» por defecto, o «Réplica airsoft»), en orden del glosario. */
export const sistemasDe = (texto?: string, campo: CampoGlosario = 'sistema'): Sistema[] =>
  (texto ? SISTEMAS.filter(s => campoDe(s.grupo) === campo && s.patron.test(texto)) : []);
