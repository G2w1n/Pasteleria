// src/components/acceso/BotonEnviar.jsx
// Botón que se transforma: texto → barra de carga → ✓ verde cuando todo salió bien.
export default function BotonEnviar({ estado = "listo", texto, textoCargando, textoHecho = "¡Listo!", className = "" }) {
  return (
    <button className={`btn btn-solid theme-primary btn-lg boton-enviar boton-${estado} ${className}`} type="submit"
            disabled={estado !== "listo"} aria-live="polite">
      {estado === "cargando" && <span className="boton-barra" aria-hidden="true" />}
      <span className="boton-contenido">
        {estado === "hecho" && <i className="bi bi-check-lg boton-check" aria-hidden="true" />}
        {estado === "cargando" ? textoCargando : estado === "hecho" ? textoHecho : texto}
      </span>
    </button>
  );
}
