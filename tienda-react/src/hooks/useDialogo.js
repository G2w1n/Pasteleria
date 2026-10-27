// src/hooks/useDialogo.js
// Conecta un <dialog> nativo (Dialog y Drawer de Bootstrap 6) con el estado de React:
// abierto = true lo muestra con fondo oscuro, Esc y foco atrapado; false lo cierra.
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
    const cerrar = () => alCerrar(); // "close" ocurre con Esc o con dialog.close()
    const clicFuera = (e) => e.target === dialogo && dialogo.close(); // clic en el fondo
    dialogo.addEventListener("close", cerrar);
    dialogo.addEventListener("click", clicFuera);
    return () => {
      dialogo.removeEventListener("close", cerrar);
      dialogo.removeEventListener("click", clicFuera);
    };
  }, [alCerrar]);

  return ref;
}
