import type { NextConfig } from 'next';

/**
 * El constructor se ejecuta 100 % en el navegador (WebGL), así que se publica
 * como sitio estático: Amplify Hosting sirve la carpeta `out/` desde su CDN,
 * sin servidor Node que mantener ni costes de cómputo.
 * Las cabeceras de seguridad se definen en `customHttp.yml` (Amplify),
 * porque `headers()` de Next no aplica a exportaciones estáticas.
 */
const nextConfig: NextConfig = {
  output: 'export',
  reactStrictMode: true,
  poweredByHeader: false,
  images: { unoptimized: true },
  trailingSlash: true,
};

export default nextConfig;
