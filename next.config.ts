import type { NextConfig } from 'next';

/**
 * Se despliega en Amplify Hosting como app Next.js estándar (SSR, plataforma WEB_COMPUTE),
 * igual que el resto de proyectos: Amplify espera `.next/` como salida del build.
 * (Antes usaba `output: 'export'` → sitio estático en `out/`, que exige que la app de
 * Amplify esté creada con plataforma WEB; con WEB_COMPUTE falla con
 * «Can't find required-server-files.json in build output directory».)
 * Las cabeceras de seguridad siguen definidas en `customHttp.yml` (Amplify).
 */
const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  images: { unoptimized: true },
  trailingSlash: true,
};

export default nextConfig;
