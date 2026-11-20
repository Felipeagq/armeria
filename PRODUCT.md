# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Su dueño, para uso personal y educativo. Consulta las fichas sobre todo desde el móvil (rápido, de pie, en una mano) y a veces desde el escritorio para leer o comparar con calma. Mientras no se publique, el sitio no tiene más audiencia confirmada; si se abre a otros aficionados al airsoft y a las armas, el uso móvil seguirá siendo el principal. El panel `/admin` lo usa una sola persona, el mismo dueño.

## Product Purpose

Enciclopedia en español de armas reales y de sus réplicas de airsoft, con su munición, sus accesorios y un glosario de sistemas. Cada ficha reúne datos técnicos, fotos con crédito y las relaciones entre armas, cartuchos y accesorios. El éxito es encontrar un dato o comparar dos armas en segundos y fiarse de él, con la fuente a la vista.

## Positioning

Pone cada arma real junto a su réplica de airsoft, con la munición y los accesorios que de verdad encajan, en un mismo sitio y en español. Esa relación entre lo real y su réplica es lo que una enciclopedia genérica no ofrece.

## Operating Context

Sitio de consulta público y estático (Next.js, ISR con revalidación al instante desde el panel), alimentado por una base de datos PostgreSQL; imágenes en un bucket S3 privado servidas desde `/img`. Despliegue en AWS Amplify. El contenido se edita desde `/admin` (crear, editar, archivar, imágenes) y se publica al guardar.

## Capabilities and Constraints

- Secciones: Armas (portada con filtros por calibre, familia, país), ficha de arma con variantes, Munición, Accesorios, Glosario («Sistemas»), Comparador y buscador global (⌘K).
- El constructor 3D existe pero está **apagado** por un interruptor (`NEXT_PUBLIC_ENABLE_3D`) y no es prioritario: no se rediseña ni se reactiva.
- Contenido y textos de las fichas, funciones (buscador, filtros, comparador, panel) y rutas actuales no cambian; solo cambia cómo se presentan.
- Rendimiento en móvil normal: el scroll no debe saltar. Texto siempre legible.
- Las fotos son recortes sobre fondo claro, escenas y fotos de galería, de Wikimedia Commons con autoría y licencia visibles.

## Brand Commitments

- Nombre: «Armería 3D». Todo el texto en español.
- Estética pedida por su dueño y obligatoria: **glassmorphism con estilo muy táctico**.

## Evidence on Hand

Unas 300 imágenes con créditos (S3 y enlaces externos), 18 armas con variantes, 8 cartuchos, 40 accesorios y 25 términos de glosario ya cargados en la base de datos. No hay testimonios, cifras de uso ni logotipo propio más allá del nombre y el icono actual.

## Product Principles

1. El dato manda: la ficha se lee de un vistazo y la fuente siempre está a la vista.
2. Lo real y su réplica de airsoft se distinguen siempre con claridad.
3. Hecho para una mano en el móvil: objetivos táctiles amplios, nada que pese.
4. El efecto visual nunca compromete la legibilidad.

## Accessibility & Inclusion

Contraste legible sobre superficies translúcidas (texto sobre cristal con contraste suficiente), foco de teclado visible, respeto de `prefers-reduced-motion` y de `prefers-reduced-transparency`, objetivos táctiles de al menos 44 px.
