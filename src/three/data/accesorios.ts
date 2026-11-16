// Enciclopedia de accesorios: miras, bocachas, luces, empuñaduras, cargadores y culatas.
// Cada ficha describe un TIPO de accesorio (no una pieza 3D): una ficha puede cubrir varias piezas del constructor (`partes`).
// Valores típicos de mercado; varían según fabricante y modelo. «≈» = aproximado. 1 MOA (minuto de arco) abarca ≈ 2,9 cm a 100 m.
// Módulo ligero (sin three ni `window`): lo usan páginas de servidor y el constructor. La compatibilidad con armas está en accesorios-compat.ts.

import { FOTOS } from './accesorios-fotos';

export type GrupoAcc = 'Ópticas' | 'Bocachas' | 'Luces y láseres' | 'Empuñaduras y apoyos' | 'Cargadores' | 'Culatas';
export const GRUPOS_ACC: GrupoAcc[] = ['Ópticas', 'Bocachas', 'Luces y láseres', 'Empuñaduras y apoyos', 'Cargadores', 'Culatas'];
/** Ancla de cada grupo en /accesorios/ (p. ej. «Luces y láseres» → luces-y-laseres). */
export const slugGrupo = (g: GrupoAcc) => g.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-');

export interface AccFoto {
  file: string;
  alt: string;
  /** Sin autor/licencia/fuente: imagen de producto de uso personal, sin enlace de atribución. */
  author?: string;
  license?: string;
  licenseUrl?: string;
  source?: string;
}

export interface Accesorio {
  id: string;
  nombre: string;
  grupo: GrupoAcc;
  /** Una frase: índice y entradilla. */
  resumen: string;
  /** Tres cifras que se destacan arriba. */
  clave: [label: string, value: string][];
  /** Ficha técnica. */
  datos: [label: string, value: string][];
  /** Cómo funciona / para qué sirve. */
  como: string[];
  /** Tipos o modelos concretos dentro de esta ficha. */
  variantes?: [name: string, text: string][];
  pros: string[];
  contras: string[];
  ejemplos?: string;
  /** Qué cambia en las réplicas de airsoft. */
  airsoft: string;
  /** Ids de las piezas del constructor 3D que representa esta ficha. */
  partes: string[];
  fuente: string;
  foto?: AccFoto;
}

const FICHAS: Accesorio[] = [
  /* ═════════════ Ópticas ═════════════ */
  { id: 'red-dot-abierto', nombre: 'Red dot abierto', grupo: 'Ópticas', partes: ['opt_rds'],
    resumen: 'Mira sin aumento que proyecta un punto luminoso sobre un cristal abierto: ligera, compacta y rápida con los dos ojos abiertos.',
    clave: [['Aumento', '1×'], ['Punto', '2–6 MOA'], ['Peso', '≈ 30–70 g']],
    datos: [
      ['Aumento', '1× (sin aumento)'],
      ['Retícula', 'Punto de 2 a 6 MOA; algunos añaden un anillo de unos 32 MOA'],
      ['Ventana', 'Cristal abierto de ≈ 20–30 mm, sin tubo'],
      ['Alimentación', 'Pila de botón CR2032 o CR1632; algunos modelos añaden panel solar'],
      ['Autonomía', 'De unas 5.000 h a más de 50.000 h, según modelo e intensidad'],
      ['Peso', '≈ 30–70 g'],
      ['Montaje', 'Riel Picatinny (MIL-STD-1913) con base propia; en pistolas, corte en la corredera'],
      ['Ajuste', 'Torretas de elevación y deriva, normalmente de 0,5 a 1 MOA por clic'],
    ],
    como: [
      'Un LED proyecta la retícula sobre una lente con un recubrimiento que refleja ese color. La luz sale colimada, así que ves el punto «sobre» el blanco, a la distancia a la que miras, y no sobre el cristal. Al no tener aumento conservas la visión periférica y puedes apuntar con los dos ojos abiertos.',
      'Es la mira de combate habitual para distancias cortas y medias (hasta ≈ 100–200 m con un punto de 2 MOA). Una MOA abarca ≈ 2,9 cm a 100 m, de modo que un punto de 2 MOA tapa unos 6 cm a esa distancia.',
    ],
    pros: ['Ligera, compacta y de perfil bajo', 'Adquisición de blanco muy rápida con los dos ojos abiertos', 'Paralaje muy reducido: el punto apenas se mueve si cambia la posición del ojo'],
    contras: ['Sin aumento: no sirve para distancias largas', 'Lente y emisor quedan al aire; la lluvia, el barro o la suciedad pueden taparlos', 'Con astigmatismo, el punto puede verse deformado'],
    ejemplos: 'Holosun 507C y 510C, Trijicon RMR, Leupold DeltaPoint Pro, Vortex Crossfire.',
    airsoft: 'Es la óptica más usada: a las distancias de juego (≈ 20–60 m) no hace falta aumento y su poco peso no desequilibra la réplica. Abundan las copias de los modelos reales; las baratas suelen perder el cero con los golpes.',
    fuente: 'Wikipedia (Reflector sight, Red dot sight)' },

  { id: 'red-dot-tubular', nombre: 'Red dot tubular', grupo: 'Ópticas', partes: ['opt_tube'],
    resumen: 'Mira sin aumento con el emisor y las lentes dentro de un tubo sellado: más robusta y con la óptica protegida, a cambio de más peso.',
    clave: [['Aumento', '1×'], ['Punto', '2 MOA'], ['Peso', '≈ 100–340 g']],
    datos: [
      ['Aumento', '1× (sin aumento)'],
      ['Retícula', 'Punto de 2 MOA en los modelos militares; hay de 4 MOA'],
      ['Cuerpo', 'Tubo cerrado de aluminio con lentes selladas; tapas abatibles opcionales'],
      ['Alimentación', 'Una pila AA (Aimpoint CompM4) o de botón CR2032 (Aimpoint Micro)'],
      ['Autonomía', 'Años de uso continuo con una sola pila (el fabricante del CompM4 declara ≈ 8 años)'],
      ['Intensidad', 'Varios niveles; algunos pensados para usarla con visión nocturna'],
      ['Peso', '≈ 100–340 g (el CompM4 pesa 265 g sin base y 335 g con ella)'],
      ['Montaje', 'Riel Picatinny, con base de palanca o de tornillo'],
    ],
    como: [
      'Funciona igual que un reflex abierto, pero el emisor y las lentes van dentro de un tubo sellado. La carcasa lo hace más rígido y protege la óptica de la lluvia, el polvo y los golpes; por eso es la opción de muchas fuerzas armadas. El Aimpoint CompM4 es el M68 CCO (Close Combat Optic) del Ejército de EE. UU.',
      'A cambio es más grande y pesada. Muchos modelos tienen varios niveles de intensidad, incluidos algunos que permiten usarla con gafas de visión nocturna.',
    ],
    pros: ['Muy robusta y resistente al agua y al polvo', 'Autonomía de años con una sola pila', 'La lente queda protegida dentro del tubo'],
    contras: ['Más pesada y voluminosa que un reflex abierto', 'Campo de visión más estrecho que el de una ventana abierta', 'Es más cara'],
    ejemplos: 'Aimpoint CompM4 (M68 CCO), Aimpoint Micro T-2, Aimpoint PRO.',
    airsoft: 'Casi todas las réplicas copian a Aimpoint. Suelen pesar 100–200 g y resisten mejor que los reflex baratos; algunas llevan la tapa abatible de plástico como el original. Conviene que el brillo tenga varios pasos.',
    fuente: 'Wikipedia (Aimpoint CompM4, Red dot sight)' },

  { id: 'holografico', nombre: 'Visor holográfico', grupo: 'Ópticas', partes: ['opt_holo'],
    resumen: 'Mira sin aumento de ventana ancha cuya retícula, un anillo con un punto central, es un holograma iluminado por un diodo láser.',
    clave: [['Aumento', '1×'], ['Retícula', 'Anillo + punto de 1 MOA'], ['Peso', '≈ 300–350 g']],
    datos: [
      ['Aumento', '1× (sin aumento)'],
      ['Retícula', 'Anillo de ≈ 65–68 MOA con punto central de 1 MOA; hay variantes solo con punto'],
      ['Emisor', 'Diodo láser que ilumina un holograma grabado en el cristal'],
      ['Ventana', 'Rectangular y ancha, de unos 30 mm'],
      ['Alimentación', 'Pilas AA o CR123, según la serie'],
      ['Autonomía', 'Hasta ≈ 1.000 h'],
      ['Peso', '≈ 300–350 g'],
      ['Montaje', 'Riel Picatinny; el cuerpo es largo y la base va integrada'],
    ],
    como: [
      'En lugar de un LED, un diodo láser ilumina un holograma de la retícula grabado en el cristal, y es esa imagen la que ves. El anillo grande ayuda a apuntar rápido a corta distancia, y el punto de 1 MOA permite afinar. La retícula suele seguir visible aunque una parte del cristal esté sucia o dañada.',
      'El paralaje se anula a la distancia para la que está calculado el holograma (≈ 90 m). Como el láser consume más que un LED, la autonomía es menor que la de un red dot.',
    ],
    pros: ['Anillo y punto: muy rápida a corta distancia', 'Ventana ancha y gran campo de visión', 'La retícula suele verse aunque el cristal esté parcialmente dañado'],
    contras: ['Más grande y pesada que un red dot', 'Menor autonomía (el láser gasta más que un LED)', 'Algunos modelos antiguos mostraron deriva del punto de impacto con temperaturas extremas'],
    ejemplos: 'EOTech 512, 551 y 552, EOTech EXPS3, Vortex Razor AMG UH-1.',
    airsoft: 'Las «holo» de airsoft copian la forma del EOTech, pero no son holográficas: son un reflex con una retícula de anillo y punto. Pesan menos que el original y su punto se ajusta como el de cualquier red dot.',
    fuente: 'Wikipedia (EOTech, Holographic weapon sight)' },

  { id: 'lpvo', nombre: 'Mira telescópica 1–4×', grupo: 'Ópticas', partes: ['opt_scope'],
    resumen: 'Visor de aumento variable que parte de 1× (como un red dot) y llega a 4×: la mira más versátil, a cambio de peso y tamaño.',
    clave: [['Aumento', '1–4×'], ['Tubo', '30 mm'], ['Peso', '≈ 500–700 g']],
    datos: [
      ['Aumento', 'Variable, de 1× a 4× (los hay de 1–6×, 1–8× y 1–10×)'],
      ['Objetivo', '≈ 24 mm (1–4×24)'],
      ['Tubo', '30 mm (también de 34 mm)'],
      ['Retícula', 'Iluminada, a menudo con marcas de caída del proyectil para 5,56 mm'],
      ['Relieve ocular', '≈ 9–10 cm: distancia a la que debe quedar el ojo del ocular'],
      ['Peso', '≈ 500–700 g'],
      ['Montaje', 'Dos anillos o un soporte monobloque (cantilever) sobre el riel'],
      ['Ajuste', 'Torretas de elevación y deriva, de 0,25 a 0,5 MOA por clic'],
    ],
    como: [
      '«LPVO» significa low power variable optic: un visor de aumento variable que arranca en 1× (sin aumento) y sube hasta 4–8×. A 1× se usa como un red dot, con los dos ojos abiertos; al subir el aumento, identificas y aciertas blancos más lejanos.',
      'Es la solución más versátil para un fusil de combate, pero ocupa más sitio: tubo largo, dos anillos y un ocular que obliga a colocar bien la cabeza para ver la imagen completa.',
    ],
    pros: ['Versátil: cerca como un red dot, lejos con aumento', 'Retícula con marcas de distancia', 'Permite identificar blancos a distancia'],
    contras: ['Pesada y larga', 'A 1× el campo de visión es menor que el de un red dot', 'Hay que respetar el relieve ocular para ver la imagen completa', 'Es más cara'],
    ejemplos: 'Trijicon AccuPoint 1–4×24, Vortex Strike Eagle 1–6×24, Elcan SpecterDR 1×/4×.',
    airsoft: 'Las hay de 1–4× y de 3–9×. A las distancias de juego (hasta ≈ 60 m) el aumento sirve poco, pero es útil en réplicas de tirador designado (DMR) y de francotirador. Cuidado con el peso: puede pasar de 500 g.',
    fuente: 'Wikipedia (Telescopic sight)' },

  /* ═════════════ Bocachas ═════════════ */
  { id: 'apagallamas', nombre: 'Apagallamas', grupo: 'Bocachas', partes: ['mz_flash', 'mz_a2', 'mz_prong', 'mz_hk', 'mz_ak12'],
    resumen: 'Dispositivo de boca que dispersa y enfría los gases del disparo para que la llamarada se vea menos, sobre todo de noche.',
    clave: [['Rosca (AR-15)', '1/2×28 UNEF'], ['Peso', '≈ 50–100 g'], ['Función', 'Reduce el destello']],
    datos: [
      ['Función', 'Dispersa los gases del disparo para reducir el destello'],
      ['Rosca', '1/2×28 UNEF (AR-15, 5,56 mm) · 24×1,5 mm a izquierdas (AK-74)'],
      ['Peso', '≈ 50–100 g'],
      ['Material', 'Acero con tratamiento superficial (fosfatado o nitrurado)'],
      ['Retroceso', 'Casi no lo modifica; la jaula A2 reduce algo la subida del cañón'],
      ['Supresor', 'Muchos modelos sirven de base para un supresor de acoplamiento rápido'],
    ],
    como: [
      'La llamarada nace cuando los gases calientes y aún combustibles salen de la boca del cañón y se mezclan con el aire. El apagallamas los dispersa y los enfría con ranuras o púas, de modo que arden menos y se ve menos fogonazo. Protege la visión nocturna del tirador y delata menos su posición.',
      'No es un freno de boca: no está pensado para reducir el retroceso, aunque algunos diseños lo consiguen en parte.',
    ],
    variantes: [
      ['Tres puntas', 'Es el de los primeros M16: tres púas que rompían el destello, pero se partían y se enganchaban en la vegetación.'],
      ['Jaula (A1 y A2)', 'El M16A1 cerró el extremo y creó la «jaula». El M16A2 cerró también la ranura inferior para no levantar polvo al disparar tumbado y reducir la subida del cañón.'],
      ['Estilo HK', 'Cuatro ranuras longitudinales alrededor del cuerpo, al estilo de los apagallamas de H&K.'],
      ['Ranurado AK-12', 'Ranuras largas en todo el contorno; el AK-12 admite un supresor de acoplamiento rápido sobre él.'],
    ],
    pros: ['Casi no añade peso ni longitud', 'Menos destello y mejor visión nocturna del tirador', 'Es la base de muchos supresores y adaptadores'],
    contras: ['No reduce el retroceso de forma apreciable', 'No oculta el estruendo ni el humo', 'Algunas formas se enganchan en cuerdas o vegetación'],
    ejemplos: 'Jaula A2 del M16A2 y del M4; SureFire WarComp (apagallamas con función de freno).',
    airsoft: 'En réplicas es casi siempre estético. La rosca de las réplicas es de 14 mm a izquierdas (CCW), no la 1/2×28 real, así que un apagallamas real no entra sin adaptador.',
    fuente: 'Wikipedia (Flash suppressor, M16 rifle)' },

  { id: 'freno-compensador', nombre: 'Freno de boca y compensador', grupo: 'Bocachas', partes: ['mz_comp', 'mz_ak74'],
    resumen: 'Dispositivo de boca que desvía los gases hacia los lados o hacia arriba para reducir el retroceso y la subida del cañón.',
    clave: [['Función', 'Menos retroceso y subida'], ['Peso', '≈ 70–90 g'], ['Rosca (AR-15)', '1/2×28 UNEF']],
    datos: [
      ['Función', 'Desviar los gases para reducir el retroceso y la subida del cañón'],
      ['Salida de gases', 'Hacia los lados y hacia arriba, por cámaras y ventanas'],
      ['Rosca', '1/2×28 UNEF (AR-15, 5,56 mm) · 24×1,5 mm a izquierdas (AK-74)'],
      ['Peso', '≈ 70–90 g'],
      ['Inconveniente', 'Más estruendo y onda de choque hacia los lados'],
      ['Supresor', 'Normalmente incompatible, o necesita un adaptador específico'],
    ],
    como: [
      'Cuando la bala sale, los gases que la empujaban aún tienen presión. El freno los obliga a salir por aberturas laterales o superiores; el chorro empuja el arma hacia delante y hacia abajo y contrarresta parte del retroceso y de la subida del cañón. Un compensador es un freno con los orificios arriba, pensado sobre todo para evitar la subida.',
      'El precio: parte de la onda de choque y del ruido se dirige hacia los lados, también hacia el tirador y sus compañeros.',
    ],
    variantes: [
      ['Compensador de cámaras', 'Cuerpo con varias cámaras y ventanas laterales y superiores; reduce la subida entre disparos.'],
      ['Freno AK-74', 'Freno de dos cámaras con orificios laterales y una ranura superior; el AK-74 lo lleva de serie para domar el retroceso del 5,45×39.'],
    ],
    pros: ['Menos subida del cañón: disparos repetidos más precisos', 'Se nota más cuanto más potente es el cartucho'],
    contras: ['Más estruendo y onda de choque hacia los lados', 'Levanta polvo si se dispara tumbado', 'No suele admitir un supresor encima'],
    ejemplos: 'Freno de dos cámaras del AK-74.',
    airsoft: 'Como el apagallamas, es estético: no reduce el retroceso de una réplica AEG ni GBB. En las réplicas la rosca es de 14 mm a izquierdas (CCW).',
    fuente: 'Wikipedia (Muzzle brake, AK-74)' },

  { id: 'supresor', nombre: 'Supresor', grupo: 'Bocachas', partes: ['mz_sup_s', 'mz_sup_l'],
    resumen: 'Tubo con deflectores internos que frena y enfría los gases del disparo: reduce el estruendo y la llamarada, pero no «silencia».',
    clave: [['Reducción', '≈ 20–35 dB'], ['Longitud', '≈ 15–30 cm'], ['Peso', '≈ 250–600 g']],
    datos: [
      ['Reducción de ruido', '≈ 20–35 dB; un disparo de fusil supera ≈ 160 dB y sigue siendo peligroso para el oído'],
      ['Longitud', '≈ 15–20 cm (corto) · ≈ 25–30 cm (largo)'],
      ['Peso', '≈ 250–600 g'],
      ['Material', 'Titanio, acero inoxidable o Inconel; las cámaras internas se llaman deflectores'],
      ['Fijación', 'Rosca directa 1/2×28 o acoplamiento rápido sobre un apagallamas'],
      ['Efecto secundario', 'Más contrapresión: llegan más gases al tirador y el arma se ensucia antes'],
    ],
    como: [
      'El supresor (también llamado silenciador o moderador) obliga a los gases a recorrer cámaras con deflectores, donde se frenan, se enfrían y se expanden antes de salir. Así escapan más despacio y hacen menos ruido y menos llamarada. No «silencia» el disparo: lo reduce.',
      'Una bala supersónica produce su propio chasquido, la onda de choque del Mach, que el supresor no elimina. Por eso se usan cartuchos subsónicos, como el .300 BLK subsónico (≈ 300 m/s), para un disparo realmente discreto.',
    ],
    variantes: [
      ['Corto', 'Más ligero y manejable, pero con menos volumen interno: reduce algo menos el estruendo.'],
      ['Largo (perforado)', 'Más volumen para enfriar los gases y mayor reducción, pero alarga y desequilibra el arma. La envoltura perforada ayuda a disipar calor y protege la mano.'],
    ],
    pros: ['Reduce el estruendo hasta ≈ 30 dB', 'Reduce la llamarada', 'Mayor comodidad para el tirador y quienes están cerca'],
    contras: ['Añade peso y longitud en el extremo del arma', 'Se calienta mucho tras varios disparos', 'Más gases hacia el tirador y más ensuciamiento', 'Su compra y tenencia están reguladas o prohibidas en muchos países'],
    ejemplos: 'SureFire SOCOM556, KAC QDC, Gemtech.',
    airsoft: 'Es sobre todo un accesorio de imitación: un tubo hueco que se enrosca en la rosca de 14 mm a izquierdas (CCW). Algunos llevan espuma que amortigua algo el escape en réplicas de gas, pero el ruido principal sale de la propia réplica y de la bola.',
    fuente: 'Wikipedia (Suppressor)' },

  { id: 'trazadora', nombre: 'Unidad trazadora', grupo: 'Bocachas', partes: ['mz_tracer'],
    resumen: 'Accesorio exclusivo del airsoft: un tubo en la boca del arma que ilumina con luz ultravioleta las bolas luminiscentes para verlas brillar en la oscuridad.',
    clave: [['Uso', 'Solo airsoft'], ['Rosca', '14 mm a izquierdas'], ['Munición', 'Bolas luminiscentes']],
    datos: [
      ['Uso', 'Exclusivo de airsoft; no tiene equivalente directo en las armas reales'],
      ['Rosca', '14 mm a izquierdas (CCW), como el resto de bocachas de airsoft'],
      ['Iluminación', 'LED ultravioleta que «carga» la bola al pasar'],
      ['Munición', 'Bolas trazadoras de 6 mm; las bolas normales no brillan'],
      ['Detector', 'Los modelos de gama alta detectan la bola y emiten el destello solo cuando pasa'],
      ['Alimentación', 'Pilas o batería recargable, según el modelo'],
      ['Longitud', '≈ 10–20 cm'],
    ],
    como: [
      'Las bolas trazadoras están hechas de un plástico fotoluminiscente. El módulo de la boca las ilumina con luz ultravioleta justo al salir y brillan unos segundos en la oscuridad, así que se ve su trayectoria. Es útil en partidas nocturnas y para corregir el tiro.',
      'No debe confundirse con la munición trazadora real, que lleva una carga pirotécnica que arde en vuelo.',
    ],
    pros: ['Permite seguir la trayectoria de la bola de noche', 'Ayuda a corregir el tiro', 'Muchos modelos tienen forma de falso supresor'],
    contras: ['Necesita bolas trazadoras, más caras', 'Revela desde dónde se dispara', 'Pilas aparte y peso en la boca del arma', 'Algunos campos la prohíben'],
    ejemplos: 'Acetech Lighter S, Lighter M y Lighter BT.',
    airsoft: 'Todo el accesorio es de airsoft. Para que funcione hace falta una bola trazadora; con bolas normales solo hace de adorno.',
    fuente: 'Fabricantes y tiendas de airsoft (Acetech)' },

  /* ═════════════ Luces y láseres ═════════════ */
  { id: 'linterna', nombre: 'Linterna táctica', grupo: 'Luces y láseres', partes: ['ul_light', 'sd_light'],
    resumen: 'Linterna montada en el riel que ilumina el blanco en la dirección del cañón y deja las dos manos en el arma.',
    clave: [['Potencia', '≈ 200–1.500 lm'], ['Autonomía', '≈ 1–3 h'], ['Peso', '≈ 100–150 g']],
    datos: [
      ['Potencia', '≈ 200–1.500 lúmenes, según modelo'],
      ['Alimentación', 'Una o dos pilas CR123A, o AA'],
      ['Autonomía', '≈ 1–3 h a plena potencia'],
      ['Peso', '≈ 100–150 g'],
      ['Cuerpo', 'Aluminio anodizado, estanco'],
      ['Interruptor', 'Pulsador de cola o interruptor remoto de cable; encendido fijo o momentáneo'],
      ['Modos', 'Luz fija y, en muchos modelos, estroboscópica'],
      ['Montaje', 'Riel Picatinny con abrazadera de apriete'],
    ],
    como: [
      'La linterna se monta en el riel y ilumina en la misma dirección que el cañón. Se acciona con un pulsador de cola o con un interruptor remoto de cable, colocado bajo el pulgar o la mano de apoyo.',
      'La potencia se mide en lúmenes (cantidad total de luz); lo que decide el alcance es la candela, la intensidad en el centro del haz. Con potencia alta también puede deslumbrar de forma temporal a quien la recibe, y el modo estroboscópico acentúa ese efecto. Antes de disparar hay que identificar siempre el blanco.',
    ],
    variantes: [
      ['En el riel inferior', 'La posición clásica, bajo el cañón. El interruptor queda al alcance de la mano de apoyo.'],
      ['En el riel lateral', 'A las 3 o las 9 horas: deja libre el riel inferior para una empuñadura, pero el interruptor queda menos accesible y se suele usar un remoto.'],
    ],
    pros: ['Identificar blancos en la oscuridad con las dos manos en el arma', 'Puede deslumbrar de forma temporal', 'Compacta y estanca'],
    contras: ['Delata la posición al encenderla', 'Añade ≈ 100–150 g en la parte delantera', 'Las pilas CR123A son caras y duran poco a máxima potencia'],
    ejemplos: 'SureFire Scout M600 y M300, Streamlight TLR-1 (para pistola).',
    airsoft: 'Las réplicas copian a SureFire y Streamlight, con modelos de ≈ 100 a 1.000 lúmenes. Sirven sobre todo en partidas nocturnas y CQB. No hay que deslumbrar a otros jugadores a corta distancia, y algunos campos limitan los lúmenes o prohíben el estroboscopio.',
    fuente: 'Wikipedia (Tactical light)' },

  { id: 'linterna-laser', nombre: 'Linterna con láser', grupo: 'Luces y láseres', partes: ['ul_laser'],
    resumen: 'Módulo único que combina una linterna y un láser visible: el punto señala dónde apunta el arma sin usar la mira.',
    clave: [['Luz', '≈ 300–1.000 lm'], ['Láser', 'Rojo o verde, ≤ 5 mW'], ['Peso', '≈ 120–180 g']],
    datos: [
      ['Luz', '≈ 300–1.000 lúmenes'],
      ['Láser', 'Rojo (≈ 635 nm) o verde (≈ 520–532 nm), de 5 mW o menos'],
      ['Alimentación', 'Pila de litio CR123A'],
      ['Peso', '≈ 120–180 g'],
      ['Interruptor', 'Pulsador de cola o remoto con varias funciones: luz, láser o ambos'],
      ['Ajuste del láser', 'Tornillos de elevación y deriva para alinearlo con el arma'],
      ['Montaje', 'Riel Picatinny; en pistolas, el riel bajo el cañón'],
    ],
    como: [
      'El láser proyecta un punto sobre el blanco: donde lo ves, llega la bala si el láser está ajustado a esa distancia. Permite apuntar desde la cadera o desde posiciones incómodas, pero no sustituye a la mira a distancia.',
      'El láser verde se ve mejor de día que el rojo, porque el ojo humano es más sensible a ese color; suele ser más caro y gastar más pila.',
    ],
    pros: ['Apuntado instintivo en espacios cerrados o en posiciones incómodas', 'Luz y láser en un solo accesorio', 'El láser verde se ve de día a mayor distancia'],
    contras: ['El punto delata tu posición y quien lo ve sabe dónde apuntas', 'El rojo se ve poco a pleno sol', 'Hay que ajustarlo a la distancia deseada y revisarlo con los golpes'],
    ejemplos: 'SureFire X400, Streamlight TLR-2.',
    airsoft: 'Muchas réplicas incluyen láser rojo o verde de baja potencia. Muchos campos limitan o prohíben los láseres por seguridad ocular: nunca apuntes a la cara ni a los ojos de nadie.',
    fuente: 'Wikipedia (Laser sight, Tactical light)' },

  { id: 'modulo-laser-ir', nombre: 'Módulo láser infrarrojo', grupo: 'Luces y láseres', partes: ['sd_peq'],
    resumen: 'Caja lateral con un láser visible, un láser infrarrojo y un iluminador infrarrojo, pensada para usarla con gafas de visión nocturna.',
    clave: [['Láser IR', '835 nm'], ['Alcance IR', '> 2.000 m'], ['Peso', '≈ 213 g']],
    datos: [
      ['Modelo de referencia', 'AN/PEQ-15 ATPIAL'],
      ['Dimensiones', '120 × 71 × 41 mm'],
      ['Peso', '≈ 213 g'],
      ['Láser visible', 'Rojo, 635 nm, 5 mW'],
      ['Láser infrarrojo', '835 nm, hasta 27,5 mW'],
      ['Iluminador infrarrojo', '835 nm, hasta 45 mW; divergencia ajustable de 1 a 105 mrad'],
      ['Alcance IR', '> 600 m (potencia baja) · > 2.000 m (potencia alta)'],
      ['Alimentación', 'Una pila de litio DL123A (CR123); más de 6 h en el modo de máxima potencia'],
    ],
    como: [
      'El módulo reúne tres emisores. El láser rojo visible se usa de día para ajustar el arma. El láser infrarrojo y el iluminador infrarrojo emiten una luz invisible a simple vista pero visible con gafas de visión nocturna.',
      'Así, un tirador con visión nocturna apunta con el láser IR y alumbra su zona con el iluminador sin delatarse ante quien no lleve visión nocturna.',
    ],
    pros: ['Apunta y alumbra sin emitir luz visible', 'Láser rojo visible para ajustar de día', 'Muy robusto y de gran alcance'],
    contras: ['Voluminoso y pesado (≈ 200 g)', 'La luz IR se ve con visión nocturna: quien la lleve también te ve', 'Solo tiene sentido con gafas de visión nocturna', 'Equipo militar muy caro'],
    ejemplos: 'AN/PEQ-15 ATPIAL, Steiner DBAL-A2.',
    airsoft: 'Casi siempre es una caja de imitación: lleva a lo sumo un láser rojo o verde de baja potencia y a veces una linterna. Se pone por aspecto y realismo; los láseres IR se venden aparte y solo sirven con visión nocturna.',
    fuente: 'Wikipedia (AN/PEQ-15)' },

  /* ═════════════ Empuñaduras y apoyos ═════════════ */
  { id: 'empunadura-vertical', nombre: 'Empuñadura vertical', grupo: 'Empuñaduras y apoyos', partes: ['ul_vfg'],
    resumen: 'Agarre delantero en forma de puño que se monta bajo el cañón para sujetar el arma con la mano de apoyo.',
    clave: [['Altura', '≈ 8–12 cm'], ['Peso', '≈ 70–120 g'], ['Montaje', 'Riel inferior']],
    datos: [
      ['Altura', '≈ 8–12 cm'],
      ['Peso', '≈ 70–120 g'],
      ['Montaje', 'Riel Picatinny (o M-LOK con adaptador)'],
      ['Material', 'Polímero o aluminio'],
      ['Extras', 'Algunas llevan un compartimento, un interruptor remoto para la linterna o un bípode plegable'],
    ],
    como: [
      'Da a la mano de apoyo un agarre firme y vertical, parecido a una empuñadura de pistola. Mejora el control del arma al disparar rápido o en ráfagas y permite tirar de ella hacia el hombro.',
      'Sobresale bajo el cañón, así que en espacios cerrados se usan agarres más cortos y de bajo perfil.',
    ],
    pros: ['Agarre firme de la mano de apoyo', 'Cómoda en disparos rápidos y en ráfagas', 'Mantiene el brazo en una posición constante'],
    contras: ['Sobresale: se engancha con la ropa y el equipo', 'Más alta y pesada que una empuñadura angulada', 'Si la mano resbala hacia delante, acaba cerca de la boca del cañón'],
    ejemplos: 'Magpul MVG, Magpul RVG, Tango Down BG-16.',
    airsoft: 'Es un accesorio muy común. Hay modelos con compartimento para pilas y otros con bípode integrado. En CQB airsoft se prefieren las angulares por su perfil bajo.',
    fuente: 'Wikipedia (Foregrip)' },

  { id: 'empunadura-angulada', nombre: 'Empuñadura angulada', grupo: 'Empuñaduras y apoyos', partes: ['ul_afg'],
    resumen: 'Cuña inclinada que apoya el pulgar y la palma de la mano de apoyo: agarre compacto y de bajo perfil.',
    clave: [['Altura', '≈ 4–6 cm'], ['Peso', '≈ 50–70 g'], ['Montaje', 'Riel inferior']],
    datos: [
      ['Altura', '≈ 4–6 cm'],
      ['Peso', '≈ 50–70 g'],
      ['Montaje', 'Riel Picatinny o M-LOK'],
      ['Material', 'Polímero, a menudo con inserto de goma antideslizante'],
      ['Forma', 'Cuña inclinada que apoya el pulgar y la palma, en vez de un puño vertical'],
    ],
    como: [
      'En lugar de un puño vertical, una cuña inclinada apoya el pulgar y la palma. Mantiene la mano en una posición natural y cerca del cañón sin sobresalir, lo que la hace cómoda en espacios cerrados y apoyada sobre una cobertura.',
      'Ofrece menos palanca que un agarre vertical, pero gana en rapidez y compacidad.',
    ],
    pros: ['Perfil bajo: casi no se engancha', 'Apoyo cómodo del pulgar y la palma', 'Rápida de usar en espacios cerrados'],
    contras: ['Menos palanca que una empuñadura vertical', 'Requiere habituarse a otra posición de la mano'],
    ejemplos: 'Magpul AFG y AFG2.',
    airsoft: 'Es de los accesorios más baratos y fáciles de montar y se usa mucho por su perfil bajo. Vale para cualquier réplica con riel inferior.',
    fuente: 'Wikipedia (Foregrip)' },

  { id: 'bipode', nombre: 'Bípode', grupo: 'Empuñaduras y apoyos', partes: ['ul_bipod'],
    resumen: 'Dos patas plegables bajo el cañón que apoyan el arma en el suelo para tirar tumbado con más estabilidad.',
    clave: [['Altura', '≈ 15–33 cm'], ['Peso', '≈ 300–600 g'], ['Montaje', 'Riel o espiga de correa']],
    datos: [
      ['Alturas habituales', '≈ 15–23 cm (6–9″) · ≈ 23–33 cm (9–13″) · hasta ≈ 70 cm en modelos largos'],
      ['Peso', '≈ 300–600 g'],
      ['Patas', 'Con muelle y escalonadas: se extienden y se bloquean a varias alturas'],
      ['Ajuste', 'Giro para barrer el terreno e inclinación para nivelar en suelo irregular'],
      ['Pies', 'De goma o con puntas, según el modelo'],
      ['Montaje', 'Riel Picatinny, o espiga de correa (sling stud)'],
    ],
    como: [
      'Apoya la parte delantera del arma en el suelo o en un obstáculo. Con él, el tirador tumbado mantiene el arma estable sin cansarse, lo que reduce la dispersión y mejora la precisión en tiros lejanos o prolongados.',
      'Las patas se pliegan hacia delante o hacia atrás cuando no se usan.',
    ],
    pros: ['Gran estabilidad y precisión', 'Menos fatiga en posición tumbada', 'Permite nivelar el arma en terreno irregular'],
    contras: ['Pesa y alarga el arma', 'Poco útil en movimiento o en espacios cerrados', 'Plegado, sobresale bajo el cañón y puede engancharse'],
    ejemplos: 'Harris S-BRM, Atlas BT10, Magpul Bipod.',
    airsoft: 'Es habitual en réplicas de francotirador (VSR-10, L96) y en réplicas de tirador designado. Con una réplica de resorte de precisión, un bípode ayuda a tirar tumbado a 50–100 m. En una AEG corriente es casi un complemento estético.',
    fuente: 'Wikipedia (Bipod)' },

  { id: 'empunadura-ar', nombre: 'Empuñadura de pistola AR-15', grupo: 'Empuñaduras y apoyos', partes: ['grip_std', 'grip_a2', 'grip_ergo'],
    resumen: 'La empuñadura de la mano de disparo del AR-15 y el M16: fija el ángulo de la muñeca respecto al gatillo.',
    clave: [['Fijación', 'Un tornillo'], ['Peso', '≈ 70–100 g'], ['Compatible', 'AR-15 / M16']],
    datos: [
      ['Compatible con', 'Receptor inferior AR-15 / M16; casi todas las del mercado son intercambiables'],
      ['Fijación', 'Un tornillo que atraviesa la empuñadura y se enrosca en el receptor'],
      ['Peso', '≈ 70–100 g'],
      ['Material', 'Polímero, a veces con inserto de goma'],
      ['Ángulo', '≈ 25–30° respecto a la vertical'],
      ['Almacenamiento', 'Algunas llevan un hueco para útiles de limpieza o pilas (p. ej., la HK Battle grip V2 del HK416A5)'],
    ],
    como: [
      'Sujeta la mano de disparo y fija el ángulo de la muñeca respecto al gatillo. Una buena empuñadura da control sin tensión y deja el dedo alineado con el gatillo. No cambia la puntería del arma; cambia la comodidad y el control.',
    ],
    variantes: [
      ['Estándar (A1)', 'La original del M16: de perfil sencillo, sin muesca para el dedo.'],
      ['A2', 'La del M16A2 y el M4: lleva una muesca para el dedo índice y un relieve para la palma.'],
      ['Ergonómica', 'Perfil más ancho y moldeado, con texturas de goma y, en muchos modelos, dorsos intercambiables y un hueco de almacenamiento; por ejemplo, las Magpul MOE y MIAD.'],
    ],
    pros: ['Más control y comodidad con la mano de disparo', 'Intercambiable entre casi todos los AR', 'Algunas llevan hueco de almacenamiento'],
    contras: ['El ángulo y el grosor son personales: lo que va bien a uno puede no ir a otro', 'Las más anchas pueden resultar grandes para manos pequeñas'],
    ejemplos: 'A2 de Colt, Magpul MOE y MIAD, HK Battle grip V2.',
    airsoft: 'En las AEG de tipo M4 la empuñadura aloja el motor: casi todas las de formato M4 valen, pero hay que comprobar que el motor cabe (algunas son más estrechas).',
    fuente: 'Wikipedia (M16 rifle, HK416)' },

  { id: 'empunadura-ak', nombre: 'Empuñadura de pistola AK', grupo: 'Empuñaduras y apoyos', partes: ['grip_ak', 'grip_ak12'],
    resumen: 'La empuñadura de la mano de disparo de la familia Kalashnikov, de perfil recto en los modelos clásicos y más ergonómica en el AK-12.',
    clave: [['Fijación', 'Un tornillo largo'], ['Peso', '≈ 70–90 g'], ['Material', 'Baquelita o polímero']],
    datos: [
      ['Fijación', 'Un tornillo largo que entra por la base de la empuñadura y se enrosca en el receptor'],
      ['Material', 'Madera (AK-47), baquelita o polímero (AKM y AK-74) y polímero moderno (AK-12)'],
      ['Peso', '≈ 70–90 g'],
      ['Almacenamiento', 'La del AK-12 tiene un hueco interior para el estuche de mantenimiento'],
    ],
    como: [
      'Es la pieza que sujeta la mano de disparo en la familia AK. El perfil recto de las clásicas es sencillo y robusto; la del AK-12 es más ergonómica y deja sitio para guardar el estuche de mantenimiento.',
    ],
    variantes: [
      ['Empuñadura AK', 'La clásica: perfil recto, ranuras horizontales y reborde en la base.'],
      ['Empuñadura AK-12', 'Perfil ergonómico y moldeado, con un hueco interior para el estuche de mantenimiento.'],
    ],
    pros: ['Robusta y sencilla', 'La del AK-12 es más cómoda y guarda el estuche', 'Piezas de repuesto muy abundantes'],
    contras: ['La clásica es de perfil recto y menos cómoda', 'La sujeta un único tornillo: conviene revisarlo'],
    ejemplos: 'Empuñadura de baquelita del AKM, de polímero del AK-74M y del AK-12.',
    airsoft: 'En las AEG de tipo AK la empuñadura aloja el motor; hay modelos más grandes para motores largos. Cada marca tiene sus medidas, así que hay que comprobar que es compatible con la réplica.',
    fuente: 'Wikipedia (AK-12)' },

  /* ═════════════ Cargadores ═════════════ */
  { id: 'cargador-pistola', nombre: 'Cargador de pistola', grupo: 'Cargadores', partes: ['pmag_std', 'pmag_ext'],
    resumen: 'Caja con muelle que guarda los cartuchos de la pistola en doble hilera y los presenta de uno en uno a la corredera.',
    clave: [['Capacidad', '15–17 (hasta 33)'], ['Calibre', '9×19 mm'], ['Peso vacío', '≈ 70–130 g']],
    datos: [
      ['Capacidad (9×19 mm)', '15–17 cartuchos en el estándar; 19–33 en los prolongados'],
      ['Disposición', 'Doble hilera de cartuchos escalonados (bicolumna)'],
      ['Cuerpo', 'Acero o polímero, con elevador y muelle'],
      ['Peso vacío', '≈ 70–130 g'],
      ['Retención', 'Botón de liberación del cargador: al pulsarlo, el cargador cae'],
      ['Réplica GBB', '≈ 20–31 bolas; el cargador guarda también el gas'],
    ],
    como: [
      'Guarda los cartuchos apilados y los presenta de uno en uno a la corredera. En una doble hilera los cartuchos se apilan en zigzag, lo que da más capacidad sin alargar la empuñadura; el muelle empuja el elevador hacia arriba para que siempre haya un cartucho listo.',
    ],
    variantes: [
      ['Estándar', 'Al ras de la empuñadura. Capacidad base: 15 en la Beretta M9, 17 en la Glock 17.'],
      ['Extendido', 'Sobresale bajo la empuñadura: más cartuchos (hasta ≈ 33 en la Glock), a costa de longitud y peso.'],
    ],
    pros: ['Recarga rápida: se cambia en ≈ 1–2 s', 'El extendido añade capacidad sin cambiar de arma'],
    contras: ['El extendido sobresale y es más difícil de ocultar', 'Los muelles se fatigan con el uso', 'Un cargador defectuoso es una causa frecuente de fallos de alimentación'],
    ejemplos: 'Cargadores de Glock 17 (17 y 33 cartuchos), Beretta M9 (15), Tokyo Marui Hi-Capa (airsoft).',
    airsoft: 'En las réplicas de gas (GBB) el cargador es también el depósito de gas: guarda de ≈ 20 a 31 bolas, y cada fabricante usa su formato. El de Tokyo Marui es el estándar de facto de las Hi-Capa y de las Glock.',
    fuente: 'Wikipedia (Magazine (firearms))' },

  { id: 'stanag-metalico', nombre: 'Cargador STANAG metálico', grupo: 'Cargadores', partes: ['rmag_metal', 'mag_hk'],
    resumen: 'El cargador estándar del M16, del M4 y de decenas de fusiles que usan la misma boca: 30 cartuchos de 5,56×45 mm en aluminio o acero.',
    clave: [['Capacidad', '30'], ['Calibre', '5,56×45 mm'], ['Peso vacío', '≈ 115–250 g']],
    datos: [
      ['Norma', 'STANAG 4179: el estándar OTAN de cargador tipo M16 / AR-15'],
      ['Capacidad', '30 cartuchos (también 20 y 40)'],
      ['Cuerpo', 'Aluminio anodizado (el de dotación estándar) o acero (HK)'],
      ['Peso vacío', '≈ 115 g (aluminio) · ≈ 250 g (acero HK416)'],
      ['Alimentación', 'Doble hilera escalonada; los labios del cuerpo sujetan los cartuchos'],
    ],
    como: [
      'Es la «boca» común de la mayoría de fusiles de 5,56 mm occidentales. El cuerpo de aluminio es ligero y barato; el de acero, como el del HK416, pesa más del doble pero es más rígido y aguanta mejor los golpes y el calor.',
      'El desgaste más común está en los labios: si se deforman, el cargador deja de alimentar bien y hay que sustituirlo.',
    ],
    variantes: [
      ['Aluminio de dotación', 'Ligero y barato; el estándar del M16 y del M4.'],
      ['Acero HK', 'Más pesado (≈ 250 g vacío) y más rígido; el del HK416, compatible con la boca STANAG.'],
    ],
    pros: ['Estándar universal: vale en cientos de armas', 'Ligero y barato (aluminio)', 'El de acero soporta bien golpes y calor'],
    contras: ['Los labios de aluminio se deforman con el uso', 'Sin ventana: no ves cuántos cartuchos quedan', 'El de acero pesa más del doble'],
    ejemplos: 'Cargador de dotación de 30 en aluminio, cargador de acero del HK416.',
    airsoft: 'Las AEG de tipo M4 usan cargadores del mismo formato, pero con capacidades distintas: «real-cap» (≈ 30 bolas), «mid-cap» (≈ 120) y «hi-cap» (≈ 300 o más). Los metálicos aguantan mejor los golpes que los de polímero.',
    fuente: 'Wikipedia (STANAG magazine, HK416)' },

  { id: 'stanag-polimero', nombre: 'Cargador STANAG de polímero', grupo: 'Cargadores', partes: ['rmag_poly'],
    resumen: 'Evolución en polímero del cargador STANAG: más resistente a golpes y barro, con elevador antibasculante y ventana de nivel.',
    clave: [['Capacidad', '30'], ['Peso vacío', '≈ 130–160 g'], ['Compatible', 'STANAG']],
    datos: [
      ['Norma', 'Compatible con la boca STANAG (AR-15 / M4)'],
      ['Capacidad', '30 cartuchos (también 10, 20 y 40)'],
      ['Cuerpo', 'Polímero con labios reforzados; no se abolla ni se oxida'],
      ['Elevador', 'Antibasculante: evita que se atasque al subir'],
      ['Ventana', 'Muchos modelos llevan una ventana para ver cuántos cartuchos quedan'],
      ['Peso vacío', '≈ 130–160 g'],
      ['Colores', 'Negro, tierra, verde OD, gris y otros'],
    ],
    como: [
      'Es la versión en polímero del cargador STANAG; el Magpul PMAG (2007) lo popularizó. Resiste golpes, caídas y barro sin deformarse y lleva un elevador antibasculante que mejora la alimentación. Varios ejércitos y cuerpos de policía lo han adoptado en lugar del de aluminio.',
    ],
    pros: ['Resistente a golpes, óxido y barro', 'Elevador antibasculante: alimenta mejor', 'Ventana para controlar los cartuchos'],
    contras: ['Algo más grueso que el de aluminio', 'Más caro que un cargador de dotación', 'Con los años, el polímero puede degradarse con calor y exposición solar extremos'],
    ejemplos: 'Magpul PMAG 30 GEN M3, Lancer L5AWM (translúcido).',
    airsoft: 'Los PMAG son de los cargadores de airsoft más comunes: se venden «real-cap» y de gran capacidad, con la forma y a menudo la ventana del original, y en varios colores para combinar con la réplica.',
    fuente: 'Wikipedia (STANAG magazine, Magpul PMAG)' },

  { id: 'stanag-corto', nombre: 'Cargador STANAG corto', grupo: 'Cargadores', partes: ['rmag_short'],
    resumen: 'Cargador de 20 cartuchos, el original del M16: más corto y manejable, cómodo para tirar tumbado y moverse entre obstáculos.',
    clave: [['Capacidad', '20'], ['Calibre', '5,56×45 mm'], ['Uso', 'Tiro tumbado, espacios cerrados']],
    datos: [
      ['Capacidad', '20 cartuchos (el cargador original del M16)'],
      ['Cuerpo', 'Aluminio'],
      ['Longitud', '≈ 2/3 de la del cargador de 30'],
      ['Compatibilidad', 'Misma boca STANAG: vale en cualquier AR-15 o M4'],
    ],
    como: [
      'El cargador de 20 es el original del M16. Al ser más corto que el de 30, resulta más cómodo al disparar tumbado (no choca con el suelo) y al moverse entre obstáculos. Ofrece menos munición a cambio de manejabilidad.',
    ],
    pros: ['Más corto: cómodo al disparar tumbado', 'Menos voluminoso en el equipo', 'Misma boca que el de 30'],
    contras: ['Un tercio menos de munición', 'Más recargas en un tiroteo largo'],
    ejemplos: 'Cargador de aluminio de 20 del M16.',
    airsoft: 'Los cargadores «real-cap» de 20–30 bolas copian este formato y gustan a quien busca realismo y limitar la munición.',
    fuente: 'Wikipedia (STANAG magazine, M16 rifle)' },

  { id: 'tambor', nombre: 'Cargador de tambor', grupo: 'Cargadores', partes: ['rmag_drum'],
    resumen: 'Cargador de gran capacidad (60–100 cartuchos) en forma de tambor, pensado para fuego de supresión.',
    clave: [['Capacidad', '60–100'], ['Peso vacío', '≈ 1 kg'], ['Tipo', 'Tambor']],
    datos: [
      ['Capacidad', '60 a 100 cartuchos de 5,56×45 mm'],
      ['Tipo', 'Tambor doble («saddle drum»), con dos cuerpos laterales que alimentan por el centro; también hay simples'],
      ['Peso', '≈ 1 kg vacío; ≈ 2 kg con 100 cartuchos'],
      ['Alimentación', 'Un muelle gira los tambores y empuja los cartuchos hacia el arma'],
      ['Compatibilidad', 'Boca STANAG y, en algunos modelos (Beta C-Mag), el G36'],
    ],
    como: [
      'En vez de una caja larga, los cartuchos se alojan en uno o dos tambores que giran con un muelle y los entregan al arma. La capacidad se multiplica por tres, algo útil para el fuego de supresión o las armas de apoyo ligeras.',
    ],
    pros: ['Gran capacidad (hasta 100 cartuchos)', 'Pocas recargas en fuego de supresión'],
    contras: ['Muy pesado y voluminoso', 'Suele ser menos fiable que un cargador de caja', 'Incómodo para disparar tumbado', 'Lento de cargar'],
    ejemplos: 'Beta C-Mag (100 cartuchos).',
    airsoft: 'Los tambores de airsoft son muy populares: guardan de ≈ 500 a 2.000 bolas y se alimentan con una rueda o un motor eléctrico. Son pesados y llamativos, y el alimentador hace ruido.',
    fuente: 'Wikipedia (Beta C-Mag, Magazine (firearms))' },

  { id: 'cargador-ak545', nombre: 'Cargador AK de 5,45×39 mm', grupo: 'Cargadores', partes: ['mag_ak545', 'mag_ak12'],
    resumen: 'Cargador curvo de 30 cartuchos del AK-74M y el AK-12, de polímero, ligero y casi indestructible.',
    clave: [['Capacidad', '30'], ['Calibre', '5,45×39 mm'], ['Peso vacío', '≈ 230 g']],
    datos: [
      ['Capacidad', '30 cartuchos de 5,45×39 mm'],
      ['Cuerpo', 'Polímero: baquelita color ciruela en el AK-74 original; polímero negro en las versiones posteriores'],
      ['Forma', 'Curva y de doble hilera'],
      ['Peso vacío', '≈ 230 g'],
      ['Inserción', 'Se engancha por delante y se gira hacia atrás hasta el retén («rock-in»)'],
      ['Intercambiabilidad', 'Los cargadores de 7,62×39 mm no sirven de forma fiable'],
    ],
    como: [
      'Los cargadores AK no se meten en línea recta como los del AR: se enganchan por el gancho delantero y se giran hacia atrás hasta que el retén cierra con un clic. Su curvatura sigue el cono del cartucho. Los de polímero son más ligeros que los de acero del AK-47 y muy resistentes.',
    ],
    variantes: [
      ['Polímero 5,45', 'El cargador de 30 en polímero del AK-74M; los primeros eran de baquelita color ciruela.'],
      ['AK-12 (con ventana)', 'Lleva ventanas a 10, 15, 20, 25 y 30 cartuchos y un elevador con pintura fosforescente; un pasador asoma por la base cuando está lleno.'],
    ],
    pros: ['Muy robusto: soporta golpes y suciedad', 'Ligero (polímero)', 'El del AK-12 permite ver cuántos cartuchos quedan'],
    contras: ['Curvo y voluminoso en el chaleco', 'No intercambiable con los de 7,62×39'],
    ejemplos: 'Cargador ciruela del AK-74, polímero negro del AK-74M, cargador del AK-12.',
    airsoft: 'Las AEG de tipo AK tienen cargadores «real-cap» (≈ 30 bolas), «mid-cap» (≈ 120–150) y «hi-cap» (≈ 300–500). Los de acero son más duraderos; los de polímero copian la silueta del cargador moderno.',
    fuente: 'Wikipedia (AK-74, AK-12)' },

  { id: 'cargador-scarh', nombre: 'Cargador de 7,62×51 mm (SCAR-H)', grupo: 'Cargadores', partes: ['mag_scarh'],
    resumen: 'Cargador de 20 cartuchos de 7,62×51 mm del FN SCAR-H: más ancho que el de 5,56 mm porque el cartucho es más grande.',
    clave: [['Capacidad', '20'], ['Calibre', '7,62×51 mm'], ['Compatible', 'FN SCAR-H']],
    datos: [
      ['Capacidad', '20 cartuchos de 7,62×51 mm NATO'],
      ['Cuerpo', 'Caja de acero o polímero reforzado; más ancho que el de 5,56 mm'],
      ['Alimentación', 'Doble hilera escalonada'],
      ['Compatible con', 'FN SCAR-H (el SCAR-L usa cargadores STANAG de 30)'],
      ['Versión civil', 'El SCAR-20S usa un cargador de 10 cartuchos'],
    ],
    como: [
      'El 7,62×51 mm es un cartucho más largo y grueso que el 5,56, así que su cargador es más ancho y de menor capacidad (20). Lo usa solo el SCAR-H; el SCAR-L emplea cargadores STANAG de 30.',
      'A cambio de menos cartuchos, cada uno entrega bastante más energía. Veinte cartuchos pesan ≈ 0,5 kg.',
    ],
    pros: ['Alimenta un cartucho potente y de largo alcance', 'Compacto para el calibre'],
    contras: ['Solo 20 cartuchos', 'Más pesado: ≈ 0,5 kg de munición', 'Exclusivo del SCAR-H'],
    ejemplos: 'Cargador de 20 del FN SCAR-H.',
    airsoft: 'Los cargadores de las SCAR-H de airsoft son específicos de cada marca; conviene mirar cuántas bolas caben realmente antes de comprarlos.',
    fuente: 'Wikipedia (FN SCAR)' },

  { id: 'cargador-galil', nombre: 'Cargador Galil de 35', grupo: 'Cargadores', partes: ['mag_galil'],
    resumen: 'El cargador propio del Galil ACE en 5,56×45 mm: 35 cartuchos, más largo y curvo que un STANAG.',
    clave: [['Capacidad', '35 (también 50)'], ['Calibre', '5,56×45 mm'], ['Compatible', 'Galil ACE']],
    datos: [
      ['Capacidad', '35 cartuchos; existe también una versión de 50'],
      ['Calibre', '5,56×45 mm NATO'],
      ['Compatible con', 'Galil ACE 21, 22 y 23 (cargador propio)'],
      ['Alternativa', 'El ACE-N usa cargadores OTAN (STANAG) de 30'],
      ['Otros calibres', '7,62×39 mm: cargador AK de 30 · 7,62×51 mm: cargador Galil propio de 25'],
    ],
    como: [
      'El Galil ACE, heredero del fusil Galil, mantiene su propio cargador: más largo y curvo que el STANAG, con 35 cartuchos. Es más voluminoso, pero ofrece más capacidad; la versión ACE-N lo sustituye por el cargador OTAN de 30.',
    ],
    pros: ['35 cartuchos: más que un STANAG de 30'],
    contras: ['Formato propio: solo vale en el Galil', 'Más largo y curvo: más voluminoso', 'Más difícil de encontrar que un STANAG'],
    ejemplos: 'Cargador Galil de 35 y de 50.',
    airsoft: 'Las réplicas del Galil ACE usan cargadores de formato propio y hay pocas alternativas.',
    fuente: 'Wikipedia (IWI Galil ACE)' },

  { id: 'cargador-g36', nombre: 'Cargador G36 translúcido', grupo: 'Cargadores', partes: ['mag_g36'],
    resumen: 'Cargador de 30 cartuchos de plástico translúcido del G36, con salientes para unir dos cargadores.',
    clave: [['Capacidad', '30'], ['Cuerpo', 'Translúcido'], ['Acoplable', 'Sí']],
    datos: [
      ['Capacidad', '30 cartuchos de 5,56×45 mm'],
      ['Cuerpo', 'Plástico translúcido y resistente a los golpes'],
      ['Acoplamiento', 'Salientes laterales que permiten unir dos cargadores («jungle style»)'],
      ['Tambor', 'Existe un Beta C-Mag de 100 cartuchos que funciona en el G36'],
      ['Peso vacío', '≈ 130 g'],
    ],
    como: [
      'El cargador del G36 es de plástico translúcido, de modo que ves cuántos cartuchos quedan sin sacarlo. Lleva salientes laterales que permiten unir dos cargadores lado a lado para recargar casi al instante, dándole la vuelta al conjunto.',
    ],
    pros: ['Se ve el nivel de munición', 'Se pueden unir dos cargadores para recargar más rápido', 'Ligero y resistente a los golpes'],
    contras: ['Formato propio: no es STANAG', 'Acoplados, el conjunto es más ancho y la boca libre se ensucia'],
    ejemplos: 'Cargador de 30 del G36 y Beta C-Mag de 100.',
    airsoft: 'Las réplicas del G36 de airsoft usan cargadores de formato propio, a menudo translúcidos para ver las bolas; los salientes de acoplamiento también se copian.',
    fuente: 'Wikipedia (Heckler & Koch G36)' },

  { id: 'cargador-subfusil', nombre: 'Cargador de subfusil', grupo: 'Cargadores', partes: ['smag_curve', 'smag_straight'],
    resumen: 'Cargadores de 9×19 mm de los subfusiles: curvos en los de 30 cartuchos y rectos en los de menor capacidad.',
    clave: [['Calibre', '9×19 mm'], ['Capacidad', '15–32'], ['Peso vacío', '≈ 140–160 g']],
    datos: [
      ['Calibre', '9×19 mm Parabellum'],
      ['Capacidad', '15 a 32 cartuchos, según el arma'],
      ['Forma', 'Curva en los de 30 cartuchos; recta en los de menos capacidad o en los de empuñadura'],
      ['Cuerpo', 'Acero con elevador y muelle'],
      ['Peso vacío', '≈ 140–160 g'],
    ],
    como: [
      'El cartucho 9×19 mm es algo cónico, por eso los cargadores de 30 suelen ser curvos. Los rectos tienen menos capacidad o van dentro de la empuñadura, como en el Uzi (25 o 32 cartuchos). Cada subfusil usa el suyo, aunque comparten calibre.',
    ],
    variantes: [
      ['Curvo', 'El de los subfusiles de cargador delante del gatillo, como el MP5 (30 cartuchos).'],
      ['Recto', 'Menor capacidad (15 en el MP5) o diseñado para ir en la empuñadura, como el del Uzi.'],
    ],
    pros: ['Recarga rápida', 'El curvo da 30 cartuchos', 'El recto es más sencillo de llevar en el equipo'],
    contras: ['Poco intercambiables entre modelos', 'El curvo es más voluminoso en el equipo'],
    ejemplos: 'MP5 (15 y 30), Uzi (25 y 32).',
    airsoft: 'Las réplicas AEG de MP5 y otros subfusiles usan cargadores curvos «mid-cap» o «real-cap» (≈ 70 a 120 bolas); algunas versiones de gas llevan cargadores de gas propios.',
    fuente: 'Wikipedia (Heckler & Koch MP5, Uzi)' },

  { id: 'cargadores-acoplados', nombre: 'Cargadores acoplados', grupo: 'Cargadores', partes: ['smag_dual'],
    resumen: 'Dos cargadores unidos lado a lado («jungle style»): al vaciar uno, se da la vuelta al conjunto y se recarga en uno o dos segundos.',
    clave: [['Cargadores', '2'], ['Recarga', '≈ 1–2 s'], ['Técnica', '«Jungle style»']],
    datos: [
      ['Técnica', '«Jungle style»: dos cargadores unidos lado a lado'],
      ['Unión', 'Cinta, abrazadera o salientes de fábrica (G36)'],
      ['Recarga', 'Se saca el cargador vacío, se invierte el conjunto y se inserta el otro'],
      ['Capacidad', 'El doble que uno solo (p. ej., 60 en 9×19 mm con dos de 30)'],
      ['Peso extra', '≈ 140–160 g (el segundo cargador vacío)'],
    ],
    como: [
      'Dos cargadores se unen con las bocas en sentidos opuestos. Al vaciar el primero se saca, se da la vuelta al conjunto y se inserta el segundo: la recarga tarda uno o dos segundos. Es una práctica antigua entre los militares; hay abrazaderas comerciales y el G36 lleva salientes de serie.',
    ],
    pros: ['Recarga muy rápida', 'Sin cambiar de arma ni de sistema'],
    contras: ['Más ancho y voluminoso: se engancha con el equipo', 'La boca del cargador libre queda expuesta a la suciedad', 'Se vuelve difícil disparar tumbado'],
    ejemplos: 'Abrazaderas comerciales para MP5 y AR-15; G36 (salientes de serie).',
    airsoft: 'Es una modificación habitual en las AEG. Las abrazaderas cuestan poco, pero conviene comprobar que el conjunto no roza con el cuerpo de la réplica.',
    fuente: 'Wikipedia (Magazine (firearms), Heckler & Koch G36)' },

  /* ═════════════ Culatas ═════════════ */
  { id: 'culata-telescopica', nombre: 'Culata telescópica (tipo M4)', grupo: 'Culatas', partes: ['rstock_ret', 'stock_m4'],
    resumen: 'Culata deslizante con varias posiciones: se acorta para moverse en espacios cerrados y se alarga para disparar con comodidad.',
    clave: [['Posiciones', '≈ 4–6'], ['M4A1', '757–838 mm'], ['Peso', '≈ 200–300 g']],
    datos: [
      ['Posiciones', 'Varias; la del M4 y la estándar del HK416 tienen seis'],
      ['Longitud del M4A1', '838 mm con la culata extendida · 757 mm replegada'],
      ['Peso', '≈ 200–300 g'],
      ['Ajuste', 'Una palanca bajo la culata libera el tubo para deslizarla'],
      ['Tubo', 'Tubo del amortiguador; el diámetro «mil-spec» (≈ 29,2 mm) y el comercial (≈ 29,7 mm) no son idénticos'],
      ['Compatibilidad', 'Armas con tubo de amortiguador tipo AR-15 (carabina)'],
    ],
    como: [
      'La culata se desliza sobre el tubo del amortiguador: se acorta para moverse con chaleco o en espacios cerrados y se alarga para disparar con el brazo más estirado. La posición adecuada depende de la altura del tirador, del equipo que lleve y de la óptica.',
      'Debe encajar bien en el tubo: el diámetro mil-spec y el comercial son ligeramente distintos, y una culata para uno puede quedar con holgura en el otro.',
    ],
    variantes: [
      ['Culata M4', 'La estándar del M4 y del M4A1: de polímero y con seis posiciones.'],
      ['Telescópica genérica', 'Versiones del mercado (como Magpul CTR y MOE) con almohadilla de goma, ranuras para la correa y, a veces, hueco de almacenamiento.'],
    ],
    pros: ['Se adapta a cada tirador y a su equipo', 'Corta para vehículos y espacios cerrados', 'Muy extendida: hay cientos de modelos'],
    contras: ['Menos rígida que una culata fija', 'Puede quedar holgura si el tubo no coincide', 'Con la longitud mínima, el apoyo de mejilla es peor'],
    ejemplos: 'Culata del M4 (Colt), Magpul CTR y MOE, culata estándar del HK416.',
    airsoft: 'Casi todas las AEG de tipo M4 llevan culata telescópica de seis posiciones y admiten culatas del mismo formato. Algunas esconden la batería en el tubo: conviene que el compartimento sea el adecuado para tu batería.',
    fuente: 'Wikipedia (M4 carbine, HK416)' },

  { id: 'culata-fija', nombre: 'Culata fija (tipo A2)', grupo: 'Culatas', partes: ['rstock_fixed'],
    resumen: 'Culata sólida y rígida sin ajuste de longitud: ofrece un apoyo estable y masa para amortiguar el retroceso.',
    clave: [['Ajuste', 'Ninguno'], ['Peso', '≈ 350–450 g'], ['Uso', 'Fusil de longitud completa']],
    datos: [
      ['Ajuste', 'Ninguno: longitud fija'],
      ['Tubo', 'Tubo de amortiguador de fusil, más largo que el de carabina'],
      ['Material', 'Polímero (nailon reforzado)'],
      ['Peso', '≈ 350–450 g'],
      ['Almacenamiento', 'La del M16A2 lleva una trampilla en la placa de hombro para útiles de limpieza'],
    ],
    como: [
      'Una culata fija mantiene siempre la misma distancia al hombro, lo que facilita repetir el apoyo y aporta masa que ayuda a amortiguar el retroceso. Es la de los fusiles de longitud completa; la telescópica gana en versatilidad.',
    ],
    pros: ['Rígida y estable', 'Apoyo de mejilla repetible en cada disparo', 'Más masa: amortigua el retroceso'],
    contras: ['No se adapta a otros tiradores ni al equipo', 'Más larga y pesada', 'Incómoda en espacios cerrados'],
    ejemplos: 'Culata A2 del M16A2.',
    airsoft: 'En las AEG, la culata fija de rifle permite alojar baterías de gran tamaño. Es la habitual en las réplicas del M16A2.',
    fuente: 'Wikipedia (M16 rifle)' },

  { id: 'culata-esqueleto', nombre: 'Culata esqueleto', grupo: 'Culatas', partes: ['rstock_skel'],
    resumen: 'Culata de estructura abierta, con huecos, que ahorra peso manteniendo el apoyo en el hombro.',
    clave: [['Estructura', 'Abierta'], ['Peso', '≈ 150–250 g'], ['Ajuste', 'Fija o telescópica']],
    datos: [
      ['Estructura', 'Armazón abierto con huecos'],
      ['Peso', '≈ 150–250 g'],
      ['Ajuste', 'Según el modelo: fija o telescópica'],
      ['Montaje', 'Tubo del amortiguador AR-15'],
      ['Material', 'Polímero o aluminio'],
    ],
    como: [
      'La estructura abierta quita material donde no hace falta: la culata pesa menos que una sólida y deja el arma más equilibrada. Se usa en fusiles ligeros y deportivos. A cambio, la mejilla apoya en un borde más duro y la culata es algo menos rígida.',
    ],
    pros: ['Más ligera que una sólida', 'Equilibra el arma', 'Aspecto fácil de reconocer'],
    contras: ['Menos rígida', 'Apoyo de mejilla menos cómodo', 'Sin hueco de almacenamiento'],
    airsoft: 'Es muy usada por su aspecto y por el peso que ahorra en AEG pequeñas; la mayoría no tiene espacio para una batería grande.',
    fuente: 'Wikipedia (Stock (firearm))' },

  { id: 'culata-pdw', nombre: 'Culata PDW', grupo: 'Culatas', partes: ['stock_pdw'],
    resumen: 'Culata compacta de dos varillas telescópicas y placa de hombro corta, pensada para armas muy cortas.',
    clave: [['Estructura', '2 varillas'], ['Peso', '≈ 200–250 g'], ['Uso', 'PDW y CQB']],
    datos: [
      ['Estructura', 'Dos varillas paralelas y una placa de hombro corta'],
      ['Peso', '≈ 200–250 g'],
      ['Ajuste', 'Telescópica'],
      ['Montaje', 'Tubo del amortiguador AR-15 o adaptador de subfusil'],
    ],
    como: [
      'Es la forma clásica de las armas de defensa personal (PDW): dos varillas de metal deslizan una placa de hombro pequeña. Replegada, acorta mucho el arma, algo útil en vehículos y espacios cerrados.',
      'La placa pequeña apoya peor en el hombro y no ayuda a mantener estable la óptica a distancia.',
    ],
    pros: ['Muy compacta', 'Ligera', 'Sirve en subfusiles y en AR'],
    contras: ['Placa pequeña: apoyo menos estable', 'Menos precisa a distancia', 'La mejilla no apoya bien'],
    airsoft: 'Es habitual en réplicas CQB. Muchas no tienen espacio para una batería grande, así que conviene comprobarlo antes de montarla.',
    fuente: 'Wikipedia (Personal defense weapon, Stock (firearm))' },

  { id: 'culata-hk', nombre: 'Culata HK delgada (HK416A5)', grupo: 'Culatas', partes: ['stock_hk'],
    resumen: 'Culata fija y delgada del HK416A5, con placa de hombro rígida y sin ajuste de longitud.',
    clave: [['Ajuste', 'Fija'], ['Peso', '≈ 290 g'], ['Almacenamiento', 'No']],
    datos: [
      ['Modelo de referencia', 'HK416A5'],
      ['Ajuste', 'Ninguno: placa de hombro fija'],
      ['Forma', 'Más estrecha que la telescópica; similar a la del G28'],
      ['Almacenamiento', 'No tiene hueco interior'],
      ['Peso', '≈ 290 g'],
      ['Intercambiable', 'Puede sustituirse por otras culatas, como las de Magpul'],
    ],
    como: [
      'El HK416A5 sustituyó la culata telescópica por una más fina y fija, con placa de hombro rígida. Gana en rigidez y ofrece un apoyo estable y repetible, pero no se adapta a la longitud del tirador. Quien necesite ajuste tiene la culata estándar del HK416, con seis posiciones.',
    ],
    pros: ['Apoyo estable y repetible', 'Perfil estrecho: no se engancha', 'Sin piezas móviles'],
    contras: ['Longitud fija: no se adapta al tirador', 'Sin hueco de almacenamiento'],
    ejemplos: 'Culata del HK416A5 y del G28.',
    airsoft: 'Las réplicas del HK416A5 la copian. Al ser fija, no se puede ajustar la longitud.',
    fuente: 'Wikipedia (HK416)' },

  { id: 'culata-subfusil-plegable', nombre: 'Culata plegable de subfusil', grupo: 'Culatas', partes: ['sstock_fold'],
    resumen: 'Culata de subfusil que se pliega hacia el lateral o debajo del arma para dejarla compacta.',
    clave: [['Ajuste', 'Plegable'], ['Peso', '≈ 200 g'], ['Uso', 'Subfusiles']],
    datos: [
      ['Plegado', 'Hacia el lateral o debajo del arma'],
      ['Material', 'Acero o polímero'],
      ['Peso', '≈ 200 g'],
      ['Montaje', 'Adaptador de subfusil'],
      ['Bloqueo', 'Pestillo o botón que la fija abierta'],
    ],
    como: [
      'Plegada, la culata deja el subfusil muy corto, útil para llevarlo en vehículos o en un estuche. Desplegada, da el apoyo en el hombro que una pistola no tiene. Muchos modelos permiten disparar con ella plegada, aunque de forma menos estable.',
    ],
    pros: ['Muy compacta al plegarla', 'Ligera', 'Se despliega rápido'],
    contras: ['Algo menos rígida que una fija', 'Puede aflojarse con el uso', 'No se ajusta a la longitud del tirador'],
    ejemplos: 'CZ Scorpion EVO 3, MP5K-PDW.',
    airsoft: 'Es típica de las réplicas de subfusil compacto. La bisagra puede ser de plástico o de metal; las metálicas aguantan mejor el uso.',
    fuente: 'Wikipedia (Stock (firearm))' },

  { id: 'culata-alambre', nombre: 'Culata de alambre', grupo: 'Culatas', partes: ['sstock_wire'],
    resumen: 'Culata de varilla metálica, plegable o deslizante: la más sencilla y ligera de las culatas.',
    clave: [['Estructura', 'Varilla de acero'], ['Peso', '≈ 150–350 g'], ['Ajuste', 'Plegable o deslizante']],
    datos: [
      ['Estructura', 'Dos varillas de acero y una placa de hombro'],
      ['Peso', '≈ 150–350 g'],
      ['Plegado', 'Debajo del arma (Uzi, MP40) o deslizante (MAC-10)'],
      ['Material', 'Acero estampado y soldado'],
      ['Coste', 'Barata y fácil de fabricar'],
    ],
    como: [
      'Dos varillas de acero con una placa de hombro estrecha: muy simples, baratas y ligeras. Eran habituales en los subfusiles de la posguerra, como el Uzi, que se pliega bajo el arma, o el MAC-10, que se desliza. El apoyo en el hombro es incómodo, pero cumple a corta distancia.',
    ],
    pros: ['Muy ligera y sencilla', 'Barata de fabricar', 'Plegada, apenas ocupa'],
    contras: ['Poco cómoda: la placa estrecha se clava en el hombro', 'Apoyo poco estable', 'La holgura crece con el uso'],
    ejemplos: 'Uzi, MP40, MAC-10.',
    airsoft: 'Se ve en réplicas de Uzi, MAC-10 y MP40. Las de plástico pesan menos pero se doblan; las de metal son más realistas.',
    fuente: 'Wikipedia (Uzi, Stock (firearm))' },

  { id: 'culata-ak74m', nombre: 'Culata plegable AK-74M', grupo: 'Culatas', partes: ['stock_ak74m'],
    resumen: 'Culata plegable de polímero del AK-74M, el rasgo que lo distingue de los AK-74 anteriores.',
    clave: [['Plegado', 'Lateral'], ['Material', 'Polímero'], ['Peso', '≈ 400 g']],
    datos: [
      ['Material', 'Polímero negro'],
      ['Plegado', 'Lateral, sobre el receptor'],
      ['Ajuste', 'Longitud fija'],
      ['Peso', '≈ 400 g'],
      ['Compatible con', 'AK-74M'],
    ],
    como: [
      'El AK-74M introdujo la culata plegable de polímero, que sustituye a la de madera y a la de varillas de acero del AKS-74. Plegada al lateral, acorta el arma para llevarla en vehículos; desplegada, ofrece un apoyo firme.',
    ],
    pros: ['Plegable: acorta el arma', 'Robusta y de polímero resistente'],
    contras: ['Longitud fija: no se ajusta al tirador'],
    ejemplos: 'AK-74M.',
    airsoft: 'Las réplicas de AK-74M copian su aspecto. La batería suele ir en el guardamanos.',
    fuente: 'Wikipedia (AK-74)' },

  { id: 'culata-ak12', nombre: 'Culata AK-12 regulable', grupo: 'Culatas', partes: ['stock_ak12'],
    resumen: 'Culata plegable y telescópica del AK-12, regulable en longitud y con apoyo de mejilla opcional.',
    clave: [['Posiciones', '4–6'], ['Plegado', 'Lateral'], ['Peso', '≈ 450 g']],
    datos: [
      ['Plegado', 'Hacia el lateral'],
      ['Ajuste', 'Telescópica: 4 posiciones en el modelo original y 6 en la revisión de 2020'],
      ['Material', 'Polímero ligero (versión de 2020)'],
      ['Mejilla', 'Apoyo de mejilla opcional (desde 2021) que ajusta la altura de la mira'],
      ['Peso', '≈ 450 g'],
      ['Compatible con', 'AK-12'],
    ],
    como: [
      'El AK-12 sustituyó la culata de los AK clásicos por una que se pliega al lateral y se alarga o acorta, algo que los AK anteriores no tenían. Eso la acerca a los fusiles modernos de estilo occidental. El apoyo de mejilla opcional ayuda a alinear el ojo con una óptica montada alta.',
    ],
    pros: ['Regulable en longitud', 'Plegable al lateral', 'Admite apoyo de mejilla'],
    contras: ['Más compleja y pesada que una culata fija'],
    ejemplos: 'AK-12.',
    airsoft: 'Las AEG del AK-12 copian su silueta. Conviene mirar si la tuya permite ajustar la longitud, porque algunas la llevan fija.',
    fuente: 'Wikipedia (AK-12)' },

  { id: 'culata-scar', nombre: 'Culata plegable SCAR', grupo: 'Culatas', partes: ['stock_scar'],
    resumen: 'Culata plegable y regulable del FN SCAR: acorta el arma unos 25 cm al plegarla.',
    clave: [['SCAR-L', '635–889 mm'], ['SCAR-H', '711–965 mm'], ['Peso', '≈ 450 g']],
    datos: [
      ['Plegado', 'Hacia el lateral'],
      ['Longitud total del SCAR-L', '889 mm desplegada · 635 mm plegada'],
      ['Longitud total del SCAR-H', '965 mm desplegada · 711 mm plegada'],
      ['Ajuste', 'Regulable en longitud, con apoyo de mejilla ajustable'],
      ['Peso', '≈ 450 g'],
      ['Variantes de precisión', 'SCAR-PR con culata plegable · SCAR-TPR con culata fija regulable'],
    ],
    como: [
      'La culata del SCAR se pliega al lateral y se regula en longitud: plegada, el SCAR-L pasa de unos 89 cm a unos 64 cm. Su apoyo de mejilla ajustable facilita apuntar con óptica y con equipo de protección.',
    ],
    pros: ['Se pliega y se regula en longitud', 'Mejilla ajustable para la óptica'],
    contras: ['Pesada (≈ 450 g)', 'Más piezas móviles que una culata fija'],
    ejemplos: 'FN SCAR-L, SCAR-H, SCAR-PR y SCAR-TPR.',
    airsoft: 'Las SCAR de airsoft copian la culata plegable y regulable, una de las partes más reconocibles de la réplica.',
    fuente: 'Wikipedia (FN SCAR)' },

  { id: 'culata-g36', nombre: 'Culata esqueleto G36', grupo: 'Culatas', partes: ['stock_g36'],
    resumen: 'Culata abierta de poliamida del G36: se pliega para acortar el arma y lleva huecos para guardar los pasadores.',
    clave: [['Plegado', 'Sí'], ['Material', 'Poliamida con fibra de carbono'], ['Peso', '≈ 380 g']],
    datos: [
      ['Material', 'Poliamida reforzada con fibra de carbono'],
      ['Plegado', 'Se pliega para acortar el arma'],
      ['Ajuste', 'La estándar no es regulable; la del G36KA4 (fuerzas especiales) sí'],
      ['Almacenamiento', 'Huecos para guardar los pasadores de montaje durante la limpieza'],
      ['Forma', 'Abierta (esqueleto)'],
      ['Peso', '≈ 380 g'],
    ],
    como: [
      'La culata del G36 es de poliamida reforzada con fibra de carbono, un material ligero que no se oxida. Es plegable, lo que acorta el arma para guardarla o usarla en espacios cerrados. No es regulable, salvo en el G36KA4, pero aprovecha su forma abierta para guardar piezas pequeñas.',
    ],
    pros: ['Ligera y resistente a la corrosión', 'Plegable', 'Guarda los pasadores de montaje'],
    contras: ['Longitud fija en la versión estándar'],
    ejemplos: 'G36, G36KA4 (culata regulable).',
    airsoft: 'Las réplicas del G36 reproducen la forma de esqueleto; no todas son plegables.',
    fuente: 'Wikipedia (Heckler & Koch G36)' },

  { id: 'culata-bren2', nombre: 'Culata plegable BREN 2', grupo: 'Culatas', partes: ['stock_bren'],
    resumen: 'Culata plegable al lateral del CZ BREN 2, regulable en longitud y desmontable para ganar compacidad.',
    clave: [['Plegado', 'Lateral'], ['Longitud (A2)', '582–847 mm'], ['Peso', '≈ 400 g']],
    datos: [
      ['Plegado', 'Hacia el lateral'],
      ['Ajuste', 'Regulable en longitud en los modelos posteriores'],
      ['Desmontable', 'Puede quitarse por completo para ganar compacidad'],
      ['Longitud total (A2)', '792–847 mm desplegada · 582 mm plegada'],
      ['Peso', '≈ 400 g'],
      ['Evolución', 'El BREN 3 lleva una culata telescópica de 4 posiciones, derivada de la del BREN 2'],
    ],
    como: [
      'La culata del BREN 2 se pliega al lateral y se ajusta en longitud. Puede quitarse por completo, lo que deja el arma todavía más compacta, y su diseño se ha mantenido y ampliado en el BREN 3.',
    ],
    pros: ['Plegable y regulable en longitud', 'Desmontable'],
    contras: ['Más compleja y pesada que una fija'],
    ejemplos: 'CZ BREN 2, CZ BREN 3.',
    airsoft: 'Las réplicas del BREN 2 copian la culata plegable.',
    fuente: 'Wikipedia (CZ BREN 2)' },

  { id: 'culata-mcx', nombre: 'Culata plegable MCX', grupo: 'Culatas', partes: ['stock_mcx'],
    resumen: 'Culata de dos varillas del SIG MCX que se pliega y se acorta, con cinco posiciones en la versión Virtus.',
    clave: [['Posiciones', '5 (Virtus)'], ['Plegado', 'Sí'], ['Peso', '≈ 300 g']],
    datos: [
      ['Plegado', 'Se pliega y se colapsa'],
      ['Ajuste', '5 posiciones en la MCX Virtus Patrol (2.ª generación)'],
      ['Configuraciones', 'SIG ofrece cuatro configuraciones de culata para la carabina MCX'],
      ['Peso', '≈ 300 g'],
      ['Compatible con', 'SIG MCX'],
    ],
    como: [
      'La culata de la MCX combina el plegado con el ajuste de longitud, algo útil en una carabina pensada para espacios cerrados y vehículos. La tercera generación (SPEAR LT) pasó a una culata acolchada de plegado lateral.',
    ],
    pros: ['Plegable y regulable en longitud', 'Ligera'],
    contras: ['Dos varillas: menos apoyo en el hombro que una culata sólida'],
    ejemplos: 'SIG MCX Virtus Patrol, SPEAR LT.',
    airsoft: 'Las réplicas de la MCX copian su culata plegable.',
    fuente: 'Wikipedia (SIG MCX)' },
];

/** Fichas con su foto (accesorios-fotos.ts), si la tienen. */
export const ACCESORIOS: Accesorio[] = FICHAS.map(a => ({ ...a, foto: FOTOS[a.id] }));

/* ── Búsqueda e índices ── */
export const accById = (id: string) => ACCESORIOS.find(a => a.id === id);
/** Ficha de accesorio que cubre una pieza del constructor (por id de pieza). */
export const accDePieza = (parte: string) => ACCESORIOS.find(a => a.partes.includes(parte));
/** Id de pieza → id de ficha: lo usa el constructor para enlazar a la ficha técnica sin importar toda la lista. */
export const ACC_POR_PIEZA: Record<string, string> = Object.fromEntries(ACCESORIOS.flatMap(a => a.partes.map(p => [p, a.id])));
export const accDelGrupo = (g: GrupoAcc) => ACCESORIOS.filter(a => a.grupo === g);
