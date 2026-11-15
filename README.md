# Armería 3D — Enciclopedia de armas y réplicas airsoft

Enciclopedia de armas reales y de sus réplicas de airsoft hecha con **Next.js (App Router) + TypeScript**, con un constructor 3D opcional (**three.js**).
La **ficha** es la entidad principal: cada arma tiene datos del modelo real, de su réplica y enlaces a su munición. Las que además tienen geometría (12 modelos con variantes: HK416 A5/A7/A8, M4/AR-15, MK18, SIG516, L119A2, MCX Virtus, AK-74M, AK-12, Galil ACE, FN SCAR L/H, HK G36 C/K y CZ BREN 2) se pueden **montar en 3D** con accesorios, despiece animado, exportación a PNG e importación de modelos `.glb`. Una ficha sin 3D (p. ej. Glock 17) se consulta exactamente igual.

Rutas: `/` índice con búsqueda, filtros (calibre, familia, país, 3D) y orden, todo en la URL (`?calibre=5,56×45&3d=1&orden=nombre`) · `/comparar/?a=hk416:a5,m4` comparador de 2–3 armas o variantes (`dif=1` muestra solo diferencias) · `/sistemas/` glosario de sistemas y cerrojos (cada ficha explica en una línea los que usa) · `/armas/[id]/` ficha de un arma · `/accesorios/` y `/accesorios/[id]/` enciclopedia de accesorios (miras, bocachas, luces y láseres, empuñaduras, cargadores, culatas) · `/balas/` y `/balas/[id]/` munición · `/montar/` constructor 3D (`?m=<plataforma>` preselecciona el modelo y `&p=<pieza>` monta una pieza al llegar). Solo `/montar/` carga three.js en el navegador.

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
  page.tsx              Portada: buscador y catálogo de fichas (servidor; el buscador es cliente sin three)
  armas/[id]/page.tsx   Ficha estática de un arma (datos comunes, variantes, munición, «Montar en 3D» si procede)
  balas/                Enciclopedia de munición
  montar/page.tsx       Constructor 3D (única ruta que carga three.js)
  globals.css           Estilos de la interfaz
src/
  components/           UI en React (cliente)
    SiteNav.tsx         Cabecera de la enciclopedia (servidor)
    ArmasBuscador.tsx   Filtros, orden y selección para comparar; estado en la URL (recibe datos serializados)
    ArmasLista.tsx      Lista de armas compartida: el servidor la sirve completa y el buscador la reutiliza filtrada
    Comparador.tsx      Tabla de comparación (lista por campo en móvil); estado en la URL
    ClientApp.tsx       Carga App solo en el navegador (three.js necesita WebGL)
    App.tsx             Arranque del constructor, atajos de teclado, arrastrar y soltar, modales
    Header / Catalog / Viewport / Inspector / Modals
  state/
    store.ts            Estado global (zustand): build, historial, selección, vista
    build.ts            Lógica pura: valores por defecto, validación y migración
  three/                Motor 3D, sin dependencias de React
    engine/Viewer.ts    Escena, post-proceso (GTAO), cámara, selección y captura
    engine/thumbs.ts    Miniaturas renderizadas por lotes en un renderer aparte
    core/               Geometría con caché, materiales PBR procedurales, Builder
    data/               Plataformas genéricas, piezas y modelos reales con fichas
    data/armas.ts       Enciclopedia: fichas (derivadas de MODELS + fichas sin 3D), calibres y país normalizados; sin WebGL
    data/sistemas.ts    Glosario de sistemas de funcionamiento, cerrojos y disparo (texto corto + detalle + patrón que lo detecta en una ficha)
    data/accesorios.ts  Fichas de accesorios (40, una por TIPO de accesorio): datos, cómo funciona, ventajas/límites, airsoft y `partes` (ids de pieza 3D que cubre); sin three
    data/accesorios-compat.ts  SOLO SERVIDOR: qué armas y cuerpos genéricos admiten cada accesorio (misma regla que el constructor) y validación al compilar: cada pieza 3D debe tener ficha
    data/spec-labels.ts Etiquetas y orden de los campos de una ficha (módulo ligero, apto para cliente)
    glb/models.ts       Carga GLB, normalización, anclajes, IndexedDB y manifiesto
    registry.ts         Registro de plataformas/piezas y compatibilidades
```

Decisiones principales:

- **La ficha manda; el 3D es opcional.** `PLATFORMS` (registro) contiene solo lo construible; `ARMAS` (`data/armas.ts`) contiene todas las fichas y enlaza cada variante con su plataforma 3D si existe. Añadir un arma sin modelo es añadir una entrada a `FICHAS`; añadir geometría después no cambia la ficha.
- **Separación motor / UI.** `Viewer` es una clase de three.js pura. React solo le envía el estado (build, selección, vista), y él responde con eventos (`onPick`, `onHover`, `onBounds`). El motor se puede probar o reutilizar sin React.
- **Compatibilidad por etiquetas.** Cada plataforma declara `tags` (por ejemplo `stanag`, `ar-tube` o `ak545`) y cada pieza declara `fits`. Una pieza encaja si comparte al menos una etiqueta. Añadir un modelo nuevo no obliga a tocar las piezas existentes.
- **Datos no confiables validados.** El build guardado en `localStorage`, el historial y los GLB importados pasan por validación (`validState`, cabecera `glTF`, límite de 80 MB, rutas del manifiesto restringidas a `models/`).
- **Sin dependencias externas en tiempo de ejecución.** Las fuentes están autoalojadas (Fontsource) y las texturas se generan en el navegador. Así la CSP puede ser `default-src 'self'`.

## Armas fuera del catálogo (cascada curado → Wikipedia → IA)

Si un arma no está en el catálogo, `/armas/buscar/?q=…` la busca en cascada; el selector del constructor y el buscador de la portada enlazan ahí cuando no hay resultados.

1. **Catálogo** (`ARMAS`): fichas curadas, con o sin 3D.
2. **Wikipedia** (`src/server/wikipedia.ts`): búsqueda en es/en restringida a artículos con infobox de arma (`hastemplate:`), lectura de la infobox (`src/server/wikitext.ts` la convierte a texto plano), extracto, foto y atribución de Commons. La ficha se sirve en `/armas/ext/w-<idioma>-<título>/` con badge «Wikipedia» y enlace al artículo (CC BY-SA). Las respuestas HTTP se cachean un día.
3. **IA** (`src/server/ia.ts`): solo por acción explícita del usuario (botón «Generar ficha con IA», POST), con límite por IP y por día. Un modelo con búsqueda web rellena el esquema `Specs` mediante una herramienta estricta y cita sus fuentes; la ficha se marca **«Generado con IA · sin verificar»** y no se indexa. Se activa con `ANTHROPIC_API_KEY` (ver `.env.example`); sin clave, el botón no aparece.

**La caché es la fuente de verdad** (`src/server/store.ts`): toda ficha de los niveles 2 y 3 se guarda en memoria y, si el disco es escribible, en `.data/armas/<slug>.json` (ignorado por git). En Amplify el sistema de archivos es efímero, así que allí la caché vive por instancia; para persistencia real entre despliegues, sustituye el almacén por DynamoDB o S3 (el módulo expone solo `getFicha`/`putFicha`/`listFichas`).

**Revisión y promoción**: tras comprobar una ficha, `node scripts/promover-arma.mjs <slug>` la copia a `src/three/data/armas-externas.json` con `revisado: true`; desde ahí entra en `ARMAS` como ficha curada (estática, indexable) en el siguiente build.

Cualquier ficha externa ofrece «Montar con cuerpo de pistola/carabina/subfusil»: abre el constructor con la plataforma genérica más parecida y el nombre del arma; la silueta no es la del modelo real.

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
