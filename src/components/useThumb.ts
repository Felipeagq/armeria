'use client';
import { useEffect, useSyncExternalStore } from 'react';
import { getThumb, partThumbKey, platformThumbKey, requestPartThumb, requestPlatformThumb, subscribeThumbs, thumbsVersion } from '@/three/engine/thumbs';

const useThumbsVersion = () => useSyncExternalStore(subscribeThumbs, thumbsVersion, () => 0);

export function usePartThumb(id: string) {
  useThumbsVersion();
  useEffect(() => { requestPartThumb(id); }, [id]);
  return getThumb(partThumbKey(id));
}
export function usePlatformThumb(id: string) {
  useThumbsVersion();
  useEffect(() => { requestPlatformThumb(id); }, [id]);
  return getThumb(platformThumbKey(id));
}
