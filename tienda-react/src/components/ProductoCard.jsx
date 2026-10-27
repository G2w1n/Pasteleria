// src/components/ProductoCard.jsx
import { soles } from "../utilidades.js";

const ETIQUETAS = { nuevo: "Nuevo", popular: "Favorito" };

// Recibe el producto y las funciones por PROPS
export default function ProductoCard({ producto, enCarrito = 0, indice = 0, onAgregar, onVerDetalle }) {
  const { nombre, categoria, precio, unidad, imagen, stock, etiqueta } = producto;
  const agotado = stock === 0;
  const sinMas = enCarrito >= stock; // ya tiene en el carrito todo lo que hay

  // Si la imagen no existe, mostramos una de reemplazo (una sola vez)
  const usarReemplazo = (e) => {
    if (!e.currentTarget.src.endsWith("sin-imagen.svg")) {
      e.currentTarget.src = `${import.meta.env.BASE_URL}img/sin-imagen.svg`;
    }
  };

  return (
    // --i escalona la animación de entrada: cada tarjeta aparece un poco después
    <article className={`card ${agotado ? "agotado" : ""}`} style={{ "--i": Math.min(indice, 11) }}>
      <button className="foto" type="button" onClick={() => onVerDetalle(producto)} aria-label={`Ver detalle de ${nombre}`}>
        <img src={imagen} alt="" width="400" height="300" loading="lazy" onError={usarReemplazo} />
        {etiqueta && !agotado && <span className={`sello sello-${etiqueta}`}>{ETIQUETAS[etiqueta] ?? etiqueta}</span>}
        {agotado && <span className="sello sello-agotado">Agotado</span>}
      </button>
      <div className="card-cuerpo">
        <span className="etiqueta">{categoria}</span>
        <h3>
          <button type="button" className="card-nombre" onClick={() => onVerDetalle(producto)}>{nombre}</button>
        </h3>
        <p className="unidad">{unidad}</p>
        {!agotado && stock <= 5 && <p className="pocos">¡Solo quedan {stock}!</p>}
        <div className="card-pie">
          <strong>{soles(precio)}</strong>
          <button
            type="button"
            className="boton boton-agregar"
            disabled={agotado || sinMas}
            onClick={(e) => onAgregar(producto, 1, e.currentTarget)}
          >
            {agotado ? "Agotado" : sinMas ? "Sin más stock" : enCarrito > 0 ? `Agregar (${enCarrito})` : "Agregar"}
          </button>
        </div>
      </div>
    </article>
  );
}
