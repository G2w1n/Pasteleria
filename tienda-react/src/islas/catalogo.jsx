// src/islas/catalogo.jsx
import "../App.css";
// "Isla" de React dentro de catalogo.html (página de Bootstrap).
// La página (js/tienda.js) llama a montarCatalogo() y le pasa los datos y funciones.
// El carrito sigue siendo el de la tienda: React lo escucha con el evento "kuyay:carrito".
import { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import Catalogo from "../components/Catalogo.jsx";

function leerCarrito() {
  try {
    return JSON.parse(localStorage.getItem("kuyay-carrito")) ?? [];
  } catch {
    return [];
  }
}

function CatalogoConectado(props) {
  // [{ id, cantidad }] del carrito de la tienda
  const [carrito, setCarrito] = useState(leerCarrito);

  useEffect(() => {
    const alCambiar = (e) => setCarrito(e.detail);
    document.addEventListener("kuyay:carrito", alCambiar);
    return () => document.removeEventListener("kuyay:carrito", alCambiar);
  }, []);

  const cantidadEnCarrito = (id) => carrito.find((it) => it.id === id)?.cantidad ?? 0;
  return <Catalogo {...props} cantidadEnCarrito={cantidadEnCarrito} sincronizarURL />;
}

export function montarCatalogo(elemento, props) {
  createRoot(elemento).render(<CatalogoConectado {...props} />);
}
