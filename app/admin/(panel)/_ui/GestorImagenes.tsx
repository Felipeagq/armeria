'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState, useTransition } from 'react';
import type { DatosImagenForm, ImagenAdmin, ResImagen, TipoImg } from '@/admin/tipos';
import { reducirImagen } from '@/admin/reducir';
import { agregarImagenExterna, archivarImagen, editarImagen, ordenarGaleria } from '../acciones-imagenes';
import { Seccion, Seleccion, Texto } from './campos';
import { IconArrowDown, IconArrowUp } from '@/components/icons';

const vacio = (hayPrincipal: boolean): DatosImagenForm => ({ alt: '', rol: hayPrincipal ? 'galeria' : 'principal', ajuste: '', tipoFoto: '', titulo: '', autor: '', licencia: '', licenciaUrl: '', fuenteUrl: '' });
const aForm = (i: ImagenAdmin): DatosImagenForm => ({ alt: i.alt, rol: i.rol, ajuste: i.ajuste, tipoFoto: i.tipoFoto, titulo: i.titulo, autor: i.autor, licencia: i.licencia, licenciaUrl: i.licenciaUrl, fuenteUrl: i.fuenteUrl });

type Aviso = { ok: boolean; textos: string[] } | null;

/** Campos comunes de una imagen: texto alternativo, rol, ajuste (solo armas) y créditos. */
function CamposImagen({ valor, onChange, tipo }: { valor: DatosImagenForm; onChange: (v: DatosImagenForm) => void; tipo: TipoImg }) {
  const set = <K extends keyof DatosImagenForm>(k: K, v: DatosImagenForm[K]) => onChange({ ...valor, [k]: v });
  return (
    <div className="admimg-campos">
      <Texto etiqueta="Texto alternativo" valor={valor.alt} onChange={v => set('alt', v)} requerido maxLength={300} ayuda="Descripción breve para lectores de pantalla y por si la imagen no carga." />
      <div className="admgrid">
        <Seleccion etiqueta="Rol" valor={valor.rol} onChange={v => set('rol', v as DatosImagenForm['rol'])} opciones={[['galeria', 'Galería'], ['principal', 'Principal (la foto grande)']]}
          ayuda="Una nueva principal sustituye a la actual, que pasa a la galería." />
        {tipo === 'arma' && (
          <>
            <Seleccion etiqueta="Ajuste de la principal" valor={valor.ajuste} onChange={v => set('ajuste', v as DatosImagenForm['ajuste'])} opciones={[['', 'Sin definir'], ['cutout', 'Recorte sobre fondo liso'], ['scene', 'Foto con escenario']]} />
            <Seleccion etiqueta="Qué muestra" valor={valor.tipoFoto} onChange={v => set('tipoFoto', v as DatosImagenForm['tipoFoto'])} opciones={[['', 'Sin definir'], ['real', 'Arma real'], ['airsoft', 'Réplica de airsoft']]} />
          </>
        )}
      </div>
      <Seccion titulo="Créditos y licencia" abierta={false} nota="Opcional; se muestra en el pie de foto.">
        <div className="admgrid">
          <Texto etiqueta="Pie de foto" valor={valor.titulo} onChange={v => set('titulo', v)} maxLength={300} />
          <Texto etiqueta="Autor" valor={valor.autor} onChange={v => set('autor', v)} maxLength={300} />
          <Texto etiqueta="Licencia" valor={valor.licencia} onChange={v => set('licencia', v)} maxLength={300} ayuda="p. ej. CC BY-SA 4.0" />
          <Texto etiqueta="Enlace de la licencia" valor={valor.licenciaUrl} onChange={v => set('licenciaUrl', v)} maxLength={1000} />
          <Texto etiqueta="Enlace de la fuente" valor={valor.fuenteUrl} onChange={v => set('fuenteUrl', v)} maxLength={1000} className="ancho" />
        </div>
      </Seccion>
    </div>
  );
}

/* ───────── Tarjeta de una imagen ───────── */
interface TarjetaProps {
  img: ImagenAdmin; tipo: TipoImg; posicion?: number; total?: number; ocupado: boolean;
  onMover: (d: -1 | 1) => void; onPrincipal: () => void; onQuitar: () => void; onGuardar: (url: string, d: DatosImagenForm) => void;
}
function Tarjeta({ img, tipo, posicion, total, ocupado, onMover, onPrincipal, onQuitar, onGuardar }: TarjetaProps) {
  const [d, setD] = useState<DatosImagenForm>(aForm(img));
  const [url, setUrl] = useState(img.url);
  const [rota, setRota] = useState(false);
  const principal = img.rol === 'principal';
  return (
    <li className={`admimg ${principal ? 'principal' : ''}`}>
      <div className="admimg-foto">
        {rota ? <span className="admimg-rota">No se pudo cargar la imagen</span> : <img src={img.url} alt={img.alt} loading="lazy" decoding="async" onError={() => setRota(true)} />}
      </div>
      <div className="admimg-cuerpo">
        <p className="admimg-alt">{img.alt || <i>Sin texto alternativo</i>}</p>
        <p className="admetiquetas">
          {principal && <i className="aviso">Principal</i>}
          <i>{img.origen === 's3' ? 'Subida (S3)' : 'Enlace externo'}</i>
          {img.tipoFoto && <i>{img.tipoFoto === 'real' ? 'Arma real' : 'Réplica'}</i>}
          {img.ajuste && <i>{img.ajuste === 'cutout' ? 'Recorte' : 'Escenario'}</i>}
        </p>
        <div className="admimg-acc">
          {!principal && <>
            <button type="button" className="admmini" aria-label="Subir en la galería" title="Subir" disabled={ocupado || posicion === 0} onClick={() => onMover(-1)}><IconArrowUp /></button>
            <button type="button" className="admmini" aria-label="Bajar en la galería" title="Bajar" disabled={ocupado || posicion === (total ?? 1) - 1} onClick={() => onMover(1)}><IconArrowDown /></button>
            <button type="button" className="ghost sm" disabled={ocupado} onClick={onPrincipal}>Hacer principal</button>
          </>}
          <button type="button" className="ghost sm admpeligro" disabled={ocupado} onClick={onQuitar}>Quitar</button>
        </div>
        <details className="admimg-edit">
          <summary>Editar datos</summary>
          {img.origen === 'externo' && <Texto etiqueta="Enlace de la imagen" valor={url} onChange={setUrl} maxLength={1000} mono />}
          <CamposImagen valor={d} onChange={setD} tipo={tipo} />
          <button type="button" className="primary" disabled={ocupado} onClick={() => onGuardar(url, d)}>Guardar datos de la imagen</button>
        </details>
      </div>
    </li>
  );
}

/* ───────── Añadir: subir archivo o enlazar ───────── */
function FormAnadir({ tipo, id, hayPrincipal, ocupado, onResultado }: { tipo: TipoImg; id: string; hayPrincipal: boolean; ocupado: boolean; onResultado: (r: ResImagen, texto: string) => void }) {
  const [modo, setModo] = useState<'subir' | 'enlace'>('subir');
  const [d, setD] = useState<DatosImagenForm>(vacio(hayPrincipal));
  const [archivo, setArchivo] = useState<File | null>(null);
  const [vista, setVista] = useState('');
  const [enlace, setEnlace] = useState('');
  const [trabajando, setTrabajando] = useState('');
  const [claveInput, setClaveInput] = useState(0);
  const [pendiente, empezar] = useTransition();

  // La vista previa es una URL temporal: se libera al cambiarla y al desmontar
  useEffect(() => () => { if (vista) URL.revokeObjectURL(vista); }, [vista]);
  const elegir = (f: File | null) => { setArchivo(f); setVista(f ? URL.createObjectURL(f) : ''); };

  const reiniciar = () => { setD(vacio(true)); elegir(null); setEnlace(''); setClaveInput(k => k + 1); };

  async function subir() {
    if (!archivo) return onResultado({ ok: false, errores: ['Elige un archivo de imagen.'] }, '');
    try {
      setTrabajando('Preparando la imagen…');
      const blob = await reducirImagen(archivo);
      setTrabajando('Subiendo…');
      const fd = new FormData();
      fd.set('archivo', blob, 'imagen');
      fd.set('datos', JSON.stringify({ tipo, entidadId: id, ...d }));
      const r = await fetch('/admin/api/imagenes/', { method: 'POST', body: fd });
      const j = (await r.json().catch(() => ({}))) as { ok?: boolean; error?: string };
      if (r.status === 401) return onResultado({ ok: false, errores: ['La sesión ha caducado: vuelve a iniciar sesión (en otra pestaña) y repite la subida.'] }, '');
      if (!r.ok || !j.ok) return onResultado({ ok: false, errores: [j.error ?? `Error ${r.status} al subir la imagen.`] }, '');
      reiniciar();
      onResultado({ ok: true }, 'Imagen subida y publicada.');
    } catch (e) {
      onResultado({ ok: false, errores: [(e as Error).message || 'No se pudo subir la imagen.'] }, '');
    } finally { setTrabajando(''); }
  }

  const enlazar = () => empezar(async () => {
    const r = await agregarImagenExterna({ tipo, entidadId: id, url: enlace, ...d });
    if (r.ok) reiniciar();
    onResultado(r, 'Enlace añadido y publicado.');
  });

  const ocupadoTodo = ocupado || pendiente || !!trabajando;
  return (
    <section className="admimg-nueva">
      <h3>Añadir una imagen</h3>
      <div className="admtabs" role="tablist">
        <button type="button" role="tab" aria-selected={modo === 'subir'} className={modo === 'subir' ? 'activo' : ''} onClick={() => setModo('subir')}>Subir archivo</button>
        <button type="button" role="tab" aria-selected={modo === 'enlace'} className={modo === 'enlace' ? 'activo' : ''} onClick={() => setModo('enlace')}>Enlace externo</button>
      </div>
      <form onSubmit={e => { e.preventDefault(); if (modo === 'subir') void subir(); else enlazar(); }} className="admimg-form">
        {modo === 'subir'
          ? (
            <>
              <label className="admcampo">
                <span>Archivo</span>
                <input key={claveInput} type="file" accept="image/jpeg,image/png,image/webp" onChange={e => elegir(e.target.files?.[0] ?? null)} />
                <small>JPG, PNG o WebP. Se reduce a 2400 px y se limpian los metadatos antes de subirla; máximo 5 MB. Se guarda en el bucket privado y se sirve desde este sitio.</small>
              </label>
              {vista && <img className="admimg-vista" src={vista} alt="Vista previa del archivo elegido" />}
            </>
          )
          : (
            <>
              <Texto etiqueta="Enlace de la imagen" valor={enlace} onChange={setEnlace} maxLength={1000} mono placeholder="https://…" requerido
                ayuda="Debe empezar por https://. La imagen se queda en el otro sitio: si lo borran, dejará de verse." />
              {/^https:\/\/\S+\.\S+/.test(enlace) && <img className="admimg-vista" src={enlace} alt="Vista previa del enlace" referrerPolicy="no-referrer" onError={e => { e.currentTarget.style.display = 'none'; }} />}
            </>
          )}
        <CamposImagen valor={d} onChange={setD} tipo={tipo} />
        <div className="admguardar-simple">
          <button type="submit" className="primary" disabled={ocupadoTodo || (modo === 'subir' ? !archivo : !enlace)}>{trabajando || (pendiente ? 'Añadiendo…' : modo === 'subir' ? 'Subir imagen' : 'Añadir enlace')}</button>
        </div>
      </form>
    </section>
  );
}

/* ───────── Gestor ───────── */
export function GestorImagenes({ tipo, id, imagenes }: { tipo: TipoImg; id: string; imagenes: ImagenAdmin[] }) {
  const router = useRouter();
  const [aviso, setAviso] = useState<Aviso>(null);
  const [ocupado, empezar] = useTransition();
  const activas = imagenes.filter(i => !i.archivada);
  const principal = activas.find(i => i.rol === 'principal');
  const galeria = activas.filter(i => i.rol === 'galeria');
  const archivadas = imagenes.filter(i => i.archivada);

  const resultado = (r: ResImagen, texto: string) => {
    setAviso(r.ok ? { ok: true, textos: [texto] } : { ok: false, textos: r.errores });
    if (r.ok) router.refresh();
  };
  const lanzar = (f: () => Promise<ResImagen>, texto: string) => empezar(async () => resultado(await f(), texto));

  const mover = (i: number, d: -1 | 1) => {
    const ids = galeria.map(g => g.id);
    [ids[i], ids[i + d]] = [ids[i + d], ids[i]];
    lanzar(() => ordenarGaleria({ tipo, entidadId: id, ids }), 'Orden de la galería guardado.');
  };
  // Solo las imágenes externas envían su enlace: el de una subida (/img/…) lo fija el servidor y no se puede cambiar
  const enlaceDe = (img: ImagenAdmin, url: string) => (img.origen === 'externo' ? url : '');
  const guardar = (img: ImagenAdmin, url: string, d: DatosImagenForm) => lanzar(() => editarImagen({ imagenId: img.id, url: enlaceDe(img, url), ...d }), 'Datos de la imagen guardados.');
  const hacerPrincipal = (img: ImagenAdmin) => lanzar(() => editarImagen({ imagenId: img.id, url: enlaceDe(img, img.url), ...aForm(img), rol: 'principal' }), 'Ahora es la imagen principal; la anterior pasó a la galería.');
  const quitar = (img: ImagenAdmin) => {
    if (!confirm('¿Quitar esta imagen de la ficha?\n\nSe archiva: dejará de verse en el sitio y podrás restaurarla desde «Imágenes archivadas».')) return;
    lanzar(() => archivarImagen(img.id, true), 'Imagen archivada.');
  };
  const huella = (i: ImagenAdmin) => [i.id, i.rol, i.url, i.alt, i.ajuste, i.tipoFoto, i.titulo, i.autor, i.licencia, i.licenciaUrl, i.fuenteUrl].join('|');

  return (
    <section className="admimgs" aria-labelledby="h-imagenes">
      <h2 id="h-imagenes">Imágenes <span className="admcuenta">({activas.length})</span></h2>
      <p className="admayuda">Los cambios de imágenes se guardan y publican al instante, sin pulsar «Guardar cambios». La principal es la foto grande de la ficha; el resto forman la galería.</p>
      <div aria-live="polite">
        {aviso && <div className={aviso.ok ? 'admaviso' : 'admerror'} role={aviso.ok ? 'status' : 'alert'}>{aviso.textos.map(t => <p key={t}>{t}</p>)}</div>}
      </div>

      {activas.length === 0 && <p className="admaviso">Esta ficha todavía no tiene imágenes.</p>}
      {principal && !galeria.length && <p className="admayuda">Solo hay imagen principal; la galería está vacía.</p>}
      {!principal && activas.length > 0 && <p className="admaviso">No hay imagen principal: la ficha se ve sin foto grande. Usa «Hacer principal» en una de la galería.</p>}

      <ul className="admimg-grid">
        {principal && <Tarjeta key={huella(principal)} img={principal} tipo={tipo} ocupado={ocupado} onMover={() => {}} onPrincipal={() => {}} onQuitar={() => quitar(principal)} onGuardar={(u, d) => guardar(principal, u, d)} />}
        {galeria.map((g, i) => (
          <Tarjeta key={huella(g)} img={g} tipo={tipo} posicion={i} total={galeria.length} ocupado={ocupado} onMover={d => mover(i, d)} onPrincipal={() => hacerPrincipal(g)} onQuitar={() => quitar(g)} onGuardar={(u, d) => guardar(g, u, d)} />
        ))}
      </ul>

      <FormAnadir tipo={tipo} id={id} hayPrincipal={!!principal} ocupado={ocupado} onResultado={resultado} />

      {archivadas.length > 0 && (
        <details className="admimg-archivadas">
          <summary>Imágenes archivadas ({archivadas.length})</summary>
          <ul>
            {archivadas.map(i => (
              <li key={i.id}>
                <img src={i.url} alt="" loading="lazy" width={64} height={44} />
                <span>{i.alt}</span>
                <button type="button" className="ghost sm" disabled={ocupado} onClick={() => lanzar(() => archivarImagen(i.id, false), 'Imagen restaurada.')}>Restaurar</button>
              </li>
            ))}
          </ul>
        </details>
      )}
    </section>
  );
}
