// src/components/Aviso.jsx
// Mensaje flotante que desaparece solo a los 3 segundos (useEffect + setTimeout).
import { useEffect } from "react";

export default function Aviso({ aviso, onCerrar, onVerCarrito }) {
  useEffect(() => {
    if (!aviso) return;
    const reloj = setTimeout(onCerrar, 3000);
    return () => clearTimeout(reloj); // si llega otro aviso antes, se reinicia el tiempo
  }, [aviso, onCerrar]);

  return (
    <div className="avisos" role="status" aria-live="polite">
      {aviso && (
        <div key={aviso.id} className={`aviso aviso-${aviso.tipo}`}>
          <span>{aviso.texto}</span>
          {aviso.tipo === "exito" && <button type="button" className="boton-texto" onClick={onVerCarrito}>Ver carrito</button>}
          <button type="button" className="cerrar" onClick={onCerrar} aria-label="Cerrar aviso">×</button>
        </div>
      )}
    </div>
  );
}
