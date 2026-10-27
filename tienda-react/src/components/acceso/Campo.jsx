// src/components/acceso/Campo.jsx
// Campo con etiqueta flotante (Form floating de Bootstrap 6) y validación EN VIVO:
// ✓ verde o ✗ rojo con su mensaje, que los lectores de pantalla también escuchan.
import { useId } from "react";

export default function Campo({ etiqueta, estado = "neutro", mensaje = "", children, accion }) {
  const id = useId();
  // children es una función: recibe los atributos de accesibilidad para el <input>
  const atributos = {
    id,
    placeholder: " ",
    "aria-invalid": estado === "error" ? "true" : undefined,
    "aria-describedby": mensaje ? `${id}-msg` : undefined,
    className: `form-control campo-control ${estado === "ok" ? "is-valid" : estado === "error" ? "is-invalid" : ""}`,
  };
  return (
    <div className={`campo campo-${estado}`}>
      <div className="form-floating">
        <label htmlFor={id}>{etiqueta}</label>
        {children(atributos)}
        <span className="campo-icono" aria-hidden="true">
          {estado === "ok" && <i className="bi bi-check-circle-fill" />}
          {estado === "error" && <i className="bi bi-x-circle-fill" />}
          {estado === "cargando" && <span className="spinner-border spinner-sm" />}
        </span>
        {accion}
      </div>
      <p className="campo-mensaje" id={`${id}-msg`} aria-live="polite">{mensaje}</p>
    </div>
  );
}
