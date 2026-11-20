'use client';

import Link from 'next/link';
import { useActionState, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import type { Specs } from '@/catalogo/tipos';
import type { EstadoGuardado } from '@/admin/entidades';
import type { ArmaConVariantes, OpcionRel, Par } from '@/admin/tipos';
import { IconArrowDown, IconArrowUp, IconCheck, IconClose, IconPlus } from '@/components/icons';

/* ───────── Campos sencillos ───────── */
export function Campo({ etiqueta, ayuda, children, className = '' }: { etiqueta: string; ayuda?: ReactNode; children: ReactNode; className?: string }) {
  return (
    <label className={`admcampo ${className}`}>
      <span>{etiqueta}</span>
      {children}
      {ayuda && <small>{ayuda}</small>}
    </label>
  );
}

interface TextoProps { etiqueta: string; valor: string; onChange: (v: string) => void; ayuda?: ReactNode; filas?: number; mono?: boolean; soloLectura?: boolean; placeholder?: string; maxLength?: number; className?: string; requerido?: boolean }
export function Texto({ etiqueta, valor, onChange, ayuda, filas, mono, soloLectura, placeholder, maxLength, className, requerido }: TextoProps) {
  const comun = { value: valor, readOnly: soloLectura, placeholder, maxLength, required: requerido, className: mono ? 'mono' : undefined };
  return (
    <Campo etiqueta={etiqueta} ayuda={ayuda} className={className}>
      {filas ? <textarea rows={filas} {...comun} onChange={e => onChange(e.target.value)} /> : <input type="text" {...comun} onChange={e => onChange(e.target.value)} />}
    </Campo>
  );
}

export function Numero({ etiqueta, valor, onChange, ayuda }: { etiqueta: string; valor: number; onChange: (v: number) => void; ayuda?: ReactNode }) {
  return (
    <Campo etiqueta={etiqueta} ayuda={ayuda}>
      <input type="number" min={0} step={1} inputMode="numeric" value={Number.isFinite(valor) ? valor : 0} onChange={e => onChange(Math.max(0, Math.floor(Number(e.target.value) || 0)))} />
    </Campo>
  );
}

export function Seleccion({ etiqueta, valor, onChange, opciones, ayuda }: { etiqueta: string; valor: string; onChange: (v: string) => void; opciones: (string | [string, string])[]; ayuda?: ReactNode }) {
  return (
    <Campo etiqueta={etiqueta} ayuda={ayuda}>
      <select value={valor} onChange={e => onChange(e.target.value)}>
        {!opciones.some(o => (typeof o === 'string' ? o : o[0]) === valor) && <option value={valor}>{valor || '— elige —'}</option>}
        {opciones.map(o => { const [v, t] = typeof o === 'string' ? [o, o] : o; return <option key={v} value={v}>{t}</option>; })}
      </select>
    </Campo>
  );
}

export function Casilla({ etiqueta, valor, onChange, ayuda }: { etiqueta: string; valor: boolean; onChange: (v: boolean) => void; ayuda?: ReactNode }) {
  return (
    <label className="admcheck">
      <input type="checkbox" checked={valor} onChange={e => onChange(e.target.checked)} />
      <span>{etiqueta}{ayuda && <small>{ayuda}</small>}</span>
    </label>
  );
}

export function Seccion({ titulo, nota, abierta = true, children }: { titulo: string; nota?: ReactNode; abierta?: boolean; children: ReactNode }) {
  return (
    <details className="admsec" open={abierta}>
      <summary><b>{titulo}</b>{nota && <small>{nota}</small>}</summary>
      <div className="admsec-cuerpo">{children}</div>
    </details>
  );
}

/* ───────── Listas editables ───────── */
function Mini({ onClick, etiqueta, children, desactivado }: { onClick: () => void; etiqueta: string; children: ReactNode; desactivado?: boolean }) {
  return <button type="button" className="admmini" onClick={onClick} aria-label={etiqueta} title={etiqueta} disabled={desactivado}>{children}</button>;
}
const mover = <T,>(a: T[], i: number, d: -1 | 1): T[] => { const j = i + d; if (j < 0 || j >= a.length) return a; const c = [...a]; [c[i], c[j]] = [c[j], c[i]]; return c; };

export function Acciones<T>({ i, lista, onChange }: { i: number; lista: T[]; onChange: (a: T[]) => void }) {
  return (
    <span className="admfila-acc">
      <Mini etiqueta="Subir" onClick={() => onChange(mover(lista, i, -1))} desactivado={i === 0}><IconArrowUp /></Mini>
      <Mini etiqueta="Bajar" onClick={() => onChange(mover(lista, i, 1))} desactivado={i === lista.length - 1}><IconArrowDown /></Mini>
      <Mini etiqueta="Quitar" onClick={() => onChange(lista.filter((_, k) => k !== i))}><IconClose /></Mini>
    </span>
  );
}

/** Lista de textos (párrafos o frases): una caja por elemento. */
export function EditorLineas({ etiqueta, valores, onChange, filas = 3, ayuda, anadir = 'Añadir' }: { etiqueta: string; valores: string[]; onChange: (v: string[]) => void; filas?: number; ayuda?: ReactNode; anadir?: string }) {
  return (
    <fieldset className="admlista">
      <legend>{etiqueta}</legend>
      {ayuda && <p className="admayuda">{ayuda}</p>}
      {valores.map((v, i) => (
        <div className="admfila" key={i}>
          <textarea rows={filas} value={v} aria-label={`${etiqueta}, elemento ${i + 1}`} onChange={e => onChange(valores.map((x, k) => (k === i ? e.target.value : x)))} />
          <Acciones i={i} lista={valores} onChange={onChange} />
        </div>
      ))}
      <button type="button" className="ghost sm" onClick={() => onChange([...valores, ''])}><IconPlus />{anadir}</button>
    </fieldset>
  );
}

/** Lista de pares (etiqueta, valor). */
export function EditorPares({ etiqueta, valores, onChange, a = 'Etiqueta', b = 'Valor', ayuda, anadir = 'Añadir fila' }: { etiqueta: string; valores: Par[]; onChange: (v: Par[]) => void; a?: string; b?: string; ayuda?: ReactNode; anadir?: string }) {
  const set = (i: number, k: 0 | 1, v: string) => onChange(valores.map((p, j) => (j === i ? (k === 0 ? [v, p[1]] : [p[0], v]) : p)) as Par[]);
  return (
    <fieldset className="admlista">
      <legend>{etiqueta}</legend>
      {ayuda && <p className="admayuda">{ayuda}</p>}
      {valores.map((p, i) => (
        <div className="admfila par" key={i}>
          <input type="text" value={p[0]} placeholder={a} aria-label={`${etiqueta}, ${a.toLowerCase()} ${i + 1}`} onChange={e => set(i, 0, e.target.value)} />
          <textarea rows={2} value={p[1]} placeholder={b} aria-label={`${etiqueta}, ${b.toLowerCase()} ${i + 1}`} onChange={e => set(i, 1, e.target.value)} />
          <Acciones i={i} lista={valores} onChange={onChange} />
        </div>
      ))}
      <button type="button" className="ghost sm" onClick={() => onChange([...valores, ['', '']])}><IconPlus />{anadir}</button>
    </fieldset>
  );
}

/* ───────── Datos técnicos (Specs) ───────── */
const CAMPOS_SPECS: [keyof Specs, string, number?][] = [
  ['calibre', 'Calibre'], ['peso', 'Peso'], ['cañon', 'Cañón'], ['sistema', 'Sistema / cerrojo', 2], ['cadencia', 'Cadencia'],
  ['velocidad', 'Velocidad inicial'], ['alcance', 'Alcance eficaz'], ['cargador', 'Cargador'], ['airsoft', 'Réplica airsoft', 3], ['extra', 'Notas', 3], ['fuente', 'Fuente'],
];
export function EditorSpecs({ valor, onChange }: { valor: Specs; onChange: (s: Specs) => void }) {
  return (
    <div className="admgrid">
      {CAMPOS_SPECS.map(([k, t, filas]) => (
        <Texto key={k} etiqueta={t} valor={valor[k] ?? ''} filas={filas} className={filas ? 'ancho' : ''} onChange={v => onChange({ ...valor, [k]: v })} />
      ))}
    </div>
  );
}

/* ───────── Relaciones ───────── */
/** Casillas con buscador, agrupadas si las opciones traen grupo. */
export function ListaChecks({ etiqueta, opciones, seleccion, onChange, ayuda }: { etiqueta: string; opciones: OpcionRel[]; seleccion: string[]; onChange: (s: string[]) => void; ayuda?: ReactNode }) {
  const [q, setQ] = useState('');
  const sel = useMemo(() => new Set(seleccion), [seleccion]);
  const visibles = opciones.filter(o => !q || o.label.toLowerCase().includes(q.toLowerCase()));
  const grupos = useMemo(() => { const m = new Map<string, OpcionRel[]>(); for (const o of visibles) m.set(o.grupo ?? '', [...(m.get(o.grupo ?? '') ?? []), o]); return [...m]; }, [visibles]);
  const alternar = (id: string) => onChange(sel.has(id) ? seleccion.filter(x => x !== id) : [...seleccion, id]);
  return (
    <fieldset className="admlista">
      <legend>{etiqueta} <span className="admcuenta">({seleccion.length} de {opciones.length})</span></legend>
      {ayuda && <p className="admayuda">{ayuda}</p>}
      {opciones.length > 8 && <input type="search" className="admbuscar" placeholder="Buscar…" value={q} onChange={e => setQ(e.target.value)} aria-label={`Buscar en ${etiqueta}`} />}
      <div className="admchecks">
        {grupos.map(([g, items]) => (
          <div key={g} className="admchecks-grupo">
            {g && <b>{g}</b>}
            {items.map(o => <label key={o.id} className="admcheck"><input type="checkbox" checked={sel.has(o.id)} onChange={() => alternar(o.id)} /><span>{o.label}</span></label>)}
          </div>
        ))}
        {!visibles.length && <p className="admayuda">Sin coincidencias.</p>}
      </div>
    </fieldset>
  );
}

/** Variantes de arma por arma (para relacionar un cartucho o un accesorio con las armas que lo usan). */
export function RelArmas({ etiqueta, armas, seleccion, onChange, ayuda }: { etiqueta: string; armas: ArmaConVariantes[]; seleccion: number[]; onChange: (s: number[]) => void; ayuda?: ReactNode }) {
  const [q, setQ] = useState('');
  const sel = useMemo(() => new Set(seleccion), [seleccion]);
  const visibles = armas.filter(a => !q || a.nombre.toLowerCase().includes(q.toLowerCase()));
  const alternar = (id: number) => onChange(sel.has(id) ? seleccion.filter(x => x !== id) : [...seleccion, id]);
  const todas = (a: ArmaConVariantes, marcar: boolean) => { const ids = a.variantes.map(v => v.dbId); onChange(marcar ? [...new Set([...seleccion, ...ids])] : seleccion.filter(x => !ids.includes(x))); };
  return (
    <fieldset className="admlista">
      <legend>{etiqueta} <span className="admcuenta">({seleccion.length} variantes)</span></legend>
      {ayuda && <p className="admayuda">{ayuda}</p>}
      {armas.length > 8 && <input type="search" className="admbuscar" placeholder="Buscar arma…" value={q} onChange={e => setQ(e.target.value)} aria-label="Buscar arma" />}
      <div className="admchecks">
        {visibles.map(a => {
          const n = a.variantes.filter(v => sel.has(v.dbId)).length;
          return (
            <div key={a.id} className="admchecks-grupo">
              <b>{a.nombre} <button type="button" className="admenlace" onClick={() => todas(a, n < a.variantes.length)}>{n < a.variantes.length ? 'marcar todas' : 'quitar todas'}</button></b>
              {a.variantes.map(v => <label key={v.dbId} className="admcheck"><input type="checkbox" checked={sel.has(v.dbId)} onChange={() => alternar(v.dbId)} /><span>{v.nombre}</span></label>)}
            </div>
          );
        })}
        {!visibles.length && <p className="admayuda">Sin coincidencias.</p>}
      </div>
    </fieldset>
  );
}

/** Comprueba la expresión regular en vivo y deja probarla con un texto. */
export function ProbadorPatron({ patron, flags }: { patron: string; flags: string }) {
  const [muestra, setMuestra] = useState('');
  let re: RegExp | null = null, error = '';
  if (patron) { try { re = new RegExp(patron, flags); } catch (e) { error = (e as Error).message.replace(/^Invalid regular expression: /, ''); } }
  return (
    <div className="admprobador">
      {error && <p className="admerror" role="alert">Expresión no válida: {error}</p>}
      {re && (
        <>
          <Campo etiqueta="Probar con un texto" ayuda="Pega aquí un calibre o un texto de ficha para ver si la expresión lo reconoce.">
            <input type="text" value={muestra} onChange={e => setMuestra(e.target.value)} />
          </Campo>
          {muestra && <p className={re.test(muestra) ? 'admok' : 'admno'}>{re.test(muestra) ? <><IconCheck />Coincide</> : <><IconClose />No coincide</>}</p>}
        </>
      )}
    </div>
  );
}

/* ───────── Formulario con guardado ───────── */
export function FormEditor({ accion, datos, children, etiqueta = 'Guardar cambios', cancelar }: {
  accion: (prev: EstadoGuardado, fd: FormData) => Promise<EstadoGuardado>; datos: unknown; children: ReactNode; etiqueta?: string; cancelar: string;
}) {
  const [estado, enviar, pendiente] = useActionState(accion, undefined);
  const json = JSON.stringify(datos);
  const [inicial] = useState(json);
  const sucio = json !== inicial;
  const aviso = useRef<HTMLDivElement>(null);
  useEffect(() => { if (estado) aviso.current?.scrollIntoView({ block: 'center', behavior: 'smooth' }); }, [estado]);
  useEffect(() => {
    if (!sucio || pendiente) return;
    const f = (e: BeforeUnloadEvent) => { e.preventDefault(); };
    window.addEventListener('beforeunload', f);
    return () => window.removeEventListener('beforeunload', f);
  }, [sucio, pendiente]);
  return (
    <form action={enviar} className="admedit">
      <input type="hidden" name="json" value={json} />
      <div ref={aviso} tabIndex={-1}>
        {(estado?.errores?.length || estado?.mensaje) && (
          <div className="admerror" role="alert">
            {estado.mensaje && <p>{estado.mensaje}</p>}
            {estado.errores && <><p><b>Revisa estos datos:</b></p><ul>{estado.errores.map(e => <li key={e}>{e}</li>)}</ul></>}
          </div>
        )}
      </div>
      {children}
      <div className="admguardar">
        <button className="primary" type="submit" disabled={pendiente}>{pendiente ? 'Guardando…' : etiqueta}</button>
        <Link className="ghost" href={cancelar}>Cancelar</Link>
        {sucio && !pendiente && <span className="admsucio">Cambios sin guardar</span>}
      </div>
    </form>
  );
}
