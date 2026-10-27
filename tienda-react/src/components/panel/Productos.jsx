// src/components/panel/Productos.jsx · precios, stock y disponibilidad
// El empleado registra producción o merma; solo el administrador cambia precios.
import { useEffect, useState } from "react";
import { soles } from "../../utilidades.js";

function FilaProducto({ producto, esAdmin, onGuardar }) {
  const [precio, setPrecio] = useState(producto.precio);
  const [cantidad, setCantidad] = useState("");
  const [motivo, setMotivo] = useState("produccion");
  const bajo = producto.stock <= producto.stock_minimo;

  const moverStock = (e) => {
    e.preventDefault();
    const n = Number(cantidad);
    if (!n) return;
    onGuardar(producto, { movimiento: { cantidad: motivo === "produccion" ? Math.abs(n) : motivo === "merma" ? -Math.abs(n) : n, motivo } });
    setCantidad("");
  };

  return (
    <tr className={producto.activo ? "" : "fila-inactiva"}>
      <th scope="row">{producto.nombre}<br /><span className="fg-3 fs-xs fw-normal">{producto.categoria}</span></th>
      <td>
        {esAdmin ? (
          <form className="celda-precio" onSubmit={(e) => { e.preventDefault(); onGuardar(producto, { precio: Number(precio) }); }}>
            <label className="visually-hidden" htmlFor={`precio-${producto.id}`}>Precio de {producto.nombre}</label>
            <input id={`precio-${producto.id}`} className="form-control form-control-sm" type="number" min="0.5" step="0.5" value={precio} onChange={(e) => setPrecio(e.target.value)} />
            {Number(precio) !== producto.precio && <button className="btn btn-solid theme-primary btn-sm" type="submit">Guardar</button>}
          </form>
        ) : soles(producto.precio)}
      </td>
      <td>
        <span className={`badge ${producto.stock === 0 ? "theme-danger" : bajo ? "theme-warning" : "theme-success"}`}>{producto.stock}</span>
        <span className="fg-3 fs-xs"> mín. {producto.stock_minimo}</span>
      </td>
      <td>
        <form className="celda-stock" onSubmit={moverStock}>
          <label className="visually-hidden" htmlFor={`motivo-${producto.id}`}>Motivo</label>
          <select id={`motivo-${producto.id}`} className="form-control form-control-sm" value={motivo} onChange={(e) => setMotivo(e.target.value)}>
            <option value="produccion">+ Producción</option>
            <option value="merma">− Merma</option>
            <option value="ajuste">± Ajuste</option>
          </select>
          <label className="visually-hidden" htmlFor={`cantidad-${producto.id}`}>Cantidad</label>
          <input id={`cantidad-${producto.id}`} className="form-control form-control-sm" type="number" step="1" placeholder="Cant." value={cantidad} onChange={(e) => setCantidad(e.target.value)} />
          <button className="btn btn-outline theme-primary btn-sm" type="submit" disabled={!Number(cantidad)}>Registrar</button>
        </form>
      </td>
      <td>
        {esAdmin ? (
          <div className="switch">
            <input type="checkbox" role="switch" checked={producto.activo} aria-label={`${producto.nombre} a la venta`}
                   onChange={(e) => onGuardar(producto, { activo: e.target.checked })} />
          </div>
        ) : producto.activo ? "Sí" : "No"}
      </td>
    </tr>
  );
}

export default function Productos({ api, esAdmin }) {
  const [productos, setProductos] = useState(null);
  const [mensaje, setMensaje] = useState({ texto: "", error: false });

  useEffect(() => {
    api("admin?recurso=productos").then((d) => setProductos(d.productos)).catch((e) => setMensaje({ texto: e.message, error: true }));
  }, [api]);

  const guardar = async (producto, cambios) => {
    try {
      const { producto: nuevo } = await api("admin?recurso=productos", { metodo: "POST", datos: { id: producto.id, ...cambios } });
      setProductos((lista) => lista.map((p) => (p.id === nuevo.id ? { ...p, ...nuevo } : p)));
      setMensaje({ texto: `${producto.nombre}: guardado.`, error: false });
    } catch (e) {
      setMensaje({ texto: `${producto.nombre}: ${e.message}`, error: true });
    }
  };

  if (!productos) return <p className="fg-3"><span className="spinner-border spinner-sm" aria-hidden="true" /> Cargando productos…</p>;
  return (
    <div>
      <p className={`alert ${mensaje.error ? "theme-danger" : "theme-success"} py-2`} role="status" hidden={!mensaje.texto}>{mensaje.texto}</p>
      <div className="table-responsive">
        <table className="table table-hover align-middle tabla-productos">
          <caption className="fg-3 fs-sm">Los cambios se ven en la tienda en menos de un minuto.</caption>
          <thead><tr><th scope="col">Producto</th><th scope="col">Precio</th><th scope="col">Stock</th><th scope="col">Mover stock</th><th scope="col">A la venta</th></tr></thead>
          <tbody>{productos.map((p) => <FilaProducto key={p.id} producto={p} esAdmin={esAdmin} onGuardar={guardar} />)}</tbody>
        </table>
      </div>
    </div>
  );
}
