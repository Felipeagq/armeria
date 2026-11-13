import type { Viewer } from './Viewer';

/** Referencia única al visor activo (lo crea <Viewport/>; lo usan exportación y atajos). */
let current: Viewer | null = null;
export const setViewer = (v: Viewer | null) => { current = v; };
export const getViewer = () => current;
