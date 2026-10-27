// src/islas/resenas.jsx · pestaña "Reseñas" del detalle del producto.
// El detalle se reutiliza para todos los productos: la misma raíz de React
// se vuelve a dibujar con el producto que se abrió.
import "../App.css";
import { createRoot } from "react-dom/client";
import Resenas from "../components/Resenas.jsx";

const raices = new WeakMap();

export function mostrarResenas(elemento, props) {
  if (!raices.has(elemento)) raices.set(elemento, createRoot(elemento));
  raices.get(elemento).render(<Resenas key={props.productoId} {...props} />);
}
