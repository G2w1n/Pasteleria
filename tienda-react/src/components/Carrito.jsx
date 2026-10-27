// src/components/Carrito.jsx
// Drawer de Bootstrap 6 con el carrito de la práctica. Todo llega por props desde App.
import { useDialogo } from "../hooks/useDialogo.js";
import { soles } from "../utilidades.js";

export default function Carrito({ abierto, items, total, onCerrar, onCambiar, onVaciar }) {
  const ref = useDialogo(abierto, onCerrar);
  return (
    <dialog ref={ref} className="drawer drawer-end carrito" aria-labelledby="tituloCarritoReact">
      <div className="drawer-header">
        <h2 className="drawer-title fs-xl" id="tituloCarritoReact">Tu carrito</h2>
        <button className="btn-close" type="button" onClick={() => ref.current.close()} aria-label="Cerrar carrito" />
      </div>
      <div className="drawer-body">
        {items.length === 0 ? (
          <div className="carrito-vacio">
            <i className="bi bi-bag-heart" aria-hidden="true" />
            <p className="fw-semibold mb-0">Tu carrito está vacío</p>
          </div>
        ) : (
          <ul className="list-group list-group-flush">
            {items.map(({ producto: p, cantidad }) => (
              <li key={p.id} className="list-group-item item-carrito">
                <div className="item-media"><img src={p.imagen} alt="" /></div>
                <div className="item-info">
                  <p className="item-nombre">{p.nombre}</p>
                  <p className="item-precio">{soles(p.precio)} c/u</p>
                  <div className="cantidad cantidad-sm" role="group" aria-label={`Cantidad de ${p.nombre}`}>
                    <button className="btn btn-subtle theme-secondary btn-icon btn-sm" type="button" onClick={() => onCambiar(p.id, -1)} aria-label={`Restar uno de ${p.nombre}`}>
                      <i className="bi bi-dash" aria-hidden="true" />
                    </button>
                    <span className="cantidad-valor">{cantidad}</span>
                    <button className="btn btn-subtle theme-secondary btn-icon btn-sm" type="button" onClick={() => onCambiar(p.id, 1)} disabled={cantidad >= p.stock} aria-label={`Sumar uno de ${p.nombre}`}>
                      <i className="bi bi-plus" aria-hidden="true" />
                    </button>
                  </div>
                </div>
                <div className="item-total"><span>{soles(p.precio * cantidad)}</span></div>
              </li>
            ))}
          </ul>
        )}
      </div>
      {items.length > 0 && (
        <div className="drawer-footer carrito-pie">
          <dl className="totales">
            <div className="fila-total"><dt>Total</dt><dd>{soles(total)}</dd></div>
          </dl>
          {/* Extensión opcional de la práctica: setCarrito([]) */}
          <button className="btn btn-outline theme-secondary w-100" type="button" onClick={onVaciar}>Vaciar carrito</button>
        </div>
      )}
    </dialog>
  );
}
