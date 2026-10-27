import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
// Estilos de la tienda principal (Bootstrap 6 se carga en index.html)
import "../../css/estilos.css";
import "./index.css";
import App from "./App.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
