// src/hooks/useLocalStorage.js
// Hook propio: funciona como useState, pero el valor se guarda en localStorage
// y se recupera al recargar la página (carrito y tema).
import { useEffect, useState } from "react";

export function useLocalStorage(clave, valorInicial) {
  // La función dentro de useState se ejecuta UNA sola vez, al iniciar
  const [valor, setValor] = useState(() => {
    try {
      const guardado = localStorage.getItem(clave);
      return guardado !== null ? JSON.parse(guardado) : valorInicial;
    } catch {
      return valorInicial; // dato corrupto o almacenamiento bloqueado
    }
  });

  // Cada vez que cambia el valor, se guarda
  useEffect(() => {
    try {
      localStorage.setItem(clave, JSON.stringify(valor));
    } catch {
      // modo privado: funciona, pero no se recuerda al recargar
    }
  }, [clave, valor]);

  return [valor, setValor];
}
