// Nombres técnicos y modelos reales de cada ficha de accesorio (clave: id de la ficha).
// `tecnico`: cómo se llama el accesorio en inglés o en la jerga de tienda; es lo que se busca en un vídeo o en una web de réplicas.
// `modelos`: productos concretos, para reconocer la pieza en una tienda. Referencias de mercado: pueden cambiar o descatalogarse.
// Módulo ligero (sin three ni `window`).

import type { Modelo } from './accesorios';

export interface NombresAcc { tecnico: string[]; modelos: Modelo[] }

export const NOMBRES_ACC: Record<string, NombresAcc> = {
  /* Ópticas */
  'red-dot-abierto': { tecnico: ['Open reflex sight', 'Micro red dot', 'MRDS'], modelos: ['Holosun 507C', 'Holosun 510C', 'Trijicon RMR', 'Leupold DeltaPoint Pro', 'Vortex Crossfire'] },
  'red-dot-tubular': { tecnico: ['Enclosed red dot', 'Tube red dot', 'CCO (Close Combat Optic)'], modelos: [
    ['Olight Osight R', 'Punto de 2 MOA y anillo de 65 MOA · base Micro T-1/T-2 · cerrado'],
    ['Aimpoint CompM4 (M68 CCO)', 'Punto de 2 MOA · pila AA · 265 g sin base'],
    'Aimpoint Micro T-2', 'Aimpoint PRO', 'Holosun AEMS'] },
  'holografico': { tecnico: ['Holographic weapon sight', 'HWS', 'Holo sight'], modelos: ['EOTech 512', 'EOTech 551', 'EOTech 552', 'EOTech EXPS3', 'Vortex Razor AMG UH-1'] },
  'lpvo': { tecnico: ['LPVO (Low Power Variable Optic)', '1–4× scope', 'Variable power scope'], modelos: ['Trijicon AccuPoint 1–4×24', 'Vortex Strike Eagle 1–6×24', 'Elcan SpecterDR 1×/4×'] },
  /* Bocachas */
  'apagallamas': { tecnico: ['Flash hider', 'Flash suppressor', 'Birdcage'], modelos: ['Jaula A2 (M16A2 y M4)', 'Tres puntas (M16 original)', 'SureFire WarComp'] },
  'freno-compensador': { tecnico: ['Muzzle brake', 'Compensator', 'Comp'], modelos: ['Freno de dos cámaras del AK-74', 'SureFire WarComp'] },
  'supresor': { tecnico: ['Suppressor', 'Silencer', 'Sound moderator'], modelos: ['SureFire SOCOM556', 'KAC QDC', 'Gemtech'] },
  'trazadora': { tecnico: ['Tracer unit', 'Tracer muzzle', 'Tracer BB unit'], modelos: ['Acetech Lighter S', 'Acetech Lighter M', 'Acetech Lighter BT'] },
  /* Luces y láseres */
  'linterna': { tecnico: ['Weapon light', 'Tactical light', 'WML (Weapon-Mounted Light)'], modelos: ['SureFire Scout M600', 'SureFire M300', 'Streamlight TLR-1'] },
  'linterna-laser': { tecnico: ['Light/laser combo', 'Weapon light with laser', 'Laser-light module'], modelos: ['SureFire X400', 'Streamlight TLR-2'] },
  'modulo-laser-ir': { tecnico: ['IR laser module', 'Aiming laser', 'IR aiming laser (IR/visible)', 'PEQ'], modelos: ['AN/PEQ-15 ATPIAL', 'Steiner DBAL-A2'] },
  /* Empuñaduras y apoyos */
  'empunadura-vertical': { tecnico: ['Vertical foregrip', 'VFG', 'Foregrip'], modelos: ['Magpul MVG', 'Magpul RVG', 'Tango Down BG-16'] },
  'empunadura-angulada': { tecnico: ['Angled foregrip', 'AFG', 'Angled fore grip'], modelos: ['Magpul AFG', 'Magpul AFG2'] },
  'bipode': { tecnico: ['Bipod'], modelos: ['Harris S-BRM', 'Atlas BT10', 'Magpul Bipod'] },
  'empunadura-ar': { tecnico: ['AR-15 pistol grip', 'Grip'], modelos: ['Colt A2', 'Magpul MOE', 'Magpul MIAD', 'HK Battle Grip V2'] },
  'empunadura-ak': { tecnico: ['AK pistol grip', 'AK grip'], modelos: ['AKM (baquelita)', 'AK-74M (polímero)', 'AK-12'] },
  /* Cargadores */
  'cargador-pistola': { tecnico: ['Pistol magazine', 'Double-stack magazine', 'Extended magazine'], modelos: ['Glock 17 (17 y 33 cartuchos)', 'Beretta M9 (15)', 'Tokyo Marui Hi-Capa (airsoft)'] },
  'stanag-metalico': { tecnico: ['STANAG magazine', 'USGI magazine', 'AR-15 / M16 magazine'], modelos: ['Cargador USGI de aluminio (30)', 'Cargador de acero HK416'] },
  'stanag-polimero': { tecnico: ['Polymer STANAG magazine', 'PMAG', 'Translucent magazine'], modelos: ['Magpul PMAG 30 GEN M3', 'Lancer L5AWM'] },
  'stanag-corto': { tecnico: ['20-round STANAG magazine', 'Short magazine'], modelos: ['Cargador de aluminio de 20 (M16)'] },
  'tambor': { tecnico: ['Drum magazine', 'High-capacity drum', 'C-Mag'], modelos: ['Beta C-Mag (100)'] },
  'cargador-ak545': { tecnico: ['AK-74 magazine', '5.45×39 magazine', 'Plum magazine'], modelos: ['AK-74 «ciruela»', 'AK-74M (polímero)', 'AK-12'] },
  'cargador-scarh': { tecnico: ['SCAR-H magazine', '7.62×51 magazine', '20-round magazine'], modelos: ['Cargador de 20 del FN SCAR-H'] },
  'cargador-galil': { tecnico: ['Galil magazine', '35-round magazine'], modelos: ['Galil 35', 'Galil 50'] },
  'cargador-g36': { tecnico: ['G36 magazine', 'Translucent polymer magazine'], modelos: ['Cargador G36 de 30', 'Beta C-Mag (100)'] },
  'cargador-subfusil': { tecnico: ['SMG magazine', 'Stick magazine', 'Curved magazine'], modelos: ['MP5 (15 y 30)', 'Uzi (25 y 32)'] },
  'cargadores-acoplados': { tecnico: ['Jungle clip', 'Magazine coupler', 'Dual magazine clamp'], modelos: ['Abrazaderas para MP5 y AR-15', 'G36 (de serie)'] },
  /* Culatas */
  'culata-telescopica': { tecnico: ['Collapsible stock', 'Carbine stock', 'M4 stock'], modelos: ['Colt M4', 'Magpul CTR', 'Magpul MOE', 'HK416 estándar'] },
  'culata-fija': { tecnico: ['Fixed stock', 'A2 stock'], modelos: ['Colt M16A2'] },
  'culata-esqueleto': { tecnico: ['Skeleton stock', 'Skeletonized stock'], modelos: [] },
  'culata-pdw': { tecnico: ['PDW stock', 'Compact stock'], modelos: [] },
  'culata-hk': { tecnico: ['HK slim stock', 'HK416A5 stock'], modelos: ['HK416A5', 'HK G28'] },
  'culata-subfusil-plegable': { tecnico: ['Folding stock', 'SMG folding stock'], modelos: ['CZ Scorpion EVO 3', 'MP5K-PDW'] },
  'culata-alambre': { tecnico: ['Wire stock', 'Wire folding stock'], modelos: ['Uzi', 'MP40', 'MAC-10'] },
  'culata-ak74m': { tecnico: ['AK-74M side-folding stock', 'Polymer folding stock'], modelos: ['AK-74M'] },
  'culata-ak12': { tecnico: ['AK-12 adjustable stock', 'Folding adjustable stock'], modelos: ['AK-12'] },
  'culata-scar': { tecnico: ['SCAR folding stock', 'Adjustable folding stock'], modelos: ['FN SCAR-L', 'FN SCAR-H', 'FN SCAR-PR', 'FN SCAR-TPR'] },
  'culata-g36': { tecnico: ['G36 skeleton stock', 'Folding stock'], modelos: ['G36', 'G36KA4'] },
  'culata-bren2': { tecnico: ['BREN 2 folding stock'], modelos: ['CZ BREN 2', 'CZ BREN 3'] },
  'culata-mcx': { tecnico: ['MCX folding stock', 'Virtus folding stock'], modelos: ['SIG MCX Virtus Patrol', 'SIG SPEAR LT'] },
};
