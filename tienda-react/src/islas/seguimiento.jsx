// src/islas/seguimiento.jsx · "Sigue tu pedido" en cuenta.html
import "../App.css";
import { createRoot } from "react-dom/client";
import Seguimiento from "../components/Seguimiento.jsx";

export function montarSeguimiento(elemento, props) {
  createRoot(elemento).render(<Seguimiento {...props} />);
}
