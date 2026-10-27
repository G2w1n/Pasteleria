// src/islas/envivo.jsx · franja "Hoy en Kuyay" en index.html
import "../App.css";
import { createRoot } from "react-dom/client";
import EnVivo from "../components/EnVivo.jsx";

export function montarEnVivo(elemento, props) {
  createRoot(elemento).render(<EnVivo {...props} />);
}
