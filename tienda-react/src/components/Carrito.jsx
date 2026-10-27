// src/components/Carrito.jsx
// Panel lateral con el detalle del carrito. No guarda estado propio:
// todo llega por props desde App (el estado está "elevado" al padre).
import { useDialogo } from "../hooks/useDialogo.js";
import { MINIMO_DESCUENTO, NEGOCIO, PORCENTAJE_DESCUENTO, soles } from "../utilidades.js";

function mensajeWhatsApp(items, t) {
  return [
    `¡Hola ${NEGOCIO.nombre}! Quisiera hacer este pedido:`,
    "",
    ...items.map(({ producto, cantidad }) => `• ${cantidad} × ${producto.nombre} — ${soles(producto.precio * cantidad)}`),
    "",
    `Subtotal: ${soles(t.subtotal)}`,
    ...(t.descuento > 0 ? [`Descuento ${PORCENTAJE_DESCUENTO} %: −${soles(t.descuento)}`] : []),
    `*Total: ${soles(t.total)}*`,
  ].join("\n");
}

export default function Carrito({ abierto, items, totales, onCerrar, onCambiar, onQuitar, onVaciar }) {
  const ref = useDialogo(abierto, onCerrar);
  const vacio = items.length === 0;
  const avance = Math.min((totales.subtotal / MINIMO_DESCUENTO) * 100, 100);

  const vaciar = () => {
    if (confirm("¿Vaciar el carrito?")) onVaciar();
  };

  return (
    <dialog ref={ref} className="panel" aria-labelledby="tituloCarrito">
      <div className="panel-cab">
        <h2 id="tituloCarrito">Tu carrito</h2>
        <button type="button" className="cerrar" onClick={() => ref.current.close()} aria-label="Cerrar carrito">×</button>
      </div>

      {vacio ? (
        <div className="panel-vacio">
          <p className="vacio-icono" aria-hidden="true">🛍️</p>
          <p><b>Tu carrito está vacío</b></p>
          <p>Agrega algo dulce del catálogo.</p>
          <button type="button" className="boton" onClick={() => ref.current.close()}>Ver catálogo</button>
        </div>
      ) : (
        <>
          <ul className="items">
            {items.map(({ producto: p, cantidad }) => (
              <li key={p.id} className="item">
                <img src={p.imagen} alt="" width="72" height="54" />
                <div className="item-info">
                  <p className="item-nombre">{p.nombre}</p>
                  <p className="item-precio">{soles(p.precio)} c/u</p>
                  <div className="cantidad" role="group" aria-label={`Cantidad de ${p.nombre}`}>
                    <button type="button" onClick={() => onCambiar(p.id, -1)} aria-label={`Quitar uno de ${p.nombre}`}>−</button>
                    <span aria-live="polite">{cantidad}</span>
                    <button type="button" onClick={() => onCambiar(p.id, 1)} disabled={cantidad >= p.stock}
                            aria-label={`Agregar uno de ${p.nombre}`}>+</button>
                  </div>
                </div>
                <div className="item-total">
                  <b>{soles(p.precio * cantidad)}</b>
                  <button type="button" className="boton-texto" onClick={() => onQuitar(p.id)}>Quitar</button>
                </div>
              </li>
            ))}
          </ul>

          <div className="panel-pie">
            <div className={`meta ${totales.descuento > 0 ? "lograda" : ""}`}>
              <p>
                {totales.descuento > 0
                  ? <>🎉 ¡Tienes <b>{PORCENTAJE_DESCUENTO} % de descuento</b>!</>
                  : <>Te faltan <b>{soles(Math.max(MINIMO_DESCUENTO - totales.subtotal, 0.01))}</b> para el {PORCENTAJE_DESCUENTO} % de descuento</>}
              </p>
              <div className="meta-pista" aria-hidden="true"><div style={{ width: `${avance}%` }} /></div>
            </div>
            <dl className="totales">
              <div><dt>Subtotal</dt><dd>{soles(totales.subtotal)}</dd></div>
              {totales.descuento > 0 && <div className="descuento"><dt>Descuento</dt><dd>−{soles(totales.descuento)}</dd></div>}
              <div className="total"><dt>Total</dt><dd>{soles(totales.total)}</dd></div>
            </dl>
            <a className="boton boton-whatsapp boton-grande" target="_blank" rel="noopener noreferrer"
               href={`https://wa.me/${NEGOCIO.whatsapp}?text=${encodeURIComponent(mensajeWhatsApp(items, totales))}`}>
              Pedir por WhatsApp
            </a>
            <button type="button" className="boton-texto" onClick={vaciar}>Vaciar carrito</button>
          </div>
        </>
      )}
    </dialog>
  );
}
