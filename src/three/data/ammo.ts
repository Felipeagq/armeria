// Enciclopedia de munición: los cartuchos que aparecen en las fichas de las armas, más la bola de 6 mm de airsoft.
// Valores de referencia de la carga militar/estándar (varían según fabricante, lote y longitud de cañón). «≈» = aproximado.
// Las energías se calculan con E = ½·m·v² a partir de la masa y la velocidad indicadas.
// Las fotos están en public/ammo/ y proceden de Wikimedia Commons (licencia libre: la atribución es obligatoria).
import { ARMAS } from './armas';

export interface AmmoPhoto {
  file: string;
  alt: string;
  /** Qué muestra la foto (se enseña bajo la imagen). */
  caption: string;
  author: string;
  license: string;
  licenseUrl?: string;
  source: string;
}

export interface Cartridge {
  id: string;
  name: string;
  /** Nombre corto para enlaces y teselas. */
  short: string;
  kind: 'real' | 'airsoft';
  tagline: string;
  /** Se enlaza desde el campo «Calibre» de las armas cuyo texto cumpla esta expresión. */
  match?: RegExp;
  facts: [label: string, value: string][];
  about: string[];
  /** Datos que se destacan arriba en teselas. */
  key: [label: string, value: string][];
  photo: AmmoPhoto;
  fuente: string;
}

export const AMMO: Cartridge[] = [
  {
    id: '556', name: '5,56×45 mm NATO', short: '5,56×45', kind: 'real', match: /5,56/,
    tagline: 'El cartucho de fusil estándar de la OTAN desde 1980.',
    key: [['Proyectil', '4,0 g · 5,70 mm'], ['Velocidad', '≈ 940 m/s'], ['Energía', '≈ 1.770 J']],
    facts: [
      ['Designación', '5,56×45 mm NATO (carga SS109 / M855) · versión civil afín: .223 Remington'],
      ['Origen', 'EE. UU. (.223 Remington, años 50–60) · Bélgica (SS109, adoptado por la OTAN en 1980)'],
      ['Diámetro del proyectil', '5,70 mm'],
      ['Longitud de la vaina', '44,7 mm'],
      ['Longitud total', '57,4 mm'],
      ['Proyectil típico', '4,0 g (62 gr), FMJ con punta de acero (M855)'],
      ['Velocidad inicial', '≈ 940 m/s (cañón de 508 mm); menor con cañones cortos'],
      ['Energía en boca', '≈ 1.770 J'],
    ],
    about: [
      'Es un cartucho pequeño y rápido: un proyectil ligero a gran velocidad, con poco retroceso y munición ligera de transportar. Por eso se impuso como estándar de la OTAN y equipa a buena parte de las carabinas modernas.',
      '.223 Remington y 5,56×45 NATO son muy parecidos, pero no idénticos: la cámara del arma militar admite mayor presión. Disparar munición militar en un arma con cámara .223 puede ser peligroso.',
    ],
    photo: {
      file: '556.jpg', alt: 'Un cartucho 5,56×45 mm sostenido en la mano', caption: 'Cartucho 5,56×45 mm',
      author: 'Kunalbiswas', license: 'CC BY-SA 3.0', licenseUrl: 'https://creativecommons.org/licenses/by-sa/3.0',
      source: 'https://commons.wikimedia.org/wiki/File:16j.JPG',
    },
    fuente: 'Wikipedia (5.56×45mm NATO)',
  },
  {
    id: '545', name: '5,45×39 mm', short: '5,45×39', kind: 'real', match: /5,45/,
    tagline: 'El cartucho soviético del AK-74.',
    key: [['Proyectil', '3,43 g · ≈ 5,6 mm'], ['Velocidad', '≈ 900 m/s'], ['Energía', '≈ 1.390 J']],
    facts: [
      ['Designación', '5,45×39 mm (carga 7N6; también 7N10, 7N22…)'],
      ['Origen', 'URSS · 1974, con el fusil AK-74'],
      ['Diámetro del proyectil', '≈ 5,6 mm'],
      ['Longitud de la vaina', '≈ 39 mm'],
      ['Longitud total', '≈ 57 mm'],
      ['Proyectil típico', '3,43 g (53 gr), FMJ con núcleo de acero (7N6)'],
      ['Velocidad inicial', '≈ 900 m/s (AK-74)'],
      ['Energía en boca', '≈ 1.390 J'],
    ],
    about: [
      'Nació para sustituir al 7,62×39 con menos retroceso y una trayectoria más tensa, al estilo del 5,56 occidental. El proyectil de la carga 7N6 lleva un núcleo de acero y un pequeño hueco de aire en la punta.',
      'La foto muestra una vitrina con distintas cargas de 5,45 mm (rastreante, perforante, subsónica…); los rótulos están en ruso.',
    ],
    photo: {
      file: '545.jpg', alt: 'Vitrina con distintas cargas de cartuchos 5,45×39 mm', caption: 'Distintas cargas 5,45×39 mm (rótulos en ruso)',
      author: 'Vitaly V. Kuzmin', license: 'CC BY-SA 4.0', licenseUrl: 'https://creativecommons.org/licenses/by-sa/4.0',
      source: 'https://commons.wikimedia.org/wiki/File:5,45-%D0%BC%D0%BC_%D0%B0%D0%B2%D1%82%D0%BE%D0%BC%D0%B0%D1%82%D0%BD%D1%8B%D0%B5_%D0%BF%D0%B0%D1%82%D1%80%D0%BE%D0%BD%D1%8B_-_%D0%A6%D0%9D%D0%98%D0%98%D0%A2%D0%9E%D0%A7%D0%9C%D0%90%D0%A8_01.jpg',
    },
    fuente: 'Wikipedia (5.45×39mm)',
  },
  {
    id: '762x39', name: '7,62×39 mm', short: '7,62×39', kind: 'real', match: /7,62×39/,
    tagline: 'El cartucho clásico del AK-47 y del SKS.',
    key: [['Proyectil', '7,9 g · 7,92 mm'], ['Velocidad', '≈ 715 m/s'], ['Energía', '≈ 2.020 J']],
    facts: [
      ['Designación', '7,62×39 mm (modelo 1943, «M43»)'],
      ['Origen', 'URSS · 1943'],
      ['Diámetro del proyectil', '7,92 mm'],
      ['Longitud de la vaina', '38,7 mm'],
      ['Longitud total', '56,0 mm'],
      ['Proyectil típico', '7,9 g (122 gr), FMJ'],
      ['Velocidad inicial', '≈ 715 m/s (AK-47)'],
      ['Energía en boca', '≈ 2.020 J'],
    ],
    about: [
      'Cartucho intermedio entre el de pistola y el de fusil de batalla. Su proyectil es más pesado y lento que el de un 5,56 y entrega algo más de energía (≈ 2.020 J frente a ≈ 1.770 J). Su vaina cónica y pronunciada facilita la alimentación del arma.',
      'Es uno de los cartuchos militares más fabricados de la historia. En el catálogo aparece como alternativa de calibre del BREN 2.',
    ],
    photo: {
      file: '762x39.jpg', alt: 'Cartucho 7,62×39 mm junto a una regla', caption: 'Cartucho 7,62×39 mm (con regla para la escala)',
      author: 'Malis', license: 'Dominio público', source: 'https://commons.wikimedia.org/wiki/File:7.62x39_-_FMJ_-_1.jpg',
    },
    fuente: 'Wikipedia (7.62×39mm)',
  },
  {
    id: '762x51', name: '7,62×51 mm NATO', short: '7,62×51', kind: 'real', match: /7,62×51/,
    tagline: 'El cartucho de fusil de batalla de la OTAN.',
    key: [['Proyectil', '9,5 g · 7,82 mm'], ['Velocidad', '≈ 835 m/s'], ['Energía', '≈ 3.300 J']],
    facts: [
      ['Designación', '7,62×51 mm NATO (carga M80) · versión civil afín: .308 Winchester'],
      ['Origen', 'EE. UU. / OTAN · años 50'],
      ['Diámetro del proyectil', '7,82 mm'],
      ['Longitud de la vaina', '51 mm'],
      ['Longitud total', '≈ 69,9 mm'],
      ['Proyectil típico', '9,5 g (147 gr), FMJ (M80)'],
      ['Velocidad inicial', '≈ 835 m/s (cañón de ≈ 560 mm)'],
      ['Energía en boca', '≈ 3.300 J'],
    ],
    about: [
      'Un cartucho de «fusil de batalla»: casi el doble de energía que un 5,56 y mucho más alcance, a costa de más retroceso, más peso y menos munición por cargador.',
      'La foto lo compara con el 5,56×45 (centro) y con una pila AA para dar idea de tamaño.',
    ],
    photo: {
      file: '762x51.jpg', alt: 'Cartuchos 7,62×51 y 5,56×45 comparados con una pila AA', caption: '7,62×51 (izq.) y 5,56×45 (centro) junto a una pila AA',
      author: 'Cannibalicious! (Wikipedia en inglés)', license: 'Dominio público',
      source: 'https://commons.wikimedia.org/wiki/File:7.62x51_and_5.56x45_bullet_cartridges_compared_to_AA_battery.jpg',
    },
    fuente: 'Wikipedia (7.62×51mm NATO)',
  },
  {
    id: '300blk', name: '.300 AAC Blackout', short: '.300 BLK', kind: 'real', match: /\.300 BLK/,
    tagline: 'Calibre 7,62 en la caja de un AR-15, pensado para silenciadores.',
    key: [['Proyectil', '8,1 g · 7,82 mm'], ['Velocidad', '≈ 690 m/s'], ['Energía', '≈ 1.900 J']],
    facts: [
      ['Designación', '.300 AAC Blackout (7,62×35 mm)'],
      ['Origen', 'EE. UU. · 2011 (Advanced Armament Corp.)'],
      ['Diámetro del proyectil', '7,82 mm (.308 in)'],
      ['Longitud de la vaina', '34,7 mm'],
      ['Longitud total', '57,4 mm (igual que el 5,56 NATO)'],
      ['Carga supersónica', '≈ 8,1 g (125 gr) a ≈ 690 m/s → ≈ 1.900 J'],
      ['Carga subsónica', '≈ 14,3 g (220 gr) a ≈ 310 m/s → ≈ 690 J'],
    ],
    about: [
      'Se diseñó para que un AR-15 dispare un proyectil de 7,62 mm cambiando solo el cañón: la longitud total es la del 5,56, así que entra en los mismos cargadores STANAG.',
      'Con la carga subsónica, el proyectil pesado no rompe la barrera del sonido, y con un silenciador el arma resulta mucho más discreta. Con la supersónica ofrece una energía parecida a la del 7,62×39.',
    ],
    photo: {
      file: '300blk.jpg', alt: 'Cartucho .300 AAC Blackout con proyectil subsónico de 220 granos', caption: 'Cartucho .300 AAC Blackout (proyectil subsónico de 220 gr)',
      author: 'Silencertalk', license: 'CC BY 3.0', licenseUrl: 'https://creativecommons.org/licenses/by/3.0',
      source: 'https://commons.wikimedia.org/wiki/File:300_AAC_Blackout_horizontal.jpg',
    },
    fuente: 'Wikipedia (.300 AAC Blackout)',
  },
  {
    id: '9x19', name: '9×19 mm Parabellum', short: '9×19', kind: 'real', match: /9\s?×\s?19/,
    tagline: 'El cartucho de pistola más extendido del mundo.',
    key: [['Proyectil', '8,0 g · 9,01 mm'], ['Velocidad', '≈ 375 m/s'], ['Energía', '≈ 560 J']],
    facts: [
      ['Designación', '9×19 mm Parabellum (también 9 mm Luger y 9×19 mm NATO)'],
      ['Origen', 'Alemania · 1901 (Georg Luger, DWM), para la pistola Luger P08'],
      ['Diámetro del proyectil', '9,01 mm (.355 in)'],
      ['Longitud de la vaina', '19,15 mm'],
      ['Longitud total', '29,7 mm'],
      ['Proyectil típico', '8,0 g (124 gr), FMJ de punta redondeada'],
      ['Velocidad inicial', '≈ 375 m/s en pistola; algo más en subfusil'],
      ['Energía en boca', '≈ 560 J'],
      ['Presión máxima', '≈ 235 MPa (CIP) · 241 MPa (SAAMI); las cargas +P llegan a ≈ 265 MPa'],
    ],
    about: [
      'Nació en 1901 como cartucho militar de pistola y se impuso como estándar de la OTAN para pistolas y subfusiles. En 1985 el ejército de EE. UU. lo adoptó con la Beretta M9 en lugar del .45 ACP. Hoy lo montan pistolas como la Glock 17, la Beretta M9A1 o la TTI Pit Viper, y subfusiles como el MP5 y el Uzi.',
      'Su vaina es ligeramente cónica, y por eso los cargadores de 30 cartuchos de los subfusiles son curvos. Con ≈ 375 m/s es supersónico por poco (el sonido viaja a ≈ 343 m/s); existen cargas subsónicas de 147 gr (≈ 9,5 g) a ≈ 300 m/s para usar con supresor.',
      'La foto lo muestra sobre papel milimetrado para dar la escala. En airsoft, las réplicas de estas pistolas disparan bolas de 6 mm: el cartucho solo existe en el arma real.',
    ],
    photo: {
      file: '9x19.jpg', alt: 'Cartucho 9×19 mm Parabellum sobre papel milimetrado', caption: 'Cartucho 9×19 mm Parabellum (sobre papel milimetrado)',
      author: 'Grasyl', license: 'CC BY-SA 4.0', licenseUrl: 'https://creativecommons.org/licenses/by-sa/4.0',
      source: 'https://commons.wikimedia.org/wiki/File:Cartridge_9x19mm_Parabellum_CC_BY-SA_4.0_by_Grasyl.jpg',
    },
    fuente: 'Wikipedia (9×19mm Parabellum); límites de presión CIP y SAAMI',
  },
  {
    id: '45acp', name: '.45 ACP', short: '.45 ACP', kind: 'real', match: /\.45\s?(ACP|Auto)|11[,.]43/i,
    tagline: 'El cartucho de pistola grueso y lento de la Colt M1911.',
    key: [['Proyectil', '14,9 g · 11,5 mm'], ['Velocidad', '≈ 253 m/s'], ['Energía', '≈ 480 J']],
    facts: [
      ['Designación', '.45 ACP (Automatic Colt Pistol), también .45 Auto · 11,43×23 mm'],
      ['Origen', 'EE. UU. · 1905–1911 (John Browning, para Colt y la pistola M1911)'],
      ['Diámetro del proyectil', '11,5 mm (.452 in)'],
      ['Longitud de la vaina', '22,8 mm'],
      ['Longitud total', '32,4 mm'],
      ['Proyectil típico', '14,9 g (230 gr), FMJ de punta redondeada'],
      ['Velocidad inicial', '≈ 253 m/s (830 fps) con cañón de 127 mm'],
      ['Energía en boca', '≈ 480 J'],
      ['Presión máxima', '≈ 130 MPa (CIP) · 145 MPa (SAAMI); las cargas +P llegan a ≈ 158 MPa'],
    ],
    about: [
      'Browning lo diseñó cuando las pruebas de Thompson y LaGarde (1904) concluyeron que el ejército de EE. UU. necesitaba un proyectil de al menos .45 pulgadas (≈ 11,4 mm). Fue el cartucho reglamentario de EE. UU. de 1911 a 1985, con la M1911, y sigue siendo muy popular entre tiradores deportivos y civiles.',
      'Es un cartucho de baja presión (≈ 145 MPa, frente a ≈ 241 MPa del 9×19) con un proyectil pesado y lento. Con 14,9 g a ≈ 253 m/s es subsónico, de modo que no genera chasquido supersónico y encaja bien con supresores. A cambio, ocupa más espacio: una 1911 clásica lleva 7 u 8 cartuchos, y las de doble hilera, entre 10 y 14.',
      'La foto lo muestra sobre papel milimetrado para dar la escala. Las réplicas de airsoft de la M1911 y de otras pistolas en .45 son muy populares, pero disparan bolas de 6 mm.',
    ],
    photo: {
      file: '45acp.jpg', alt: 'Cartucho .45 ACP sobre papel milimetrado', caption: 'Cartucho .45 ACP (sobre papel milimetrado)',
      author: 'Grasyl', license: 'CC BY-SA 4.0', licenseUrl: 'https://creativecommons.org/licenses/by-sa/4.0',
      source: 'https://commons.wikimedia.org/wiki/File:Cartridge_.45_ACP_CC_BY-SA_4.0_by_Grasyl.jpg',
    },
    fuente: 'Wikipedia (.45 ACP); límites de presión CIP y SAAMI',
  },
  {
    id: 'bb6', name: 'Bola de 6 mm (airsoft)', short: 'Bola 6 mm', kind: 'airsoft',
    tagline: 'La «bala» de todas las réplicas de airsoft.',
    key: [['Diámetro', '≈ 5,95 mm'], ['Peso', '0,20–0,43 g'], ['Energía', '≈ 0,8–1,5 J']],
    facts: [
      ['Designación', 'Bola de 6 mm (BB)'],
      ['Diámetro', '≈ 5,95 mm'],
      ['Peso', '0,12 a 0,50 g · habituales: 0,20 · 0,25 · 0,28 · 0,30 · 0,36 · 0,43 g'],
      ['Material', 'Plástico (ABS o PLA biodegradable)'],
      ['Velocidad típica', '≈ 90–150 m/s (300–500 fps), según la réplica'],
      ['Energía típica', '≈ 0,8–1,5 J con bola de 0,20 g'],
      ['Alcance', 'Decenas de metros, según réplica, hop-up y peso de la bola'],
    ],
    about: [
      'Es mucho más ligera y lenta que cualquier cartucho real: su energía, ≈ 1 J, es más de mil veces menor que la de un cartucho de fusil (≈ 1.800 J). Las réplicas eléctricas (AEG) la impulsan con aire comprimido: un motor mueve un pistón dentro del mecanismo llamado gearbox.',
      'El sistema hop-up imprime a la bola un giro hacia atrás: la sustentación alarga la trayectoria. A igual energía, las bolas más pesadas salen más lentas pero aguantan mejor el viento y ganan precisión.',
      'Los campos de juego suelen limitar la energía a ≈ 1–1,5 J, y la normativa varía según el país. Usa siempre protección ocular homologada.',
    ],
    photo: {
      file: 'bb6.jpg', alt: 'Cargador transparente de una réplica de airsoft G36C cargado con bolas de 6 mm', caption: 'Cargador de una réplica de airsoft G36C cargado con bolas de 6 mm',
      author: 'BrokenSphere', license: 'CC BY-SA 3.0', licenseUrl: 'https://creativecommons.org/licenses/by-sa/3.0',
      source: 'https://commons.wikimedia.org/wiki/File:Airsoft_G36C_magazine.JPG',
    },
    fuente: 'Fabricantes y reglamentos de campo habituales; energía calculada como ½·m·v²',
  },
];

export const ammoById = (id: string) => AMMO.find(c => c.id === id);

/** Cartuchos que menciona el texto de calibre de un arma (p. ej. «5,56×45 mm NATO · .300 BLK»). */
export const ammoForCalibre = (calibre?: string): Cartridge[] => (calibre ? AMMO.filter(c => c.match?.test(calibre)) : []);

/** 1510 → «1.510», 4,2 → «4,2» (puntos de millar y coma decimal, como el resto de la ficha). */
const esNum = (n: number) => String(n).replace('.', ',').replace(/\B(?=(\d{3})+(?!\d))/g, '.');

/**
 * Energía en boca de un arma: E = ½·m·v² con la masa del proyectil del cartucho y la velocidad inicial
 * propia del arma, que depende de su cañón y no es la del cartucho de referencia. Devuelve null si el
 * arma no publica una velocidad en m/s o el cartucho no indica la masa. Un rango («900–915 m/s») usa su punto medio.
 */
export function energiaEnBoca(velocidad: string | undefined, c: Cartridge | undefined): { valor: string; base: string } | null {
  if (!velocidad || !c) return null;
  const masa = c.key.find(([etiqueta]) => etiqueta === 'Proyectil')?.[1].match(/^(\d+(?:,\d+)?)\s*g\b/);
  const vel = velocidad.match(/(\d+(?:[.,]\d+)?)(?:\s*[–-]\s*(\d+(?:[.,]\d+)?))?\s*m\/s/);
  if (!masa || !vel) return null;

  const kg = parseFloat(masa[1].replace(',', '.')) / 1000;
  const v1 = parseFloat(vel[1].replace(',', '.'));
  const v = vel[2] ? (v1 + parseFloat(vel[2].replace(',', '.'))) / 2 : v1;
  const j = 0.5 * kg * v * v;
  if (!Number.isFinite(j) || j <= 0) return null;

  // Redondeo a la decena, como las energías de las fichas de munición («≈ 1.770 J»).
  const redondeada = j >= 100 ? Math.round(j / 10) * 10 : j >= 10 ? Math.round(j) : Math.round(j * 10) / 10;
  return { valor: `≈ ${esNum(redondeada)} J`, base: `${masa[1]} g a ${vel[0].trim()}` };
}

/** Armas del catálogo cuyo calibre menciona este cartucho (las réplicas de airsoft usan todas la bola de 6 mm). */
export const modelsUsing = (c: Cartridge) =>
  c.kind === 'airsoft' ? ARMAS : ARMAS.filter(a => c.match?.test(a.common.calibre ?? '') || a.variants.some(v => c.match?.test(v.specs.calibre ?? '')));
