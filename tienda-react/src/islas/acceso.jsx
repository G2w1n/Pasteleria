// src/islas/acceso.jsx · Ingresar / Crear cuenta en cuenta.html
import "../App.css";
import { createRoot } from "react-dom/client";
import Acceso from "../components/acceso/Acceso.jsx";

let raiz = null;
let vez = 0;

// Se puede volver a llamar (por ejemplo, al cerrar sesión): empieza de cero
export function montarAcceso(elemento, props) {
  raiz ??= createRoot(elemento);
  raiz.render(<Acceso key={vez++} {...props} />);
}
