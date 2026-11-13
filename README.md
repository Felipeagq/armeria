# Armería 3D — Constructor de réplicas airsoft

Configurador 3D de réplicas de airsoft hecho con **Next.js (App Router) + TypeScript + three.js**.
Incluye 12 modelos reales con sus variantes (HK416 A5/A7/A8, M4/AR-15, MK18, SIG516, L119A2, MCX Virtus, AK-74M, AK-12, Galil ACE, FN SCAR L/H, HK G36 C/K y CZ BREN 2), su ficha técnica, compatibilidades por familia, despiece animado, exportación a PNG e importación de modelos `.glb`.

## Requisitos

- Node.js 22 (ver `.nvmrc`). Mínimo 20.9.
- npm 10 o superior.

## Desarrollo

```bash
npm ci
npm run dev          # http://localhost:3010
npm run lint         # ESLint (config de Next)
npm run typecheck    # tsc --noEmit (modo estricto)
npm run build        # build de producción (.next/)
npm start            # sirve el build en http://localhost:3010 (requiere npm run build)
```

## Arquitectura

```
app/
  layout.tsx            Metadatos, fuentes autoalojadas y estilos globales
  page.tsx              Página única (componente servidor que monta el cliente)
  globals.css           Estilos de la interfaz
src/
  components/           UI en React (cliente)
    ClientApp.tsx       Carga App solo en el navegador (three.js necesita WebGL)
    App.tsx             Arranque, atajos de teclado, arrastrar y soltar, modales
    Header / Catalog / Viewport / Inspector / Modals
  state/
    store.ts            Estado global (zustand): build, historial, selección, vista
    build.ts            Lógica pura: valores por defecto, validación y migración
  three/                Motor 3D, sin dependencias de React
    engine/Viewer.ts    Escena, post-proceso (GTAO), cámara, selección y captura
    engine/thumbs.ts    Miniaturas renderizadas por lotes en un renderer aparte
    core/               Geometría con caché, materiales PBR procedurales, Builder
    data/               Plataformas genéricas, piezas y modelos reales con fichas
    glb/models.ts       Carga GLB, normalización, anclajes, IndexedDB y manifiesto
    registry.ts         Registro de plataformas/piezas y compatibilidades
```

Decisiones principales:

- **Separación motor / UI.** `Viewer` es una clase de three.js pura. React solo le envía el estado (build, selección, vista), y él responde con eventos (`onPick`, `onHover`, `onBounds`). El motor se puede probar o reutilizar sin React.
- **Compatibilidad por etiquetas.** Cada plataforma declara `tags` (por ejemplo `stanag`, `ar-tube` o `ak545`) y cada pieza declara `fits`. Una pieza encaja si comparte al menos una etiqueta. Añadir un modelo nuevo no obliga a tocar las piezas existentes.
- **Datos no confiables validados.** El build guardado en `localStorage`, el historial y los GLB importados pasan por validación (`validState`, cabecera `glTF`, límite de 80 MB, rutas del manifiesto restringidas a `models/`).
- **Sin dependencias externas en tiempo de ejecución.** Las fuentes están autoalojadas (Fontsource) y las texturas se generan en el navegador. Así la CSP puede ser `default-src 'self'`.

## Despliegue en AWS Amplify Hosting

Se despliega como una app **Next.js estándar** (la plataforma `WEB_COMPUTE` que Amplify elige por defecto para Next.js). El constructor corre en el navegador, pero el build deja su salida en `.next/` y Amplify la sirve desde su CDN y su capa de cómputo.

1. Sube el proyecto a un repositorio (GitHub, GitLab, Bitbucket o CodeCommit).
2. En la consola de Amplify: **Create new app → Host web app**, elige el repositorio y la rama.
3. Amplify detecta `amplify.yml` (build con `npm ci`, lint, typecheck y `next build`; artefactos en `.next/`). Revisa que el **directorio de salida** sea `.next`.
4. `customHttp.yml` aplica las cabeceras de seguridad (CSP, HSTS, `X-Frame-Options`, etc.) y la caché larga de `_next/static`.
5. Opcional: en **Domain management**, añade tu dominio. Amplify emite el certificado TLS.

> **No uses `output: 'export'` con esta configuración.** Un sitio estático (salida en `out/`) exige que la app de Amplify tenga plataforma `WEB`; con `WEB_COMPUTE` el deploy falla con `Can't find required-server-files.json in build output directory`. Si algún día prefieres estático: añade `output: 'export'` en `next.config.ts`, pon `baseDirectory: out` en `amplify.yml` y cambia la plataforma con `aws amplify update-app --app-id <APP_ID> --platform WEB`.

## Modelos 3D propios (GLB)

- **Solo para ti:** botón **Modelos 3D**, o arrastra un `.glb` al lienzo. Se guarda en el IndexedDB de tu navegador.
- **Para todos los visitantes:** copia los archivos a `public/models/` y decláralos en `public/models/manifest.json`:

```json
{
  "models": [
    { "id": "visor_holo", "kind": "part", "slot": "optic", "name": "Visor holográfico",
      "file": "holo.glb", "platforms": ["long"], "units": "m", "weight": 320 },
    { "kind": "part", "replaces": "mz_sup_l", "file": "supresor.glb", "units": "m" },
    { "id": "carabina_base", "kind": "base", "family": "rifle",
      "name": "Mi carabina", "file": "carabina.glb", "units": "m" }
  ]
}
```

Convenciones de los modelos:

- Formato `.glb` con texturas embebidas. Compresión Meshopt sí; Draco no.
- Cañón hacia `+X`, arriba `+Y`. Si viene en otra orientación, se corrige con la opción `forward` (`+x`, `-x`, `+z`, `-z`).
- **Cuerpos base:** nodos vacíos `slot_optic`, `slot_muzzle`, `slot_under`, `slot_side`, `slot_mag`, `slot_stock` y `slot_grip`.
- **Piezas:** un nodo vacío `attach` marca el punto de anclaje. Si falta, se calcula según el tipo de pieza.
- Comprueba que la licencia de cada modelo permita el uso que le vas a dar, sobre todo si es comercial.

## Datos de las fichas técnicas

Son cifras del arma real tomadas de fuentes públicas (fabricantes, Wikipedia y prensa especializada); cada ficha indica su fuente. Varían según configuración y munición. Cuando un dato no es público, la ficha lo dice en lugar de estimarlo.
