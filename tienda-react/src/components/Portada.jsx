// src/components/Portada.jsx
import { sitio } from "../utilidades.js";
export default function Portada({ destacados }) {
  return (
    <section className="portada" id="inicio" aria-labelledby="tituloPortada">
      <div className="portada-texto">
        <p className="ceja">Pastelería de autor · Barranco, Lima</p>
        <h1 id="tituloPortada">Postres con <em>sabor a Perú</em>, hechos con kuyay</h1>
        <p className="portada-bajada">Lúcuma, cacao de Cusco, aguaymanto y maracuyá. Elige, agrega al carrito y pídelo por WhatsApp.</p>
        <div className="portada-botones">
          <a href="#catalogo" className="boton boton-grande">Ver catálogo</a>
          <a href={sitio("/pedido.html")} className="boton boton-borde boton-grande">Torta personalizada</a>
        </div>
      </div>
      {/* Tres productos destacados que flotan (decorativo) */}
      <div className="portada-collage" aria-hidden="true">
        {destacados.slice(0, 3).map((p, i) => (
          <img key={p.id} src={p.imagen} alt="" className={`flota flota-${i + 1}`} width="400" height="300" />
        ))}
      </div>
    </section>
  );
}
