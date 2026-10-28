// src/components/panel/Pedidos.jsx · pedidos por atender (administrador y empleado)
// Se actualiza solo cada 30 segundos. Cada cambio de estado lo ve el cliente en "Mis pedidos".
import { useCallback, useEffect, useState } from "react";
import { soles } from "../../utilidades.js";

export const NOMBRE_ESTADO = {
  recibido: "Recibido",
  en_preparacion: "En preparación",
  listo: "Listo",
  en_camino: "En camino",
  entregado: "Entregado",
  cancelado: "Cancelado",
};
const TEMA = { recibido: "theme-accent", en_preparacion: "theme-primary", listo: "theme-success", en_camino: "theme-success", entregado: "theme-secondary", cancelado: "theme-secondary" };

// El siguiente paso depende de si es recojo o delivery
const siguiente = (p) =>
  ({ recibido: "en_preparacion", en_preparacion: p.tipo_entrega === "delivery" ? "en_camino" : "listo", listo: "entregado", en_camino: "entregado" })[p.estado];

const dia = (iso) => new Intl.DateTimeFormat("es-PE", { weekday: "short", day: "numeric", month: "short", timeZone: "UTC" }).format(new Date(`${iso}T12:00:00Z`));
const hora = (iso) => new Intl.DateTimeFormat("es-PE", { day: "numeric", month: "short", hour: "numeric", minute: "2-digit", timeZone: "America/Lima" }).format(new Date(iso));

export default function Pedidos({ api }) {
  const [datos, setDatos] = useState(null);
  const [filtro, setFiltro] = useState("activos");
  const [todos, setTodos] = useState(false);
  const [ocupado, setOcupado] = useState(null);
  const [mensaje, setMensaje] = useState("");

  const cargar = useCallback(() => api(`admin?recurso=pedidos${todos ? "&todos=1" : ""}`).then(setDatos).catch((e) => setMensaje(e.message)), [api, todos]);

  useEffect(() => {
    cargar();
    const reloj = setInterval(cargar, 30000);
    return () => clearInterval(reloj);
  }, [cargar]);

  const cambiar = async (pedido, estado, especial = false) => {
    if (estado === "cancelado" && !confirm(`¿Cancelar el pedido ${pedido.codigo}? Los productos vuelven al stock.`)) return;
    setOcupado(pedido.codigo);
    try {
      await api("admin?recurso=pedidos", { metodo: "POST", datos: { id: pedido.id, estado, especial } });
      setMensaje(`${pedido.codigo}: ${NOMBRE_ESTADO[estado]}`);
      await cargar();
    } catch (e) {
      setMensaje(e.message);
    } finally {
      setOcupado(null);
    }
  };

  if (!datos) return <p className="fg-3"><span className="spinner-border spinner-sm" aria-hidden="true" /> Cargando pedidos…</p>;
  const contar = (estado) => datos.pedidos.filter((p) => p.estado === estado).length;
  const visibles = datos.pedidos.filter((p) => filtro === "activos" || p.estado === filtro);

  return (
    <div className="panel-pedidos">
      <div className="panel-barra">
        <div className="chips-estado" role="group" aria-label="Filtrar por estado">
          {["activos", "recibido", "en_preparacion", "listo", "en_camino", ...(todos ? ["entregado", "cancelado"] : [])].map((e) => (
            <button key={e} type="button" className={`chip ${filtro === e ? "active" : ""}`} aria-pressed={filtro === e} onClick={() => setFiltro(e)}>
              {e === "activos" ? "Todos" : NOMBRE_ESTADO[e]} <span className="fg-3">{e === "activos" ? datos.pedidos.length : contar(e)}</span>
            </button>
          ))}
        </div>
        <div className="d-flex align-items-center gap-3">
          <div className="switch"><input type="checkbox" role="switch" id="verTodos" checked={todos} onChange={(e) => setTodos(e.target.checked)} /></div>
          <label htmlFor="verTodos" className="fs-sm">Incluir entregados (3 días)</label>
          <button type="button" className="btn btn-text btn-sm" onClick={cargar}><i className="bi bi-arrow-clockwise" aria-hidden="true" /> Actualizar</button>
        </div>
      </div>
      <p className="visually-hidden" role="status">{mensaje}</p>

      {visibles.length === 0 ? (
        <div className="sin-resultados"><i className="bi bi-cup-hot" aria-hidden="true" /><p className="fw-semibold mb-0">No hay pedidos aquí.</p></div>
      ) : (
        <div className="tarjetas-pedido">
          {visibles.map((p) => (
            <article key={p.id} className={`card pedido-admin estado-${p.estado}`}>
              <div className="card-body">
                <header className="pedido-cabecera">
                  <h3 className="fs-lg mb-0">{p.codigo}</h3>
                  <span className={`badge ${TEMA[p.estado]}`}>{NOMBRE_ESTADO[p.estado]}</span>
                  <span className="fg-3 fs-sm pedido-fecha">{hora(p.creado_en)} · {p.canal}</span>
                </header>
                <p className="mb-1"><b>{p.nombre_contacto}</b> · <a href={`https://wa.me/51${p.telefono}`} target="_blank" rel="noopener noreferrer">{p.telefono}</a></p>
                <p className="fs-sm fg-2 mb-2">
                  <i className={`bi ${p.tipo_entrega === "delivery" ? "bi-truck" : "bi-shop"}`} aria-hidden="true" />{" "}
                  {p.tipo_entrega === "delivery" ? `${p.distrito} · ${p.direccion}` : "Recojo en tienda"} · {p.metodo_pago}
                </p>
                {p.fecha_entrega && (
                  <p className="fs-sm fw-semibold mb-2">
                    <i className="bi bi-calendar-event" aria-hidden="true" /> Entregar el {dia(p.fecha_entrega)} · {p.franja === "manana" ? "mañana" : "tarde"}
                  </p>
                )}
                <ul className="pedido-productos">{p.productos.map((x) => <li key={x.nombre}><span>{x.cantidad} × {x.nombre}</span></li>)}</ul>
                {p.notas && <p className="pedido-notas"><i className="bi bi-chat-left-text" aria-hidden="true" /> {p.notas}</p>}
                <div className="pedido-acciones">
                  <strong>{soles(p.total)}</strong>
                  {siguiente(p) && (
                    <button type="button" className="btn btn-solid theme-primary btn-sm" disabled={ocupado === p.codigo} onClick={() => cambiar(p, siguiente(p))}>
                      {ocupado === p.codigo ? <span className="spinner-border spinner-sm" aria-hidden="true" /> : <i className="bi bi-arrow-right-circle" aria-hidden="true" />}
                      {" "}Pasar a {NOMBRE_ESTADO[siguiente(p)].toLowerCase()}
                    </button>
                  )}
                  {!["entregado", "cancelado"].includes(p.estado) && (
                    <button type="button" className="btn btn-text btn-sm" disabled={ocupado === p.codigo} onClick={() => cambiar(p, "cancelado")}>Cancelar</button>
                  )}
                </div>
              </div>
            </article>
          ))}
        </div>
      )}

      <h2 className="titulo-seccion fs-2xl mt-7">Tortas personalizadas</h2>
      {datos.especiales.length === 0 ? <p className="fg-3">No hay tortas por entregar.</p> : (
        <div className="table-responsive">
          <table className="table table-hover align-middle">
            <thead><tr><th scope="col">Código</th><th scope="col">Entrega</th><th scope="col">Cliente</th><th scope="col">Torta</th><th scope="col">Precio</th><th scope="col">Estado</th></tr></thead>
            <tbody>
              {datos.especiales.map((t) => (
                <tr key={t.id}>
                  <td><b>{t.codigo}</b></td>
                  <td>{t.fecha_entrega} · {t.franja === "manana" ? "mañana" : "tarde"}</td>
                  <td>{t.nombre_contacto}<br /><span className="fg-3 fs-sm">{t.telefono}</span></td>
                  <td className="fs-sm">{t.tamano} · {t.bizcocho} · {t.relleno} · {t.cobertura}{t.mensaje ? ` · “${t.mensaje}”` : ""}</td>
                  <td>{soles(t.precio)}</td>
                  <td>
                    <label className="visually-hidden" htmlFor={`estado-${t.id}`}>Estado de {t.codigo}</label>
                    <select id={`estado-${t.id}`} className="form-control form-control-sm" value={t.estado} onChange={(e) => cambiar(t, e.target.value, true)}>
                      {["recibido", "en_preparacion", "listo", "en_camino", "entregado", "cancelado"].map((e) => <option key={e} value={e}>{NOMBRE_ESTADO[e]}</option>)}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
