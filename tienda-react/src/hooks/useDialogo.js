// src/hooks/useDialogo.js
// Conecta un <dialog> nativo con el estado de React:
// abierto = true lo muestra (con fondo oscuro, Esc y foco atrapado); false lo cierra.
import { useEffect, useRef } from "react";

export function useDialogo(abierto, alCerrar) {
  const ref = useRef(null);

  useEffect(() => {
    const dialogo = ref.current;
    if (abierto && !dialogo.open) dialogo.showModal();
    if (!abierto && dialogo.open) dialogo.close();
  }, [abierto]);

  useEffect(() => {
    const dialogo = ref.current;
    // "close" ocurre con Esc o con dialog.close(): avisamos al padre
    const cerrar = () => alCerrar();
    // Clic en el fondo oscuro (fuera del contenido) también cierra
    const clicFuera = (e) => {
      if (e.target === dialogo) dialogo.close();
    };
    dialogo.addEventListener("close", cerrar);
    dialogo.addEventListener("click", clicFuera);
    return () => {
      dialogo.removeEventListener("close", cerrar);
      dialogo.removeEventListener("click", clicFuera);
    };
  }, [alCerrar]);

  return ref;
}
