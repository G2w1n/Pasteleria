// src/components/Pie.jsx
import { NEGOCIO, sitio, soles } from "../utilidades.js";

export default function Pie({ total, unidades, origen }) {
  return (
    <footer id="contacto" className="pie">
      <div className="pie-grilla">
        <div>
          <p className="marca marca-pie">Kuyay</p>
          <p>Hecho con <em>kuyay</em>, horneado con calma.</p>
        </div>
        <div>
          <h2>Visítanos</h2>
          <p>{NEGOCIO.direccion}</p>
          <p>Lun a vie 8:00–20:00 · Sáb 8:00–21:00 · Dom 9:00–14:00</p>
        </div>
        <div>
          <h2>Tu carrito</h2>
          <p>{unidades} {unidades === 1 ? "producto" : "productos"} · Total {soles(total)}</p>
          <p><a href={sitio("/")}>← Volver a la tienda principal</a></p>
        </div>
      </div>
      <p className="pie-legal">
        Versión React de Kuyay (Semana 11) · React 19 + Vite · Datos {origen === "neon" ? "en vivo desde Neon" : "locales"}
      </p>
    </footer>
  );
}
