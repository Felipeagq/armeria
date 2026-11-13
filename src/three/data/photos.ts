// Fotos de cada modelo para la ficha técnica. Todas se alojan en public/photos/ (la CSP solo admite imágenes del propio dominio)
// y proceden de Wikimedia Commons con licencia libre: la atribución es obligatoria y se muestra bajo la foto.
//
// Para añadir o cambiar una foto: copia el archivo a public/photos/ y añade una entrada con la clave del MODELO
// (p. ej. 'hk416'), o de una VARIANTE concreta ('hk416_a7') si quieres una foto distinta para ella.
//  - kind: 'real' = foto del arma real · 'airsoft' = foto de la réplica de airsoft.
//  - Sin entrada, la ficha simplemente no muestra foto (hoy: MK18, L119A2, MCX Virtus y G36 no tienen foto libre).
import { PLATFORMS } from '../registry';

export interface Photo {
  file: string;
  kind: 'real' | 'airsoft';
  author: string;
  license: string;
  licenseUrl?: string;
  /** Página de origen (Wikimedia Commons). */
  source: string;
}

export const PHOTOS: Record<string, Photo> = {
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
    file: 'sig516.jpg', kind: 'real', author: "Rizuan",
    license: "CC BY-SA 3.0", licenseUrl: "https://creativecommons.org/licenses/by-sa/3.0",
    source: "https://commons.wikimedia.org/wiki/File:SIG_SG_516_14.5%E2%80%B3.jpg",
  },
  ak74m: {
    file: 'ak74m.jpg', kind: 'airsoft', author: "Алексей Трефилов",
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
export const photoFor = (platformId: string): Photo | undefined => PHOTOS[platformId] ?? PHOTOS[PLATFORMS[platformId]?.model ?? ''];
export const photoUrl = (p: Photo) => `${BASE_PATH}/photos/${p.file}`;
