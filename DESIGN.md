---
name: Armería 3D
description: Enciclopedia de armas reales y réplicas de airsoft, vestida como un expediente de campo en cristal ahumado sobre un mapa topográfico.
colors:
  ground: "#0a0e0d"
  bone: "#e9eee8"
  sage: "#b3beb5"
  sage-dim: "#9aa79d"
  glass-tint: "#cee0ce"
  olive-glow: "#688656"
  coyote: "#d3c398"
  signal-orange: "#ff6a13"
  signal-ink: "#190c03"
  specimen-plate: "#d3d6d8"
  alert: "#ff9d8f"
  confirm: "#9bd49c"
typography:
  display:
    fontFamily: "Barlow Condensed, Barlow, system-ui, sans-serif"
    fontSize: "clamp(40px, 6.4vw, 62px)"
    fontWeight: 700
    lineHeight: 0.98
    letterSpacing: "0.005em"
  headline:
    fontFamily: "Barlow Condensed, Barlow, system-ui, sans-serif"
    fontSize: "27px"
    fontWeight: 600
    lineHeight: 1.1
    letterSpacing: "0.01em"
  title:
    fontFamily: "Barlow Condensed, Barlow, system-ui, sans-serif"
    fontSize: "23px"
    fontWeight: 600
    lineHeight: 1.15
    letterSpacing: "0.01em"
  figure:
    fontFamily: "Barlow Condensed, Barlow, system-ui, sans-serif"
    fontSize: "33px"
    fontWeight: 600
    lineHeight: 1.02
    letterSpacing: "0.005em"
    fontFeature: "tnum"
  body:
    fontFamily: "Barlow, system-ui, sans-serif"
    fontSize: "16.5px"
    fontWeight: 400
    lineHeight: 1.65
  label:
    fontFamily: "Barlow, system-ui, sans-serif"
    fontSize: "14px"
    fontWeight: 400
    lineHeight: 1.4
  button:
    fontFamily: "Barlow Condensed, Barlow, system-ui, sans-serif"
    fontSize: "17px"
    fontWeight: 600
    letterSpacing: "0.015em"
  wordmark:
    fontFamily: "Barlow Condensed, Barlow, system-ui, sans-serif"
    fontSize: "22px"
    fontWeight: 700
    letterSpacing: "0.1em"
rounded:
  sm: "3px"
  md: "6px"
  lg: "10px"
spacing:
  xs: "8px"
  sm: "12px"
  md: "16px"
  lg: "22px"
  xl: "30px"
  zone: "46px"
components:
  button-primary:
    backgroundColor: "{colors.signal-orange}"
    textColor: "{colors.signal-ink}"
    typography: "{typography.button}"
    rounded: "{rounded.sm}"
    padding: "7px 18px"
    height: "40px"
  button-ghost:
    backgroundColor: "{colors.glass-tint}"
    textColor: "{colors.bone}"
    typography: "{typography.button}"
    rounded: "{rounded.sm}"
    padding: "7px 16px"
    height: "40px"
  chip-section:
    textColor: "{colors.sage}"
    typography: "{typography.button}"
    rounded: "{rounded.sm}"
    padding: "6px 15px"
    height: "38px"
  chip-section-active:
    backgroundColor: "{colors.bone}"
    textColor: "{colors.ground}"
    typography: "{typography.button}"
    rounded: "{rounded.sm}"
    padding: "6px 15px"
    height: "38px"
  plate:
    backgroundColor: "{colors.glass-tint}"
    textColor: "{colors.bone}"
    rounded: "{rounded.md}"
    padding: "20px 22px"
  specimen-frame:
    backgroundColor: "{colors.specimen-plate}"
    rounded: "{rounded.sm}"
    padding: "10px"
---

# Design System: Armería 3D

## Overview

**Creative North Star: "El expediente de campo"**

Un mapa topográfico oscuro hace de suelo y, encima, placas de cristal ahumado llevan los datos. Cada arma, cartucho o accesorio es un expediente: una placa de espécimen (el objeto sobre fondo claro, enmarcado por esquinas de visor) y, al lado, una lectura de cifras. Todo lo demás se mantiene callado para que el dato se lea de un vistazo, con una sola mano, en el móvil.

La estética pedida por su dueño es glassmorphism táctico, y aquí «táctico» significa la lengua técnica de una ficha de campo (tipografía condensada de rotulación, curvas de nivel, esquinas de visor, iconos de trazo fino), no emblemas ni insignias. El cristal tiene una función: flota lo que se mueve sobre el contenido (cabecera, barra de secciones, dock, lectura de cifras, buscador) y desenfoca lo que pasa por debajo. La columna de lectura permanece limpia: nada actúa detrás del texto.

**Key Characteristics:**
- Suelo oscuro, casi negro verdoso, con curvas de nivel generadas por programa y tres luces suaves detrás del cristal.
- Cristal ahumado: relleno hueso translúcido, filo de 1 px y brillo superior, sin sombras exteriores.
- Dos colores con significado: arena coyote para el arma real y naranja de señal para las réplicas de airsoft y toda acción.
- Tipografía condensada de rotulación para nombres y cifras; sans humanista para leer.
- Un solo gesto firma: las esquinas de visor de la placa de espécimen.
- Móvil primero: el menú es un dock de cristal con iconos bajo el pulgar.

## Colors

Un suelo casi negro con luz verde oliva, y dos acentos que no se mezclan: la arena para lo real y el naranja para lo que se pulsa o es réplica.

### Primary
- **Naranja de señal** (#ff6a13): el de la punta de las réplicas de airsoft. Marca las réplicas (marcador de zona, esquinas de visor de una foto de réplica, etiqueta) y toda acción (botón principal, foco, selección activa, cursor de texto, casillas).
- **Tinta de señal** (#190c03): texto sobre el naranja (contraste 6,7:1).

### Secondary
- **Arena coyote** (#d3c398): marca lo real: marcador de la zona «Arma real», esquinas de visor y etiqueta de una foto de arma real, columna activa en la tabla de variantes, borde de hover de filas y chips.

### Neutral
- **Suelo** (#0a0e0d): fondo de la página y de la cabecera (con 78 % de opacidad como «humo»).
- **Hueso** (#e9eee8): texto principal y relleno del chip activo.
- **Salvia** (#b3beb5): texto secundario, etiquetas y pies. Medido sobre el cristal real: todos los textos pasan 4,5:1.
- **Salvia apagada** (#9aa79d): solo texto grande o incidental.
- **Tinte de cristal** (#cee0ce, canal 206,224,206): relleno translúcido de toda placa (del 5 al 14 %) y de las líneas finas (13 a 24 %).
- **Luz verde oliva** (#688656): la luz de arriba a la izquierda que el cristal desenfoca; las otras dos son arena y naranja muy tenues.
- **Placa de espécimen** (#d3d6d8): fondo claro bajo las fotos recortadas (se funden con multiplicación).
- **Alerta** (#ff9d8f) y **Confirmación** (#9bd49c): solo estados en el panel.

### Named Rules
**The Signal Rule.** El naranja solo significa dos cosas: réplica de airsoft o algo que se pulsa. La arena solo significa arma real. Ningún otro uso.
**The Contrast On Glass Rule.** Todo texto sobre cristal debe pasar 4,5:1 (3:1 el grande) medido contra el píxel más claro tras él; los secundarios pequeños usan Salvia, nunca la apagada.

## Typography

**Display Font:** Barlow Condensed (con Barlow y sans del sistema como respaldo)
**Body Font:** Barlow (con sans del sistema)
**Label/Mono Font:** ninguna monoespaciada en el sitio público; los datos usan cifras tabulares de Barlow

**Character:** una condensada de rotulación de señalética para lo que se lee de lejos (nombres, cifras, botones, marca) y su hermana de texto para lo que se lee de cerca. Ambas se autoalojan (sin peticiones externas).

### Hierarchy
- **Display** (700, clamp(40px, 6.4vw, 62px), 0,98): título de cada página y nombre del arma en la lectura (38–54 px).
- **Headline** (600, 27–34px, 1,1): zonas «Arma real» y «Réplica de airsoft» (34 px) y secciones.
- **Title** (600, 23px, 1,15): encabezado de cada placa.
- **Figure** (600, 33px, 1,02, cifras tabulares): las seis cifras clave (calibre, cañón, peso, cadencia, alcance, energía).
- **Body** (400, 16,5px, 1,65): prosa, con un máximo de 66 caracteres por línea; 15 px en la interfaz.
- **Label** (400–500, 14px, 1,4, Salvia): etiquetas de cifras y de datos.
- **Wordmark** (700, 22px, +0,1em, mayúsculas): solo la marca «ARMERÍA 3D».

### Named Rules
**The One Caps Rule.** Las mayúsculas se reservan a la marca. Los nombres de armas se muestran tal cual están escritos.

## Layout

Móvil primero. Una columna con márgenes de 14 px y un dock de cristal fijo abajo (60 px más el área segura). Desde 641 px aparece la cabecera pegajosa con el menú en texto; desde 900 px las placas ganan desenfoque y las listas pasan a dos columnas; desde 961 px la ficha del arma se divide en placa de espécimen (7/12) y lectura de cifras (5/12), con la placa igualando la altura de la lectura.

Contenedores: 880 px para texto, 1160 px para listas y fichas de lectura, 1180 px para la ficha del arma. Ritmo vertical: 16 px entre placas, 22 px de relleno interior, 30 px entre placa y lectura, 46 px entre zonas, con más aire sobre un título que bajo él. La barra de secciones se pega bajo la cabecera y resalta la sección que se lee.

## Elevation & Depth

La profundidad es tonal y de cristal, no de sombras. Cada placa tiene un relleno translúcido en degradado, un filo de 1 px y un brillo interior superior (`inset 0 1px 0 rgba(255,255,255,.2)`); no hay sombras exteriores. Lo que flota sobre el contenido (cabecera, barra de secciones, dock, lectura, buscador, diálogo) añade desenfoque de fondo (`blur(14–26px) saturate(1.3)`) y un humo más denso (78–88 %). Las superficies grandes y repetidas en móvil (listas, placas de lectura) usan relleno más denso y no desenfocan, para que el scroll no salte.

### Named Rules
**The Glass Has A Reason Rule.** El desenfoque solo existe donde algo flota o pasa por debajo. Una lista larga o una columna de lectura no lo lleva en móvil.
**The Reduced Transparency Rule.** Con `prefers-reduced-transparency` (o sin `backdrop-filter`) todo el cristal pasa a un fondo opaco `#101814`; el diseño sigue completo y legible.

## Shapes

Esquinas casi rectas: 3 px en controles y 6 px en placas (10 px solo en el diálogo). Filos de 1 px. La forma firma son las **esquinas de visor**: cuatro pares de trazos de 2 px (16–20 px) en las esquinas del marco de la placa de espécimen, en arena para el arma real y en naranja para la réplica; al fijarse, entran una vez con una escala de 1,04 a 1. Las filas del índice las muestran en pequeño (11 px) al pasar el cursor.

## Components

### Buttons
- **Shape:** rectangular, esquinas de 3 px, 40 px de alto (44 en táctil).
- **Primary:** naranja de señal con tinta oscura, Barlow Condensed 600 de 17 px. Hover aclara; active oscurece.
- **Ghost:** relleno de cristal (7 %), filo de 24 % y, al pasar, filo de arena.

### Chips
- **Section chip:** rectangular, sin filo en reposo, Barlow Condensed 600 de 17 px, con el recuento en gris. Activo: relleno hueso con texto del suelo.
- **Accessory chip:** miniatura de 28 px sobre placa clara, nombre de 14 px y filo de arena en hover.

### Cards / Containers
- **Plate:** esquinas de 6 px, relleno de cristal en degradado (14 % → 5 % → 7,5 %), filo de 1 px y brillo superior; relleno interior de 20×22 px. Nunca anidada: lo de dentro es plano y se separa con líneas finas.
- **Specimen frame:** placa de cristal de 10 px de relleno alrededor de la foto sobre `#d3d6d8`, con esquinas de visor y una etiqueta de cristal oscuro («Arma real» / «Réplica de airsoft»).
- **Index row:** miniatura de 92×62, nombre en Barlow Condensed 600 de 23 px, fabricante y calibre; al pasar, filo de arena y esquinas de visor.

### Inputs / Fields
- **Style:** campo de cristal humo (88 %) con filo de 24 %, esquinas de 6 px, 44 px de alto, texto de 16 px en móvil.
- **Focus:** contorno naranja de 2 px; cursor de texto naranja.

### Navigation
- **Cabecera:** cristal pegajoso (62 px) con marca de mira y enlaces en Barlow Condensed 600 de 18 px; la página actual lleva una línea naranja inferior.
- **Dock móvil:** cinco secciones con icono dibujado (trazo de 1,75 px) y etiqueta; la actual lleva una línea naranja superior y el icono naranja. Cristal denso (86 %) con desenfoque de 20 px.
- **Barra de secciones:** cristal pegajoso con chips y un resalte de la sección en lectura.

### Key readout (componente firma)
La lectura de cifras: título, fabricante, selector de variante (control segmentado) y una rejilla de dos columnas con las seis cifras en Barlow Condensed de 33 px y su matiz en gris. Las cifras que enlazan (calibre) llevan un chevron dibujado.

## Do's and Don'ts

### Do:
- **Do** reservar el naranja (#ff6a13) para réplicas y acciones, y la arena (#d3c398) para lo real.
- **Do** medir el contraste del texto sobre el cristal real, no sobre el fondo teórico.
- **Do** dibujar los iconos con el mismo trazo de 1,75 px en una rejilla de 24 px.
- **Do** dar a cada placa un filo de 1 px y un brillo superior, y nada más para elevarla.
- **Do** mantener la columna de lectura sin textura ni efectos detrás del texto.

### Don't:
- **Don't** añadir sombras exteriores, gradientes en el texto, rayas de color de más de 1 px en un lado ni etiquetas sobre los títulos.
- **Don't** poner marcas de escala o de regla sobre las fotos: fingirían una medida que no existe.
- **Don't** usar emblemas, insignias, calaveras ni camuflaje como adorno: lo táctico es la lengua técnica de la ficha.
- **Don't** anidar placas dentro de placas ni repetir el desenfoque en listas largas de móvil.
- **Don't** usar glifos Unicode como iconos.
