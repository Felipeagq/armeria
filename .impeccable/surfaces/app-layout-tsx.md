---
version: 1
slug: "app-layout-tsx"
primary_target: "app/layout.tsx"
related_targets: ["app/page.tsx","app/armas/[id]/page.tsx"]
---

# Surface brief: sitio público y panel de Armería 3D

Scope: todo el sitio de consulta (Read) y el panel /admin (Operate). Visitor mode: Read en el sitio; Operate en /admin, donde el mundo solo presta tipografía, paleta, densidad y un gesto.
Audience: su dueño, sobre todo con una mano en el móvil. Job: encontrar un dato o comparar dos armas en segundos y fiarse de él. Constraints: contenido, rutas, funciones y 3D apagado intactos; sin texto ilegible sobre cristal; sin peso en el móvil.
Pin (palabras del usuario): "glassmorphism pero estilo muy táctico".

## Direction contract

THESIS: la ficha es un expediente de campo: suelo de mapa topográfico oscuro, placas de cristal ahumado y un solo objeto firma por página, la placa de espécimen (el arma sobre placa clara, enmarcada por esquinas de visor) junto a una lectura de cifras en cristal. Rechaza la lista oscura plana de wiki, el HUD de neón disfrazado y las rejillas de tarjetas icono+título+texto.

OWN-WORLD: suelo #0a0e0d con curvas de nivel generadas por programa y tres luces suaves (verde oliva arriba a la izquierda, arena arriba a la derecha, naranja de señal abajo a la derecha); cristal ahumado: relleno hueso del 5 al 14 %, filo de 1 px y brillo superior, con desenfoque solo donde algo flota (cabecera, dock, barra de secciones, lectura, buscador); texto hueso #e9eee8, secundario salvia #b3beb5; arena coyote #d3c398 marca el arma real, naranja de señal #ff6a13 marca las réplicas de airsoft y toda acción; Barlow Condensed para nombres, cifras y marca, Barlow para leer; esquinas de 3 y 6 px; esquinas de visor solo en la placa de espécimen (y, al pasar el cursor, en las filas del índice). Reconocible sin contenido.

STORY: el visitante ve qué arma es, sus seis cifras clave y la diferencia entre el arma real y su réplica de un vistazo, con la fuente siempre a la vista, y llega a la munición o a un accesorio con un toque.

FIRST VIEWPORT: móvil 390×844: cabecera con marca de mira y búsqueda; placa de espécimen a ancho completo con marco de visor y rótulo «Arma real»; debajo, la lectura en cristal con nombre, fabricante, selector de variante y las cifras en rejilla 2×2 que continúa a 2×3, y fijo abajo un dock de cristal con cinco iconos dibujados. Escritorio: placa a la izquierda (7/12) que iguala la altura de la lectura de la derecha (5/12), y debajo una barra de secciones de cristal pegajosa. Adaptaciones deliberadas: sin escala de regla bajo la foto (unas marcas sin unidades fingirían una medida que las fotos no tienen) y sin solapar la lectura sobre la placa (taparía las esquinas de visor y el texto sobre una foto clara pierde contraste).

FORM: pinned. seed: none (pinned) — "glassmorphism pero estilo muy táctico".

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance
