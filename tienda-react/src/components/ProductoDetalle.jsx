// src/components/ProductoDetalle.jsx · Dialog de Bootstrap 6 con el detalle (página de práctica)
import { useDialogo } from "../hooks/useDialogo.js";
import { soles } from "../utilidades.js";

export default function ProductoDetalle({ producto, onCerrar, onAgregar }) {
  const ref = useDialogo(producto !== null, onCerrar);
  return (
    <dialog ref={ref} className="dialog dialog-lg detalle" aria-labelledby="tituloDetalleReact">
      {producto && (
        <>
          <div className="dialog-header">
            <p className="producto-categoria mb-0">{producto.unidad}</p>
            <button className="btn-close" type="button" onClick={() => ref.current.close()} aria-label="Cerrar" />
          </div>
          <div className="dialog-body">
            <div className="row g-7">
              <div className="md:col-6"><img className="detalle-foto" src={producto.imagen} alt={producto.nombre} width="400" height="300" /></div>
              <div className="md:col-6 detalle-info">
                <h2 className="detalle-titulo" id="tituloDetalleReact">{producto.nombre}</h2>
                <p className="detalle-precio">{soles(producto.precio)}</p>
                <p className="fg-2">{producto.descripcion}</p>
                <p className="fs-sm"><b>Alérgenos:</b> {producto.alergenos.length ? producto.alergenos.join(", ") : "ninguno"}</p>
                <button className="btn btn-solid theme-primary" type="button" disabled={producto.stock === 0}
                        onClick={() => { onAgregar(producto); ref.current.close(); }}>
                  <i className="bi bi-bag-plus" aria-hidden="true" /> {producto.stock === 0 ? "Agotado" : "Agregar al carrito"}
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </dialog>
  );
}
