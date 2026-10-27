// src/components/ProductoCard.jsx
// Tarjeta de producto con las clases de Bootstrap 6 de la tienda (card, badge, btn).
import { soles } from "../utilidades.js";

const ETIQUETAS = {
  nuevo: { texto: "Nuevo", tema: "theme-accent" },
  popular: { texto: "Más vendido", tema: "theme-primary" },
};

// Recibe el producto y las funciones por PROPS
export default function ProductoCard({ producto, nombreCategoria, enCarrito = 0, favorito = false, onAgregar, onVerDetalle, onFavorito }) {
  const { id, nombre, precio, unidad, descripcion, imagen, stock, etiqueta, calificacion } = producto;
  const agotado = stock === 0;
  const sinMas = !agotado && enCarrito >= stock; // ya tiene en el carrito todo lo que hay
  const insignia = ETIQUETAS[etiqueta];

  // Si la imagen no existe, mostramos una de reemplazo (una sola vez)
  const usarReemplazo = (e) => {
    if (!e.currentTarget.src.endsWith("sin-imagen.svg")) {
      e.currentTarget.src = e.currentTarget.src.replace(/[^/]+$/, "sin-imagen.svg");
    }
  };

  // La tarjeta se pasa al abrir el detalle: su imagen "crece" hasta la ventana
  const verDetalle = (e) => onVerDetalle(producto, e.currentTarget.closest(".producto"));
  const agregar = (e) => onAgregar(producto, 1, e.currentTarget.closest(".producto").querySelector(".producto-media img"));

  return (
    <article className={`card producto h-100 ${agotado ? "producto-agotado" : ""}`}>
      <div className="producto-media">
        <img src={imagen} alt="" width="400" height="300" loading="lazy" onError={usarReemplazo} />
        <div className="producto-insignias">
          {agotado ? <span className="badge theme-secondary">Agotado</span>
            : insignia && <span className={`badge ${insignia.tema}`}>{insignia.texto}</span>}
        </div>
        <button type="button" className={`btn-favorito ${favorito ? "activo" : ""}`} onClick={() => onFavorito(id)}
                aria-pressed={favorito} aria-label={`${favorito ? "Quitar" : "Guardar"} ${nombre} ${favorito ? "de" : "en"} favoritos`}>
          <i className={`bi ${favorito ? "bi-heart-fill" : "bi-heart"}`} aria-hidden="true" />
        </button>
      </div>
      <div className="card-body producto-cuerpo">
        <p className="producto-categoria">{nombreCategoria}</p>
        <h3 className="producto-nombre">
          <button className="producto-enlace" type="button" data-detalle={id} onClick={verDetalle}>{nombre}</button>
        </h3>
        {calificacion?.total > 0 && (
          <p className="producto-estrellas" aria-label={`${calificacion.promedio.toFixed(1)} de 5 estrellas, ${calificacion.total} reseñas`}>
            <span aria-hidden="true">{"★".repeat(Math.round(calificacion.promedio))}{"☆".repeat(5 - Math.round(calificacion.promedio))}</span>
            <small aria-hidden="true">({calificacion.total})</small>
          </p>
        )}
        <p className="producto-descripcion">{descripcion}</p>
        <p className="producto-unidad">{unidad}</p>
        {!agotado && stock <= 5 && <p className="producto-pocos"><i className="bi bi-fire" aria-hidden="true" /> ¡Solo quedan {stock}!</p>}
        <div className="producto-pie">
          <span className="producto-precio">{soles(precio)}</span>
          {agotado ? (
            <button className="btn btn-subtle theme-secondary btn-sm" type="button" disabled>Agotado</button>
          ) : (
            <button className="btn btn-solid theme-primary btn-sm" type="button" onClick={agregar} disabled={sinMas}
                    aria-label={sinMas ? `No queda más stock de ${nombre}` : `Agregar ${nombre} al carrito`}>
              <i className="bi bi-bag-plus" aria-hidden="true" /> {sinMas ? "Sin stock" : enCarrito > 0 ? `Agregar (${enCarrito})` : "Agregar"}
            </button>
          )}
        </div>
      </div>
    </article>
  );
}
