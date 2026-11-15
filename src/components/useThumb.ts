'use client';
import { useEffect, useSyncExternalStore } from 'react';
import { getThumb, partThumbKey, platformThumbKey, requestPartThumb, requestPlatformThumb, subscribeThumbs, thumbsVersion } from '@/three/engine/thumbs';

const useThumbsVersion = () => useSyncExternalStore(subscribeThumbs, thumbsVersion, () => 0);

export function usePartThumb(id: string) {
  useThumbsVersion();
  useEffect(() => { requestPartThumb(id); }, [id]);
  return getThumb(partThumbKey(id));
}
/** `enabled: false` evita el render 3D (p. ej. en móvil, donde la miniatura no se muestra). */
export function usePlatformThumb(id: string, enabled = true) {
  useThumbsVersion();
  useEffect(() => { if (enabled) requestPlatformThumb(id); }, [id, enabled]);
  return enabled ? getThumb(platformThumbKey(id)) : undefined;
}
