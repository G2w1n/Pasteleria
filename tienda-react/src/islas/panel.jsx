// src/islas/panel.jsx · panel de administración en admin.html
import "../App.css";
import { createRoot } from "react-dom/client";
import PanelAdmin from "../components/panel/PanelAdmin.jsx";

export function montarPanel(elemento, props) {
  createRoot(elemento).render(<PanelAdmin {...props} />);
}
