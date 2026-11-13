// Iconos SVG en línea (sin dependencias).
type P = { className?: string };
const s = { fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const };
export const IconUndo = (p: P) => <svg viewBox="0 0 24 24" {...s} {...p}><path d="M9 14 4 9l5-5" /><path d="M4 9h10.5a5.5 5.5 0 0 1 0 11H11" /></svg>;
export const IconRedo = (p: P) => <svg viewBox="0 0 24 24" {...s} {...p}><path d="m15 14 5-5-5-5" /><path d="M20 9H9.5a5.5 5.5 0 0 0 0 11H13" /></svg>;
export const IconReset = (p: P) => <svg viewBox="0 0 24 24" {...s} {...p}><path d="M3 12a9 9 0 1 0 3-6.7L3 8" /><path d="M3 3v5h5" /></svg>;
export const IconDownload = (p: P) => <svg viewBox="0 0 24 24" {...s} strokeWidth={2.2} {...p}><path d="M12 3v12" /><path d="m7 10 5 5 5-5" /><path d="M5 21h14" /></svg>;
export const IconClose = (p: P) => <svg viewBox="0 0 24 24" {...s} {...p}><path d="M6 6l12 12M18 6 6 18" /></svg>;
export const IconSearch = (p: P) => <svg viewBox="0 0 24 24" {...s} {...p}><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></svg>;
export const IconChevron = (p: P) => <svg viewBox="0 0 24 24" {...s} {...p}><path d="m6 9 6 6 6-6" /></svg>;
export const IconCube = (p: P) => <svg viewBox="0 0 24 24" {...s} {...p}><path d="M21 8 12 3 3 8v8l9 5 9-5z" /><path d="m3 8 9 5 9-5M12 13v8" /></svg>;
export const IconGun = (p: P) => <svg viewBox="0 0 24 24" fill="none" stroke="#8d9097" strokeWidth={1.6} width={26} height={26} {...p}><path d="M3 9h15l2-2h1v4h-4l-2 2h-3l-1 6H7l1-6H3z" /></svg>;
export const Logo = () => (
  <svg viewBox="0 0 32 32" fill="none" aria-hidden>
    <rect x="1" y="1" width="30" height="30" rx="8" fill="#1c1d21" stroke="#33363c" />
    <circle cx="16" cy="16" r="7.5" stroke="#ff7a1a" strokeWidth="2" />
    <path d="M16 4v6M16 22v6M4 16h6M22 16h6" stroke="#ecebe7" strokeWidth="2" strokeLinecap="round" />
    <circle cx="16" cy="16" r="1.8" fill="#ff7a1a" />
  </svg>
);
