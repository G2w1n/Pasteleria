// src/components/panel/ResenasAdmin.jsx · moderar reseñas (solo administrador)
import { useEffect, useState } from "react";

const fecha = (iso) => new Intl.DateTimeFormat("es-PE", { day: "numeric", month: "short", year: "numeric" }).format(new Date(iso));

export default function ResenasAdmin({ api }) {
  const [resenas, setResenas] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    api("admin?recurso=resenas").then((d) => setResenas(d.resenas)).catch((e) => setError(e.message));
  }, [api]);

  const alternar = async (r) => {
    try {
      const { resena } = await api("admin?recurso=resenas", { metodo: "POST", datos: { id: r.id, visible: !r.visible } });
      setResenas((lista) => lista.map((x) => (x.id === resena.id ? { ...x, visible: resena.visible } : x)));
    } catch (e) {
      setError(e.message);
    }
  };

  if (error) return <div className="alert theme-danger">{error}</div>;
  if (!resenas) return <p className="fg-3"><span className="spinner-border spinner-sm" aria-hidden="true" /> Cargando reseñas…</p>;
  if (resenas.length === 0) return <p className="fg-3">Todavía no hay reseñas.</p>;
  return (
    <ul className="resenas-admin">
      {resenas.map((r) => (
        <li key={r.id} className={`card ${r.visible ? "" : "fila-inactiva"}`}>
          <div className="card-body">
            <div className="resena-cabecera">
              <b>{r.producto}</b>
              <span className="resenas-estrellas" aria-label={`${r.estrellas} de 5 estrellas`}>{"★".repeat(r.estrellas)}{"☆".repeat(5 - r.estrellas)}</span>
              <span className="fg-3 fs-sm">{r.cliente} · {fecha(r.creado_en)}</span>
              <button type="button" className={`btn btn-sm ms-auto ${r.visible ? "btn-outline theme-secondary" : "btn-solid theme-primary"}`} onClick={() => alternar(r)}>
                <i className={`bi ${r.visible ? "bi-eye-slash" : "bi-eye"}`} aria-hidden="true" /> {r.visible ? "Ocultar" : "Mostrar"}
              </button>
            </div>
            {r.comentario && <p className="mb-0">{r.comentario}</p>}
          </div>
        </li>
      ))}
    </ul>
  );
}
