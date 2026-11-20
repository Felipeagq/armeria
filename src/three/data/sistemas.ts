// Glosario de sistemas de funcionamiento, cerrojos y mecanismos de disparo que aparecen en el campo «Sistema / cerrojo»,
// de términos de las réplicas de airsoft que aparecen en el campo «Réplica airsoft» y de términos de miras y accesorios (MOA, Picatinny, STANAG…) que aparecen en sus fichas.
// Módulo ligero (sin geometría ni three): lo usan páginas de servidor y componentes de cliente.
// `patron` detecta el término en el texto de una ficha (en español o en inglés, como llega de Wikipedia).

export type GrupoSistema = 'Cómo se recarga' | 'Cómo se cierra' | 'Cómo se dispara' | 'En las réplicas de airsoft' | 'En miras y accesorios';
/** Dónde se busca cada grupo: el glosario de airsoft se lee en «Réplica airsoft»; el de miras y accesorios, en el texto de la ficha del accesorio; el resto, en «Sistema / cerrojo». */
export type CampoGlosario = 'sistema' | 'airsoft' | 'accesorio';
export const campoDe = (g: GrupoSistema): CampoGlosario => (g === 'En las réplicas de airsoft' ? 'airsoft' : g === 'En miras y accesorios' ? 'accesorio' : 'sistema');
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
  { id: 'moa', nombre: 'MOA (minuto de arco)', grupo: 'En miras y accesorios',
    corto: 'Unidad angular con la que se miden retículas y ajustes de una mira: 1 MOA abarca ≈ 2,9 cm a 100 m.',
    detalle: 'Un minuto de arco es 1/60 de grado, así que lo que abarca crece con la distancia: ≈ 2,9 cm a 100 m y ≈ 5,8 cm a 200 m. Un punto de 2 MOA tapa unos 6 cm a 100 m, y un ajuste de 0,5 MOA por clic mueve el impacto ≈ 1,5 cm cada clic a esa distancia. Algunas retículas añaden un anillo, que también se mide en MOA: ≈ 32 MOA en muchos reflex y 65 MOA en el Olight Osight R (a 25 m mide ≈ 47 cm). Muchas miras europeas usan en su lugar el miliradián (MRAD): 1 MRAD son 10 cm a 100 m, unos 3,4 MOA.',
    patron: /\bMOA\b/ },
  { id: 'picatinny', nombre: 'Riel Picatinny (MIL-STD-1913)', grupo: 'En miras y accesorios',
    corto: 'Carril con ranuras transversales regulares sobre el que se fijan miras, linternas y empuñaduras con una abrazadera.',
    detalle: 'Lo define la norma militar MIL-STD-1913, nacida en el Arsenal de Picatinny (EE. UU.). Las ranuras se repiten cada ≈ 10 mm y el carril mide ≈ 21 mm de ancho, así que cualquier accesorio de ese estándar se monta en cualquier riel. Es parecido al riel Weaver, pero con ranuras más anchas y uniformes: un accesorio Weaver suele entrar en un Picatinny, y no al revés. En airsoft casi todas las réplicas copian este riel.',
    patron: /Picatinny|MIL-STD-1913/i },
  { id: 'm-lok', nombre: 'M-LOK', grupo: 'En miras y accesorios',
    corto: 'Sistema de montaje de ranuras en el guardamanos: el accesorio se atornilla directamente, sin riel completo.',
    detalle: 'Lo diseñó Magpul (2014). Cada ranura admite un accesorio con tuercas en T que se giran para quedar fijas. Un guardamanos M-LOK pesa menos que uno todo de riel y se agarra mejor, pero solo sirve con piezas M-LOK o con un adaptador a Picatinny. KeyMod es un sistema parecido, hoy menos usado.',
    patron: /M-?LOK/i },
  { id: 'stanag', nombre: 'STANAG (cargador OTAN)', grupo: 'En miras y accesorios',
    corto: 'Estándar OTAN del cargador del M16 y el AR-15: un cargador STANAG entra en cualquier arma que lo adopte.',
    detalle: 'La norma STANAG 4179 fija las dimensiones del cargador (boca, muescas y retén) para que sean intercambiables entre armas de la OTAN. Es el cargador de 30 cartuchos de 5,56×45 mm del M4, y también lo aceptan armas que no son estadounidenses, como el HK416 y el SCAR-L.',
    patron: /STANAG/ },
  { id: 'rosca-boca', nombre: 'Rosca de boca (1/2×28 UNEF)', grupo: 'En miras y accesorios',
    corto: 'La rosca del extremo del cañón donde se atornilla el apagallamas, el freno o el supresor.',
    detalle: 'En el AR-15 de 5,56 mm es 1/2×28 UNEF (media pulgada de diámetro y 28 hilos por pulgada); en el AK-74 es de 24×1,5 mm a izquierdas. Cada calibre y arma tiene la suya, así que un accesorio de boca solo sirve si coincide con la rosca. En las réplicas de airsoft la rosca es de 14 mm a izquierdas (CCW) y no encaja con la del arma real.',
    patron: /UNEF|\brosca\b|1\/2×28/i },
  { id: 'reticula', nombre: 'Retícula (reticle)', grupo: 'En miras y accesorios',
    corto: 'El dibujo que ves en la mira para apuntar: un punto, un anillo, una cruz.',
    detalle: 'En un red dot es un punto, a veces con un anillo alrededor (≈ 32 MOA) para encuadrar deprisa de cerca. En una mira con aumentos puede ser una cruz con marcas para estimar la distancia o compensar la caída de la bala. Se mide en MOA o en miliradianes. En inglés, «reticle».',
    patron: /ret[ií]cula|reticle/i },
  { id: 'paralaje', nombre: 'Paralaje', grupo: 'En miras y accesorios',
    corto: 'Lo que parece moverse el punto sobre el blanco cuando cambia la posición de tu ojo detrás de la mira.',
    detalle: 'En un red dot bien colimado se nota muy poco: el punto casi no se mueve aunque el ojo no esté centrado. En las miras con aumentos, el paralaje depende de la distancia y algunas llevan un ajuste para corregirlo. Con paralaje alto, si apoyas la cabeza cada vez en un sitio distinto, cambia el punto de impacto.',
    patron: /paralaje|parallax/i },
  { id: 'colimada', nombre: 'Luz colimada', grupo: 'En miras y accesorios',
    corto: 'Rayos de luz paralelos: el punto parece estar lejos, a la distancia del blanco, y no pegado al cristal.',
    detalle: 'Un red dot usa un LED y una lente (o un espejo curvo) para que los rayos salgan paralelos. El ojo enfoca el punto y el blanco a la vez, y por eso lo ves «sobre» el objetivo con los dos ojos abiertos. Sin colimar, el punto parecería pegado al cristal y cambiaría de sitio al mover la cabeza.',
    patron: /colimad|collimat/i },
  { id: 'aumento', nombre: 'Aumentos (1×, 4×…)', grupo: 'En miras y accesorios',
    corto: 'Cuántas veces parece más cerca el blanco. 1× es verlo igual que a simple vista; 4×, cuatro veces más cerca.',
    detalle: 'Más aumentos dan más detalle a larga distancia, pero reducen el campo de visión y exigen mantener la mira más firme. Un 1× (red dot, holográfico) sirve para apuntar rápido con los dos ojos abiertos; una mira 1–4× o 1–6× deja elegir entre ambas cosas.',
    patron: /aumentos?\b|\b1×|\b1[–-][46]×/i },
  { id: 'infrarrojo', nombre: 'Infrarrojo (IR) y visión nocturna', grupo: 'En miras y accesorios',
    corto: 'Luz que el ojo no ve pero sí las gafas de visión nocturna (NVG): un láser IR solo se ve con ellas.',
    detalle: 'Un láser o una linterna IR marca el blanco sin que se vea a simple vista, así que sirve para apuntar con gafas de visión nocturna. Las miras con modo NV bajan el brillo del punto para no deslumbrar. Los módulos militares como el AN/PEQ-15 suelen reunir un láser IR, otro visible y un iluminador.',
    patron: /\bIR\b|infrarroj|visi[oó]n nocturna|\bNVG\b/ },
  { id: 'lumenes', nombre: 'Lúmenes', grupo: 'En miras y accesorios',
    corto: 'Cantidad total de luz que emite una linterna: más lúmenes, más brillo.',
    detalle: 'Una linterna de arma suele dar de ≈ 200 a 1.500 lúmenes. Pero lo que decide hasta dónde alumbra es la candela, la intensidad en el centro del haz. Con más lúmenes también se deslumbra más y se gasta antes la batería, por eso muchas tienen un modo de baja intensidad.',
    patron: /l[uú]menes|\blumen\b/i },
  { id: 'qd', nombre: 'Acoplamiento rápido (QD)', grupo: 'En miras y accesorios',
    corto: 'Sistema para montar o quitar un accesorio (supresor, mira, eslinga) en un momento, sin herramientas.',
    detalle: 'QD son las siglas de «quick detach». En un supresor, un anillo o un cuarto de vuelta lo fija sobre el apagallamas; en una mira o una linterna, una palanca sustituye al tornillo; en la correa, un conector se suelta pulsando un botón. A cambio, tras quitarlo y volverlo a poner conviene comprobar el cero, porque puede no quedar exactamente igual.',
    patron: /acoplamiento r[aá]pido|\bQD\b|quick[- ]detach/i },
];

export const GRUPOS_SISTEMA: GrupoSistema[] = ['Cómo se recarga', 'Cómo se cierra', 'Cómo se dispara', 'En las réplicas de airsoft', 'En miras y accesorios'];

/** Términos del glosario presentes en el texto de un campo de la ficha («Sistema / cerrojo» por defecto, «Réplica airsoft» o el texto de un accesorio), en orden del glosario. */
export const sistemasDe = (texto?: string, campo: CampoGlosario = 'sistema'): Sistema[] =>
  (texto ? SISTEMAS.filter(s => campoDe(s.grupo) === campo && s.patron.test(texto)) : []);
