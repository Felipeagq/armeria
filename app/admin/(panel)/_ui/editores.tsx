'use client';

import { useState } from 'react';
import { ARMA_GROUPS, GRUPOS_ACC, GRUPOS_SISTEMA } from '@/catalogo/util';
import type { ArmaConVariantes, FormAccesorio, FormArma, FormMunicion, FormTermino, FormVariante, OpcionRel } from '@/admin/tipos';
import { slugify } from '@/admin/util';
import { varianteNueva } from '@/admin/vacios';
import { guardarAccesorioAccion, guardarArmaAccion, guardarMunicionAccion, guardarTerminoAccion } from '../acciones-contenido';
import { Acciones, Casilla, EditorLineas, EditorPares, EditorSpecs, FormEditor, ListaChecks, Numero, ProbadorPatron, RelArmas, Seccion, Seleccion, Texto } from './campos';
import { IconPlus } from '@/components/icons';

/** Estado de un formulario con un setter por campo; en «crear», el identificador se deriva del nombre hasta que se toca. */
function useDatos<T extends { modo: 'crear' | 'editar'; id: string; nombre: string }>(inicial: T) {
  const [d, setD] = useState<T>(inicial);
  const [idTocado, setIdTocado] = useState(inicial.modo === 'editar');
  const set = <K extends keyof T>(k: K, v: T[K]) => setD(x => {
    const n = { ...x, [k]: v };
    if (k === 'nombre' && !idTocado) n.id = slugify(String(v));
    return n;
  });
  const setId = (v: string) => { setIdTocado(true); setD(x => ({ ...x, id: v })); };
  return { d, set, setId };
}
const campoId = (modo: 'crear' | 'editar', id: string, setId: (v: string) => void) => (
  <Texto etiqueta="Identificador" valor={id} onChange={setId} soloLectura={modo === 'editar'} mono maxLength={60}
    ayuda={modo === 'editar' ? 'No se puede cambiar: es la dirección de la ficha.' : 'Dirección de la ficha (minúsculas, números y guiones). Se propone a partir del nombre y no se podrá cambiar.'} />
);
const cancelarA = (seg: string, d: { modo: string; id: string }) => (d.modo === 'editar' ? `/admin/${seg}/${d.id}/` : `/admin/${seg}/`);

/* ═════════════ Arma ═════════════ */
export function EditorArma({ inicial, municion, accesorios }: { inicial: FormArma; municion: OpcionRel[]; accesorios: OpcionRel[] }) {
  const { d, set, setId } = useDatos(inicial);
  const setVar = (i: number, p: Partial<FormVariante>) => set('variantes', d.variantes.map((v, k) => (k === i ? { ...v, ...p } : v)));
  return (
    <FormEditor accion={guardarArmaAccion} datos={d} cancelar={cancelarA('armas', d)} etiqueta={d.modo === 'crear' ? 'Crear arma' : 'Guardar cambios'}>
      <Seccion titulo="Identidad">
        <div className="admgrid">
          <Texto etiqueta="Nombre" valor={d.nombre} onChange={v => set('nombre', v)} requerido maxLength={200} />
          {campoId(d.modo, d.id, setId)}
          <Texto etiqueta="Fabricante" valor={d.fabricante} onChange={v => set('fabricante', v)} maxLength={300}
            ayuda="Formato «Fabricante · País»: el país se toma de lo que va tras el último «·»." />
          <Seleccion etiqueta="Grupo" valor={d.grupo} onChange={v => set('grupo', v)} opciones={[...ARMA_GROUPS]} />
          <Numero etiqueta="Orden en listados" valor={d.orden} onChange={v => set('orden', v)} ayuda="0 en un arma nueva = al final." />
          <Texto etiqueta="Tipo" valor={d.tipo} onChange={v => set('tipo', v)} maxLength={200} ayuda="Solo en fichas externas (p. ej. «Pistola semiautomática»)." />
        </div>
        <Texto etiqueta="Resumen" valor={d.resumen} onChange={v => set('resumen', v)} filas={3} ayuda="Solo en fichas externas." />
        <Casilla etiqueta="Revisada (visible en el sitio)" valor={d.revisado} onChange={v => set('revisado', v)} ayuda="Las fichas traídas de Wikipedia o de la IA quedan sin revisar hasta que las marques." />
      </Seccion>

      <Seccion titulo="Datos comunes" nota="Valen para todas las variantes; cada variante puede sobrescribirlos.">
        <EditorSpecs valor={d.specsComunes} onChange={v => set('specsComunes', v)} />
      </Seccion>

      <section className="admvars">
        <h2>Variantes <span className="admcuenta">({d.variantes.length})</span></h2>
        <p className="admayuda">Una variante quitada se archiva (no se pierde su historial). La munición y los accesorios se marcan por variante.</p>
        {d.variantes.map((v, i) => (
          <details className="admvar" key={v.dbId ?? `n${i}`} open={!v.dbId || d.variantes.length === 1}>
            <summary>
              <b>{v.nombre || 'Variante sin nombre'}</b>
              <small>{v.slug}{v.dbId ? '' : ' · nueva'} · {v.municion.length} cartuchos · {v.accesorios.length} accesorios</small>
              <Acciones i={i} lista={d.variantes} onChange={a => set('variantes', a)} />
            </summary>
            <div className="admvar-cuerpo">
              <div className="admgrid">
                <Texto etiqueta="Nombre de la variante" valor={v.nombre} onChange={x => setVar(i, { nombre: x })} requerido maxLength={200} />
                <Texto etiqueta="Identificador" valor={v.slug} onChange={x => setVar(i, { slug: slugify(x, 40) })} soloLectura={!!v.dbId} mono maxLength={40} ayuda={v.dbId ? 'No se puede cambiar.' : 'Minúsculas, números y guiones.'} />
                <Texto etiqueta="Plataforma del constructor 3D" valor={v.plataforma3d} onChange={x => setVar(i, { plataforma3d: x })} mono maxLength={60} ayuda="Opcional. Id interno del modelo 3D; se conserva por si se reactiva el constructor." />
              </div>
              <Seccion titulo="Datos de la variante" abierta={false} nota="Lo que difiere de los datos comunes."><EditorSpecs valor={v.specs} onChange={x => setVar(i, { specs: x })} /></Seccion>
              <ListaChecks etiqueta="Munición que usa" opciones={municion} seleccion={v.municion} onChange={x => setVar(i, { municion: x })} />
              <ListaChecks etiqueta="Accesorios que admite" opciones={accesorios} seleccion={v.accesorios} onChange={x => setVar(i, { accesorios: x })} />
            </div>
          </details>
        ))}
        <button type="button" className="ghost" onClick={() => set('variantes', [...d.variantes, varianteNueva(d.variantes.length)])}><IconPlus />Añadir variante</button>
      </section>
    </FormEditor>
  );
}

/* ═════════════ Munición ═════════════ */
export function EditorMunicion({ inicial, armas }: { inicial: FormMunicion; armas: ArmaConVariantes[] }) {
  const { d, set, setId } = useDatos(inicial);
  return (
    <FormEditor accion={guardarMunicionAccion} datos={d} cancelar={cancelarA('municion', d)} etiqueta={d.modo === 'crear' ? 'Crear cartucho' : 'Guardar cambios'}>
      <Seccion titulo="Identidad">
        <div className="admgrid">
          <Texto etiqueta="Nombre" valor={d.nombre} onChange={v => set('nombre', v)} requerido maxLength={200} />
          {campoId(d.modo, d.id, setId)}
          <Texto etiqueta="Nombre corto" valor={d.nombreCorto} onChange={v => set('nombreCorto', v)} requerido maxLength={80} ayuda="Para los enlaces anterior/siguiente." />
          <Seleccion etiqueta="Tipo" valor={d.tipo} onChange={v => set('tipo', v as 'real' | 'airsoft')} opciones={[['real', 'Real'], ['airsoft', 'Airsoft']]} />
          <Numero etiqueta="Orden en listados" valor={d.orden} onChange={v => set('orden', v)} ayuda="0 en uno nuevo = al final." />
        </div>
        <Texto etiqueta="Eslogan" valor={d.eslogan} onChange={v => set('eslogan', v)} filas={2} maxLength={600} />
      </Seccion>

      <Seccion titulo="Reconocimiento en las armas" nota="Cómo se detecta este cartucho en el campo «Calibre» de un arma.">
        <div className="admgrid">
          <Texto etiqueta="Expresión regular" valor={d.patronCalibre} onChange={v => set('patronCalibre', v)} mono maxLength={400} ayuda="Ej.: 5[.,]56 — vacío si no se detecta por texto." />
          <Seleccion etiqueta="Indicadores" valor={d.patronFlags} onChange={v => set('patronFlags', v as '' | 'i')} opciones={[['', 'Distingue mayúsculas'], ['i', 'Sin distinguir mayúsculas (i)']]} />
        </div>
        <ProbadorPatron patron={d.patronCalibre} flags={d.patronFlags} />
      </Seccion>

      <Seccion titulo="Datos clave" nota="Las casillas destacadas arriba de la ficha. «Proyectil» con el formato «9,5 g» alimenta el cálculo de energía.">
        <EditorPares etiqueta="Datos clave" valores={d.claves} onChange={v => set('claves', v)} />
      </Seccion>
      <Seccion titulo="Datos" abierta={false}><EditorPares etiqueta="Tabla de datos" valores={d.hechos} onChange={v => set('hechos', v)} /></Seccion>
      <Seccion titulo="Sobre este cartucho" abierta={false}>
        <EditorLineas etiqueta="Párrafos" valores={d.sobre} onChange={v => set('sobre', v)} filas={4} anadir="Añadir párrafo" />
        <Texto etiqueta="Fuente" valor={d.fuente} onChange={v => set('fuente', v)} maxLength={500} />
      </Seccion>

      {d.tipo === 'real'
        ? <Seccion titulo="Armas que lo usan" abierta={d.modo === 'editar'}><RelArmas etiqueta="Variantes que usan este cartucho" armas={armas} seleccion={d.variantes} onChange={v => set('variantes', v)} /></Seccion>
        : <p className="admayuda">La munición de airsoft sirve a todas las réplicas: no necesita relaciones.</p>}
    </FormEditor>
  );
}

/* ═════════════ Accesorio ═════════════ */
export function EditorAccesorio({ inicial, armas }: { inicial: FormAccesorio; armas: ArmaConVariantes[] }) {
  const { d, set, setId } = useDatos(inicial);
  return (
    <FormEditor accion={guardarAccesorioAccion} datos={d} cancelar={cancelarA('accesorios', d)} etiqueta={d.modo === 'crear' ? 'Crear accesorio' : 'Guardar cambios'}>
      <Seccion titulo="Identidad">
        <div className="admgrid">
          <Texto etiqueta="Nombre" valor={d.nombre} onChange={v => set('nombre', v)} requerido maxLength={200} />
          {campoId(d.modo, d.id, setId)}
          <Seleccion etiqueta="Grupo" valor={d.grupo} onChange={v => set('grupo', v)} opciones={[...GRUPOS_ACC]} />
          <Numero etiqueta="Orden en listados" valor={d.orden} onChange={v => set('orden', v)} ayuda="0 en uno nuevo = al final." />
        </div>
        <Texto etiqueta="Resumen" valor={d.resumen} onChange={v => set('resumen', v)} filas={3} maxLength={1500} />
        <EditorLineas etiqueta="Nombres en inglés" valores={d.tecnico} onChange={v => set('tecnico', v)} filas={1} anadir="Añadir nombre" ayuda="El primero se usa en la descripción de la página." />
      </Seccion>
      <Seccion titulo="Datos clave"><EditorPares etiqueta="Datos clave" valores={d.claves} onChange={v => set('claves', v)} /></Seccion>
      <Seccion titulo="Datos" abierta={false}>
        <EditorPares etiqueta="Tabla de datos" valores={d.datos} onChange={v => set('datos', v)} />
        <Texto etiqueta="Fuente" valor={d.fuente} onChange={v => set('fuente', v)} maxLength={500} />
      </Seccion>
      <Seccion titulo="Cómo funciona" abierta={false}><EditorLineas etiqueta="Párrafos" valores={d.como} onChange={v => set('como', v)} filas={4} anadir="Añadir párrafo" /></Seccion>
      <Seccion titulo="Tipos" abierta={false} nota="Opcional: variedades del accesorio."><EditorPares etiqueta="Tipos" valores={d.tipos} onChange={v => set('tipos', v)} a="Tipo" b="Descripción" /></Seccion>
      <Seccion titulo="Ventajas y límites" abierta={false}>
        <EditorLineas etiqueta="Ventajas" valores={d.pros} onChange={v => set('pros', v)} filas={2} anadir="Añadir ventaja" />
        <EditorLineas etiqueta="Límites" valores={d.contras} onChange={v => set('contras', v)} filas={2} anadir="Añadir límite" />
      </Seccion>
      <Seccion titulo="Modelos reales" abierta={false}>
        <EditorPares etiqueta="Modelos" valores={d.modelos} onChange={v => set('modelos', v)} a="Modelo" b="Nota (opcional)" anadir="Añadir modelo" />
      </Seccion>
      <Seccion titulo="En airsoft" abierta={false}><Texto etiqueta="Texto" valor={d.airsoft} onChange={v => set('airsoft', v)} filas={4} maxLength={4000} /></Seccion>
      <Seccion titulo="Constructor 3D" abierta={false} nota="Se conserva por si se reactiva el constructor.">
        <EditorLineas etiqueta="Ids de piezas 3D" valores={d.piezas3d} onChange={v => set('piezas3d', v)} filas={1} anadir="Añadir pieza" />
      </Seccion>
      <Seccion titulo="Se monta en" abierta={d.modo === 'editar'}>
        <RelArmas etiqueta="Variantes que lo admiten" armas={armas} seleccion={d.variantes} onChange={v => set('variantes', v)} />
      </Seccion>
    </FormEditor>
  );
}

/* ═════════════ Término del glosario ═════════════ */
export function EditorTermino({ inicial }: { inicial: FormTermino }) {
  const { d, set, setId } = useDatos(inicial);
  const campo = d.grupo === 'En las réplicas de airsoft' ? 'el texto «Réplica airsoft» de las armas' : d.grupo === 'En miras y accesorios' ? 'el texto de las fichas de accesorios' : 'el campo «Sistema / cerrojo» de las armas';
  return (
    <FormEditor accion={guardarTerminoAccion} datos={d} cancelar={cancelarA('glosario', d)} etiqueta={d.modo === 'crear' ? 'Crear término' : 'Guardar cambios'}>
      <Seccion titulo="Término">
        <div className="admgrid">
          <Texto etiqueta="Nombre" valor={d.nombre} onChange={v => set('nombre', v)} requerido maxLength={200} />
          {campoId(d.modo, d.id, setId)}
          <Seleccion etiqueta="Grupo" valor={d.grupo} onChange={v => set('grupo', v)} opciones={[...GRUPOS_SISTEMA]} />
          <Texto etiqueta="Sigla" valor={d.sigla} onChange={v => set('sigla', v)} maxLength={40} />
          <Texto etiqueta="Apodo" valor={d.apodo} onChange={v => set('apodo', v)} maxLength={120} />
          <Numero etiqueta="Orden" valor={d.orden} onChange={v => set('orden', v)} ayuda="0 en uno nuevo = al final." />
        </div>
        <Texto etiqueta="Explicación corta" valor={d.corto} onChange={v => set('corto', v)} filas={2} requerido maxLength={800} ayuda="Es la que aparece en las notas de las fichas." />
        <Texto etiqueta="Detalle" valor={d.detalle} onChange={v => set('detalle', v)} filas={6} maxLength={6000} />
      </Seccion>
      <Seccion titulo="Detección automática" nota={`El término se enlaza cuando su expresión aparece en ${campo}.`}>
        <div className="admgrid">
          <Texto etiqueta="Expresión regular" valor={d.patron} onChange={v => set('patron', v)} mono requerido maxLength={400} />
          <Seleccion etiqueta="Indicadores" valor={d.patronFlags} onChange={v => set('patronFlags', v as '' | 'i')} opciones={[['', 'Distingue mayúsculas (siglas)'], ['i', 'Sin distinguir mayúsculas (i)']]} />
        </div>
        <ProbadorPatron patron={d.patron} flags={d.patronFlags} />
      </Seccion>
    </FormEditor>
  );
}
