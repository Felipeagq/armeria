'use client';
import { useFormStatus } from 'react-dom';

/** Botón de envío con estado de espera (la generación con IA tarda decenas de segundos). */
export default function BotonIA({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <button className="primary" type="submit" disabled={pending} aria-busy={pending}>
      {pending ? <><span className="ph" aria-hidden /> Investigando… puede tardar hasta un minuto</> : label}
    </button>
  );
}
