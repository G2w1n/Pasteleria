// src/components/panel/Resumen.jsx · reportes (solo administrador)
import { useEffect, useState } from "react";
import GraficoBarras from "./GraficoBarras.jsx";
import { soles } from "../../utilidades.js";

const diaCorto = (iso) => new Intl.DateTimeFormat("es-PE", { day: "numeric", month: "short", timeZone: "UTC" }).format(new Date(`${iso}T00:00:00Z`));

function Indicador({ icono, titulo, valor, detalle }) {
  return (
    <div className="card indicador">
      <div className="card-body">
        <span className="indicador-icono" aria-hidden="true"><i className={`bi ${icono}`} /></span>
        <p className="indicador-titulo">{titulo}</p>
        <p className="indicador-valor">{valor}</p>
        {detalle && <p className="indicador-detalle">{detalle}</p>}
      </div>
    </div>
  );
}

export default function Resumen({ api }) {
  const [datos, setDatos] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    api("admin?recurso=resumen").then(setDatos).catch((e) => setError(e.message));
  }, [api]);

  if (error) return <div className="alert theme-danger">{error}</div>;
  if (!datos) return <p className="fg-3"><span className="spinner-border spinner-sm" aria-hidden="true" /> Cargando reportes…</p>;
  const r = datos.resumen;

  return (
    <div className="panel-resumen">
      <div className="indicadores">
        <Indicador icono="bi-cash-coin" titulo="Ventas de hoy" valor={soles(r.ventas_hoy)} detalle={`${r.pedidos_hoy} pedidos`} />
        <Indicador icono="bi-calendar-week" titulo="Esta semana" valor={soles(r.ventas_semana)} />
        <Indicador icono="bi-calendar3" titulo="Este mes" valor={soles(r.ventas_mes)} detalle={`Ticket promedio ${soles(r.ticket_promedio_mes)}`} />
        <Indicador icono="bi-hourglass-split" titulo="Pedidos por atender" valor={r.pedidos_pendientes} />
      </div>

      <div className="graficos">
        <div className="card grafico-ancho"><div className="card-body">
          <GraficoBarras titulo="Ventas de los últimos 30 días" formato={soles}
                         datos={datos.diarias.map((d) => ({ etiqueta: diaCorto(d.fecha), valor: d.total, detalle: `${d.pedidos} pedidos` }))} />
        </div></div>
        <div className="card"><div className="card-body">
          <GraficoBarras titulo="Productos más vendidos (unidades)" horizontal
                         datos={datos.productos.map((p) => ({ etiqueta: p.nombre, valor: p.unidades }))} />
        </div></div>
        <div className="card"><div className="card-body">
          <GraficoBarras titulo="Ventas por categoría" horizontal formato={soles}
                         datos={datos.categorias.map((c) => ({ etiqueta: c.nombre, valor: c.ingresos }))} />
        </div></div>
        <div className="card"><div className="card-body">
          <GraficoBarras titulo="Pedidos por hora del día" etiquetaEje={(d) => d.etiqueta}
                         datos={datos.horas.map((h) => ({ etiqueta: `${h.hora}:00`, valor: h.pedidos, detalle: "pedidos" }))} />
        </div></div>
        <div className="card"><div className="card-body">
          <GraficoBarras titulo="Delivery por distrito" horizontal formato={soles}
                         datos={datos.distritos.map((d) => ({ etiqueta: d.distrito, valor: d.total }))} />
        </div></div>
        <div className="card"><div className="card-body">
          <h3 className="fs-md">Stock bajo</h3>
          {datos.stockBajo.length === 0 ? <p className="fg-3 fs-sm mb-0">Todo el stock está bien.</p> : (
            <ul className="lista-simple">
              {datos.stockBajo.map((p) => (
                <li key={p.id}>
                  <span><i className={`bi ${p.stock === 0 ? "bi-x-octagon fg-danger" : "bi-exclamation-triangle aviso-stock"}`} aria-hidden="true" /> {p.nombre}</span>
                  <b>{p.stock === 0 ? "Agotado" : `${p.stock} (mín. ${p.stock_minimo})`}</b>
                </li>
              ))}
            </ul>
          )}
        </div></div>
        <div className="card"><div className="card-body">
          <h3 className="fs-md">Mejores clientes</h3>
          {datos.clientes.length === 0 ? <p className="fg-3 fs-sm mb-0">Aún no hay compras con cuenta.</p> : (
            <ol className="lista-simple">
              {datos.clientes.map((c) => <li key={c.nombre}><span>{c.nombre} · {c.pedidos} pedidos</span><b>{soles(c.total_gastado)}</b></li>)}
            </ol>
          )}
        </div></div>
      </div>
    </div>
  );
}
