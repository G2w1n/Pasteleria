// src/components/ProductoDetalle.jsx
// Ventana con el detalle del producto. Tiene su propio estado (la cantidad),
// que se reinicia cada vez que se abre otro producto gracias a "key" en App.
import { useState } from "react";
import { useDialogo } from "../hooks/useDialogo.js";
import { soles } from "../utilidades.js";

export default function ProductoDetalle({ producto, enCarrito, onCerrar, onAgregar }) {
  const ref = useDialogo(producto !== null, onCerrar);
  const [cantidad, setCantidad] = useState(1);
  const disponibles = producto ? producto.stock - enCarrito : 0;

  return (
    <dialog ref={ref} className="detalle" aria-labelledby="tituloDetalle">
      {producto && (
        <div className="detalle-contenido">
          <button type="button" className="cerrar" onClick={() => ref.current.close()} aria-label="Cerrar">×</button>
          <img src={producto.imagen} alt={producto.nombre} width="400" height="300" />
          <div className="detalle-info">
            <span className="etiqueta">{producto.categoria}</span>
            <h2 id="tituloDetalle">{producto.nombre}</h2>
            <p className="detalle-precio">{soles(producto.precio)} <small>{producto.unidad}</small></p>
            <p>{producto.descripcion}</p>
            {producto.ingredientes.length > 0 && (
              <>
                <h3>Ingredientes</h3>
                <ul className="chips">{producto.ingredientes.map((i) => <li key={i}>{i}</li>)}</ul>
              </>
            )}
            <h3>Alérgenos</h3>
            {producto.alergenos.length > 0
              ? <ul className="chips chips-alerta">{producto.alergenos.map((a) => <li key={a}>{a}</li>)}</ul>
              : <p className="sin-alergenos">Sin alérgenos principales</p>}

            {producto.stock === 0 ? (
              <p className="pocos">Se agotó por hoy. Vuelve mañana temprano.</p>
            ) : disponibles === 0 ? (
              <p className="pocos">Ya tienes en el carrito todas las unidades disponibles.</p>
            ) : (
              <div className="detalle-compra">
                <div className="cantidad" role="group" aria-label="Cantidad">
                  <button type="button" onClick={() => setCantidad((c) => Math.max(1, c - 1))} disabled={cantidad <= 1} aria-label="Quitar uno">−</button>
                  <span aria-live="polite">{cantidad}</span>
                  <button type="button" onClick={() => setCantidad((c) => Math.min(disponibles, c + 1))} disabled={cantidad >= disponibles} aria-label="Agregar uno">+</button>
                </div>
                <button type="button" className="boton boton-grande" onClick={(e) => { onAgregar(producto, cantidad, e.currentTarget); ref.current.close(); }}>
                  Agregar · {soles(producto.precio * cantidad)}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </dialog>
  );
}
