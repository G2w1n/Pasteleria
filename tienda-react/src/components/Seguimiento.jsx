// src/components/Seguimiento.jsx
// "Sigue tu pedido" sin cuenta: código (KY-000123 o TP-00012) + celular.
import { useState } from "react";
import { soles } from "../utilidades.js";

const NOMBRE_ESTADO = {
  recibido: "Recibido",
  en_preparacion: "En preparación",
  listo: "Listo para recoger",
  en_camino: "En camino",
  entregado: "Entregado",
  cancelado: "Cancelado",
};
const PASOS = {
  recojo: ["recibido", "en_preparacion", "listo", "entregado"],
  delivery: ["recibido", "en_preparacion", "en_camino", "entregado"],
};
const fecha = (iso) => new Intl.DateTimeFormat("es-PE", { day: "numeric", month: "long", hour: "numeric", minute: "2-digit", timeZone: "America/Lima" }).format(new Date(iso));
const diaCorto = (iso) => new Intl.DateTimeFormat("es-PE", { weekday: "short", day: "numeric", month: "short", timeZone: "UTC" }).format(new Date(`${iso}T12:00:00Z`));

export default function Seguimiento({ codigoInicial = "", api }) {
  const [codigo, setCodigo] = useState(codigoInicial);
  const [telefono, setTelefono] = useState("");
  const [estado, setEstado] = useState({ cargando: false, error: "", pedido: null });

  const buscar = async (e) => {
    e.preventDefault();
    setEstado({ cargando: true, error: "", pedido: null });
    try {
      const { pedido } = await api(`pedidos?codigo=${encodeURIComponent(codigo.trim())}&telefono=${encodeURIComponent(telefono)}`);
      setEstado({ cargando: false, error: "", pedido });
    } catch (error) {
      setEstado({ cargando: false, error: error.message, pedido: null });
    }
  };

  const { pedido } = estado;
  const pasos = pedido ? PASOS[pedido.tipo_entrega] ?? PASOS.recojo : [];
  const actual = pedido ? pasos.indexOf(pedido.estado) : -1;

  return (
    <div className="card seguimiento">
      <div className="card-body">
        <h2 className="fs-xl mb-1"><i className="bi bi-geo-alt" aria-hidden="true" /> Sigue tu pedido</h2>
        <p className="fg-2 mb-4">¿Pediste sin cuenta? Escribe el código que te dimos y tu celular.</p>
        <form className="seguimiento-form" onSubmit={buscar} noValidate>
          <div className="form-floating">
            <label htmlFor="segCodigo">Código (KY-… o TP-…)</label>
            <input className="form-control" id="segCodigo" placeholder=" " required value={codigo}
                   onChange={(e) => setCodigo(e.target.value.toUpperCase())} autoComplete="off" />
          </div>
          <div className="form-floating">
            <label htmlFor="segTelefono">Celular</label>
            <input className="form-control" id="segTelefono" type="tel" inputMode="numeric" maxLength="9" placeholder=" " required
                   value={telefono} onChange={(e) => setTelefono(e.target.value.replace(/\D/g, ""))} autoComplete="tel-national" />
          </div>
          <button className="btn btn-solid theme-primary btn-lg" type="submit" disabled={estado.cargando}>
            {estado.cargando ? <span className="spinner-border spinner-sm" aria-hidden="true" /> : <i className="bi bi-search" aria-hidden="true" />} Buscar
          </button>
        </form>

        <div aria-live="polite">
          {estado.error && <div className="alert theme-danger mt-4 mb-0" role="alert">{estado.error}</div>}
          {pedido && (
            <div className="seguimiento-resultado">
              <header className="pedido-cabecera">
                <h3 className="fs-lg mb-0">{pedido.codigo}</h3>
                <span className={`badge ${pedido.estado === "cancelado" ? "theme-secondary" : pedido.estado === "entregado" ? "theme-success" : "theme-accent"}`}>
                  {NOMBRE_ESTADO[pedido.estado]}
                </span>
                <span className="fg-3 fs-sm pedido-fecha">Pedido el {fecha(pedido.creado_en)}</span>
              </header>
              {pedido.estado === "cancelado" ? (
                <p className="pedido-cancelado"><i className="bi bi-x-circle" aria-hidden="true" /> Este pedido fue cancelado.</p>
              ) : (
                <ol className="stepper stepper-horizontal pedido-seguimiento" aria-label={`Seguimiento del pedido ${pedido.codigo}`}>
                  {pasos.map((paso, i) => (
                    <li key={paso} className={`stepper-item ${i <= actual ? "active" : ""}`} aria-current={i === actual ? "step" : undefined}>
                      {NOMBRE_ESTADO[paso]}
                    </li>
                  ))}
                </ol>
              )}
              {pedido.especial ? (
                <p className="mb-2">Torta personalizada {pedido.tamano} · entrega el <b>{pedido.fecha_entrega}</b> en la {pedido.franja === "manana" ? "mañana" : "tarde"}.</p>
              ) : (
                <ul className="pedido-productos">
                  {pedido.productos.map((p) => <li key={p.nombre}><span>{p.cantidad} × {p.nombre}</span></li>)}
                </ul>
              )}
              <p className="pedido-total">
                <span className="fg-3 fs-sm">
                  {pedido.tipo_entrega === "delivery" ? `Delivery${pedido.distrito ? ` a ${pedido.distrito}` : ""}` : "Recojo en tienda"}
                  {!pedido.especial && pedido.fecha_entrega && ` · ${diaCorto(pedido.fecha_entrega)}, ${pedido.franja === "manana" ? "mañana" : "tarde"}`}
                </span>
                <strong>{soles(pedido.total)}</strong>
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
