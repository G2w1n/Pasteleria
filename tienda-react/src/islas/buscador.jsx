// src/islas/buscador.jsx · buscador del menú, en todas las páginas de la tienda
import "../App.css";
import { createRoot } from "react-dom/client";
import Buscador from "../components/Buscador.jsx";

export function montarBuscador(elemento, props) {
  createRoot(elemento).render(<Buscador {...props} />);
}
