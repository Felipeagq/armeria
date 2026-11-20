// Iconos SVG en línea (sin dependencias).
type P = { className?: string };
const s = { 'aria-hidden': true, focusable: false, fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const };
export const IconUndo = (p: P) => <svg viewBox="0 0 24 24" {...s} {...p}><path d="M9 14 4 9l5-5" /><path d="M4 9h10.5a5.5 5.5 0 0 1 0 11H11" /></svg>;
export const IconRedo = (p: P) => <svg viewBox="0 0 24 24" {...s} {...p}><path d="m15 14 5-5-5-5" /><path d="M20 9H9.5a5.5 5.5 0 0 0 0 11H13" /></svg>;
export const IconReset = (p: P) => <svg viewBox="0 0 24 24" {...s} {...p}><path d="M3 12a9 9 0 1 0 3-6.7L3 8" /><path d="M3 3v5h5" /></svg>;
export const IconDownload = (p: P) => <svg viewBox="0 0 24 24" {...s} strokeWidth={2.2} {...p}><path d="M12 3v12" /><path d="m7 10 5 5 5-5" /><path d="M5 21h14" /></svg>;
export const IconClose = (p: P) => <svg viewBox="0 0 24 24" {...s} {...p}><path d="M6 6l12 12M18 6 6 18" /></svg>;
export const IconSearch = (p: P) => <svg viewBox="0 0 24 24" {...s} {...p}><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></svg>;
export const IconPlus = (p: P) => <svg viewBox="0 0 24 24" {...s} {...p}><path d="M12 5v14M5 12h14" /></svg>;
export const IconCheck = (p: P) => <svg viewBox="0 0 24 24" {...s} strokeWidth={2.4} {...p}><path d="m5 12.5 4.5 4.5L19 7.5" /></svg>;
export const IconChevron = (p: P) => <svg viewBox="0 0 24 24" {...s} {...p}><path d="m6 9 6 6 6-6" /></svg>;
export const IconCube = (p: P) => <svg viewBox="0 0 24 24" {...s} {...p}><path d="M21 8 12 3 3 8v8l9 5 9-5z" /><path d="m3 8 9 5 9-5M12 13v8" /></svg>;
export const IconGun = (p: P) => <svg viewBox="0 0 24 24" aria-hidden focusable={false} fill="none" stroke="currentColor" strokeWidth={1.6} opacity={.6} width={26} height={26} {...p}><path d="M3 9h15l2-2h1v4h-4l-2 2h-3l-1 6H7l1-6H3z" /></svg>;
/* Iconos de navegación y de interfaz: trazo de 1,75 y rejilla de 24 px, para que todos pesen igual. */
const n = { ...s, strokeWidth: 1.75 };
export const IconArmas = (p: P) => <svg viewBox="0 0 24 24" {...n} {...p}><path d="M2.5 10h11.5l1.6-2H21v3.6h-3.4l-1.4 2.2H14L12.8 19H9.2l1.2-5.2H2.5z" /><path d="M6 10V8" /></svg>;
export const IconComparar = (p: P) => <svg viewBox="0 0 24 24" {...n} {...p}><rect x="3.5" y="4.5" width="7" height="15" rx="1" /><rect x="13.5" y="4.5" width="7" height="15" rx="1" /><path d="M6 9h2M16 9h2M6 13h2M16 13h2" /></svg>;
export const IconAccesorios = (p: P) => <svg viewBox="0 0 24 24" {...n} {...p}><rect x="2.5" y="8" width="19" height="6" rx="1.5" /><path d="M7 8v6M17 8v6M12 14v4M9.5 18h5" /></svg>;
export const IconBalas = (p: P) => <svg viewBox="0 0 24 24" {...n} {...p}><path d="M12 2.8c2.4 1.8 3.7 4.1 3.7 6.9V20.2H8.3V9.7c0-2.8 1.3-5.1 3.7-6.9z" /><path d="M8.3 12.6h7.4M8.3 20.2h7.4" /></svg>;
export const IconGlosario = (p: P) => <svg viewBox="0 0 24 24" {...n} {...p}><path d="M5 4.5h10.5A3.5 3.5 0 0 1 19 8v12H8.5A3.5 3.5 0 0 1 5 16.5z" /><path d="M5 16.5A3.5 3.5 0 0 1 8.5 13H19M9 8h6" /></svg>;
export const IconArrowUp = (p: P) => <svg viewBox="0 0 24 24" {...n} {...p}><path d="M12 19V5M6 11l6-6 6 6" /></svg>;
export const IconArrowDown = (p: P) => <svg viewBox="0 0 24 24" {...n} {...p}><path d="M12 5v14M6 13l6 6 6-6" /></svg>;
export const IconExternal = (p: P) => <svg viewBox="0 0 24 24" {...n} {...p}><path d="M14 4h6v6M20 4l-9 9M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5" /></svg>;
export const Logo = () => (
  <svg viewBox="0 0 32 32" fill="none" aria-hidden>
    <circle cx="16" cy="16" r="8.5" stroke="currentColor" strokeWidth="1.6" />
    <path d="M16 2.5v7M16 22.5v7M2.5 16h7M22.5 16h7" stroke="currentColor" strokeWidth="1.6" strokeLinecap="square" />
    <circle cx="16" cy="16" r="2.2" fill="#ff6a13" />
  </svg>
);
