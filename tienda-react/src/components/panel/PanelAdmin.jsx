// src/components/panel/PanelAdmin.jsx
// Panel de la tienda con pestañas (Nav underline de Bootstrap 6).
// Las pestañas dependen del rol: el empleado ve pedidos y productos.
import { useState } from "react";
import Resumen from "./Resumen.jsx";
import Pedidos from "./Pedidos.jsx";
import Productos from "./Productos.jsx";
import Usuarios from "./Usuarios.jsx";
import ResenasAdmin from "./ResenasAdmin.jsx";

const PESTANAS = [
  { id: "resumen", texto: "Reportes", icono: "bi-graph-up", roles: ["administrador"] },
  { id: "pedidos", texto: "Pedidos", icono: "bi-receipt", roles: ["administrador", "empleado"] },
  { id: "productos", texto: "Productos y stock", icono: "bi-box-seam", roles: ["administrador", "empleado"] },
  { id: "usuarios", texto: "Usuarios", icono: "bi-people", roles: ["administrador"] },
  { id: "resenas", texto: "Reseñas", icono: "bi-star", roles: ["administrador"] },
];

export default function PanelAdmin({ usuario, api }) {
  const mias = PESTANAS.filter((p) => p.roles.includes(usuario.rol));
  const inicial = mias.some((p) => p.id === location.hash.slice(1)) ? location.hash.slice(1) : mias[0].id;
  const [activa, setActiva] = useState(inicial);
  const esAdmin = usuario.rol === "administrador";

  const elegir = (id) => {
    setActiva(id);
    history.replaceState(null, "", `#${id}`);
  };
  // Flechas izquierda/derecha entre pestañas (patrón de pestañas accesibles)
  const teclas = (e) => {
    const i = mias.findIndex((p) => p.id === activa);
    if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
      const otra = mias[(i + (e.key === "ArrowRight" ? 1 : mias.length - 1)) % mias.length];
      elegir(otra.id);
      document.getElementById(`pestana-${otra.id}`)?.focus();
    }
  };

  return (
    <div className="panel-admin">
      <nav className="nav nav-underline panel-pestanas" role="tablist" aria-label="Secciones del panel" onKeyDown={teclas}>
        {mias.map((p) => (
          <button key={p.id} id={`pestana-${p.id}`} type="button" role="tab" className={`nav-link ${activa === p.id ? "active" : ""}`}
                  aria-selected={activa === p.id} aria-controls={`panel-${p.id}`} tabIndex={activa === p.id ? 0 : -1} onClick={() => elegir(p.id)}>
            <i className={`bi ${p.icono}`} aria-hidden="true" /> {p.texto}
          </button>
        ))}
      </nav>
      <div className="panel-contenido" id={`panel-${activa}`} role="tabpanel" aria-labelledby={`pestana-${activa}`} tabIndex={0}>
        <h2 className="visually-hidden">{mias.find((p) => p.id === activa).texto}</h2>
        {activa === "resumen" && <Resumen api={api} />}
        {activa === "pedidos" && <Pedidos api={api} />}
        {activa === "productos" && <Productos api={api} esAdmin={esAdmin} />}
        {activa === "usuarios" && <Usuarios api={api} yo={usuario.id} />}
        {activa === "resenas" && <ResenasAdmin api={api} />}
      </div>
    </div>
  );
}
