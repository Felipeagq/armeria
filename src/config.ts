// Interruptor del constructor 3D (/montar, el visor, las miniaturas WebGL y los textos «montar en 3D»).
// Apagado por omisión: solo se enciende con NEXT_PUBLIC_ENABLE_3D=true (se lee al compilar, por eso lleva NEXT_PUBLIC_;
// no es un secreto). El código 3D sigue en src/three y src/components; con el interruptor apagado nada lo carga ni lo enlaza.
export const ENABLE_3D = process.env.NEXT_PUBLIC_ENABLE_3D === 'true';

// App de uso personal y educativo: las galerías no muestran autor ni licencia (siguen guardados en la BD: tabla imagenes).
// Si la app llegara a publicarse, pon esto en true.
export const MOSTRAR_CREDITOS = false;
