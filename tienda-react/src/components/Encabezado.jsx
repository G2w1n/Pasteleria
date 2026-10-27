// src/components/Encabezado.jsx
import { sitio } from "../utilidades.js";
export default function Encabezado({ cantidad, tema, onCambiarTema, onAbrirCarrito }) {
  const oscuro = tema === "oscuro";
  return (
    <header className="encabezado">
      <a href="#inicio" className="marca">
        <img src={`${import.meta.env.BASE_URL}favicon.svg`} alt="" width="34" height="34" />
        Kuyay <span>React</span>
      </a>
      <nav aria-label="Menú">
        <a href="#catalogo">Catálogo</a>
        <a href="#contacto">Contacto</a>
        <a href={sitio("/")} className="nav-principal">Tienda principal</a>
      </nav>
      <div className="acciones">
        <button type="button" className="boton-icono" onClick={onCambiarTema}
                aria-label={oscuro ? "Activar modo claro" : "Activar modo oscuro"} aria-pressed={oscuro}>
          {oscuro ? "☀️" : "🌙"}
        </button>
        <button type="button" className="carrito" onClick={onAbrirCarrito}
                aria-label={`Abrir carrito (${cantidad} ${cantidad === 1 ? "producto" : "productos"})`}>
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 8h14l-1.2 11.2a2 2 0 0 1-2 1.8H8.2a2 2 0 0 1-2-1.8z" /><path d="M9 8V6a3 3 0 0 1 6 0v2" /></svg>
          <span className="carrito-texto">Carrito</span>
          {/* key cambia con la cantidad: el contador se vuelve a montar y "salta" */}
          <b key={cantidad}>{cantidad}</b>
        </button>
      </div>
    </header>
  );
}
