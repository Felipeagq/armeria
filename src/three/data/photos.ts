// Fotos de cada modelo para la ficha técnica. Todas se alojan en public/photos/ (la CSP solo admite imágenes del propio dominio)
// y proceden de Wikimedia Commons con licencia libre: la atribución es obligatoria y se muestra bajo la foto.
//
// Para añadir o cambiar una foto: copia el archivo a public/photos/ y añade una entrada con la clave del MODELO
// (p. ej. 'hk416'), o de una VARIANTE concreta ('hk416_a7') si quieres una foto distinta para ella.
//  - kind: 'real' = foto del arma real · 'airsoft' = foto de la réplica de airsoft.
//  - Sin entrada, la ficha simplemente no muestra foto. `source`/`license` son opcionales: una foto propia o de uso personal (p. ej. l119) no se enlaza.

export interface Photo {
  file: string;
  kind: 'real' | 'airsoft';
  author?: string;
  license?: string;
  licenseUrl?: string;
  /** Página de origen (Wikimedia Commons). Sin ella, la foto es propia o de uso personal y no se enlaza. */
  source?: string;
  /** 'scene' = foto con escenario real (se rellena el marco con una copia difuminada). Por omisión es un recorte o fondo liso: se funde con el marco gris. */
  fit?: 'scene';
}

export const PHOTOS: Record<string, Photo> = {
  m9a1: { file: 'm9a1.webp', kind: 'real', author: 'Imagen de producto (Beretta)' },
  pitviper: { file: 'pitviper.jpg', kind: 'real', author: 'Imagen de producto (TTI)' },
  l119: { file: 'l119.png', kind: 'airsoft', author: 'Imagen de catálogo (réplica L119A2)' },
  mk18: { file: 'mk18.jpg', fit: 'scene', kind: 'real', author: "Riot1013", license: "CC BY-SA 4.0", licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0", source: "https://commons.wikimedia.org/wiki/File:MK18.jpg" },
  mcx: { file: 'mcx.jpg', fit: 'scene', kind: 'real', author: 'Mike Searson', license: 'CC BY-SA 4.0', licenseUrl: 'https://creativecommons.org/licenses/by-sa/4.0', source: 'https://commons.wikimedia.org/wiki/File:SIG-MCX-Rifle.jpeg' },
  g36: { file: 'g36.png', kind: 'real', author: 'DomoK / Auge=mit', license: 'CC BY-SA 4.0', licenseUrl: 'https://creativecommons.org/licenses/by-sa/4.0', source: 'https://commons.wikimedia.org/wiki/File:Gewehr_G36_noBG.png' },
  glock17: {
    file: 'glock17.jpg', kind: 'real', author: 'U.S. ATF',
    license: 'Dominio público',
    source: 'https://commons.wikimedia.org/wiki/File:Glock_17_(transparent_background).jpg',
  },
  m4: {
    file: 'm4.png', kind: 'real', author: "PEO Soldier / MathKnight",
    license: "Dominio público",
    source: "https://commons.wikimedia.org/wiki/File:M4A1-flattop.png",
  },
  hk416: {
    file: 'hk416.png', kind: 'real', author: "Dybdal",
    license: "CC BY-SA 2.0", licenseUrl: "https://creativecommons.org/licenses/by-sa/2.0",
    source: "https://commons.wikimedia.org/wiki/File:HK416N.png",
  },
  sig516: {
    file: 'sig516.jpg', fit: 'scene', kind: 'real', author: "Rizuan",
    license: "CC BY-SA 3.0", licenseUrl: "https://creativecommons.org/licenses/by-sa/3.0",
    source: "https://commons.wikimedia.org/wiki/File:SIG_SG_516_14.5%E2%80%B3.jpg",
  },
  ak74m: {
    file: 'ak74m.jpg', fit: 'scene', kind: 'airsoft', author: "Алексей Трефилов",
    license: "CC BY-SA 4.0", licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0",
    source: "https://commons.wikimedia.org/wiki/File:AK-74M_airsoft_01.jpg",
  },
  ak12: {
    file: 'ak12.jpg', kind: 'real', author: "Vitaly V. Kuzmin",
    license: "CC BY-SA 4.0", licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0",
    source: "https://commons.wikimedia.org/wiki/File:5,45mm_AK-12_6P70_assault_rifle_at_Military-technical_forum_ARMY-2016_03_noBG.jpg",
  },
  ace: {
    file: 'ace.jpg', kind: 'real', author: "IWI – Israel Weapon Industries",
    license: "CC BY 4.0", licenseUrl: "https://creativecommons.org/licenses/by/4.0",
    source: "https://commons.wikimedia.org/wiki/File:Ace_52_side_2.jpg",
  },
  scar: {
    file: 'scar.png', kind: 'real', author: "Mitch Barrie",
    license: "CC BY-SA 4.0", licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0",
    source: "https://commons.wikimedia.org/wiki/File:FN_SCAR-L_noBG.png",
  },
  bren2: {
    file: 'bren2.jpg', kind: 'real', author: "Land68",
    license: "CC0", licenseUrl: "https://creativecommons.org/publicdomain/zero/1.0/deed.en",
    source: "https://commons.wikimedia.org/wiki/File:CZ_BREN_2_5,56x45_left.jpg",
  },
};

const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? '';
/** Foto de una plataforma: la de su variante si existe; si no, la de su modelo. */
export const photoFor = (platformId: string, modelId?: string): Photo | undefined => PHOTOS[platformId] ?? (modelId ? PHOTOS[modelId] : undefined);
export const photoUrl = (p: Photo) => `${BASE_PATH}/photos/${p.file}`;
