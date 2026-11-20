'use client';

import { useActionState } from 'react';
import { iniciarSesion, type EstadoLogin } from '../acciones';

export default function FormLogin({ next }: { next: string }) {
  const [estado, accion, pendiente] = useActionState<EstadoLogin, FormData>(iniciarSesion, undefined);
  return (
    <form action={accion} className="admform">
      <input type="hidden" name="next" value={next} />
      <label className="admcampo">
        <span>Usuario</span>
        <input name="usuario" type="text" autoComplete="username" autoCapitalize="none" spellCheck={false} required autoFocus />
      </label>
      <label className="admcampo">
        <span>Contraseña</span>
        <input name="password" type="password" autoComplete="current-password" required />
      </label>
      {estado?.error && <p className="admerror" role="alert">{estado.error}</p>}
      <button className="primary" type="submit" disabled={pendiente}>{pendiente ? 'Comprobando…' : 'Entrar'}</button>
    </form>
  );
}
