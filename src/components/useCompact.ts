'use client';
import { useSyncExternalStore } from 'react';

/** Móvil / pantalla baja: misma condición que el modo «pestañas» de globals.css. */
export const COMPACT = '(max-width:640px), (max-height:520px) and (max-width:960px)';
export const isCompact = () => window.matchMedia(COMPACT).matches;

/** `false` en SSR y en el primer render para evitar desajustes de hidratación. */
export const useCompact = () => useSyncExternalStore(
  cb => { const mq = window.matchMedia(COMPACT); mq.addEventListener('change', cb); return () => mq.removeEventListener('change', cb); },
  isCompact,
  () => false,
);
