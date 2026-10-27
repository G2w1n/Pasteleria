// src/components/Encabezado.jsx
// Navbar de Bootstrap 6. Solo MUESTRA la cantidad: el carrito vive en App.
export default function Encabezado({ cantidad, onAbrirCarrito }) {
  return (
    <header className="cabecera sticky-top">
      <nav className="navbar navbar-translucent" aria-label="Menú principal">
        <div className="container">
          <a className="navbar-brand marca" href="#inicio">
            <img src="/favicon.svg" alt="" width="36" height="36" />
            <span>Kuyay</span>
          </a>
          <ul className="navbar-nav nav-practica">
            <li className="nav-item"><a className="nav-link" href="#catalogo">Catálogo</a></li>
            <li className="nav-item"><a className="nav-link" href="#contacto">Contacto</a></li>
          </ul>
          <div className="acciones">
            <button className="btn btn-text btn-icon position-relative" type="button" onClick={onAbrirCarrito}
                    aria-label={`Abrir carrito (${cantidad} ${cantidad === 1 ? "producto" : "productos"})`}>
              <i className="bi bi-bag-heart" aria-hidden="true" />
              {/* key cambia con la cantidad: el contador se vuelve a montar y "salta" */}
              <b key={cantidad} className="badge theme-accent contador-carrito contador-salta" data-cantidad={cantidad} aria-hidden="true">{cantidad}</b>
            </button>
          </div>
        </div>
      </nav>
    </header>
  );
}
