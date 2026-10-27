// src/components/acceso/Bienvenida.jsx
// Pantalla al crear la cuenta: saludo, cupón de regalo para copiar
// y productos recomendados según lo que elegiste en el registro.
import { useEffect, useState } from "react";
import { soles } from "../../utilidades.js";

const CUPON = "KUYAY10";

export default function Bienvenida({ usuario, gustos = [], productos = [], api, onContinuar }) {
  const [cupon, setCupon] = useState(null);
  const [copiado, setCopiado] = useState(false);

  // Solo se muestra el cupón si de verdad está vigente en Neon
  useEffect(() => {
    api(`cupones?codigo=${CUPON}`).then((r) => setCupon(r.cupon)).catch(() => setCupon(null));
  }, [api]);

  const copiar = async () => {
    try {
      await navigator.clipboard.writeText(cupon.codigo);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2000);
    } catch {
      setCopiado(false);
    }
  };

  const nombre = usuario.nombre.trim().split(/\s+/)[0];
  const recomendados = productos
    .filter((p) => p.stock > 0 && (gustos.length === 0 ? p.etiqueta === "popular" : gustos.includes(p.categoria)))
    .slice(0, 3);

  return (
    <div className="card bienvenida" role="status" aria-live="polite">
      <div className="card-body">
        <p className="bienvenida-emoji" aria-hidden="true">🎉</p>
        <h2 className="acceso-titulo text-center">¡Te damos la bienvenida, {nombre}!</h2>
        <p className="fg-2 text-center">Tu cuenta está lista. Ya puedes seguir tus pedidos y comprar más rápido.</p>

        {cupon && (
          <div className="cupon-regalo">
            <div>
              <p className="cupon-regalo-titulo">Tu regalo de bienvenida</p>
              <p className="cupon-regalo-texto"><b>{cupon.porcentaje} % de descuento</b> en tu pedido con el código</p>
            </div>
            <button type="button" className="cupon-codigo" onClick={copiar} aria-label={`Copiar el código ${cupon.codigo}`}>
              <span>{cupon.codigo}</span>
              <i className={`bi ${copiado ? "bi-check2" : "bi-copy"}`} aria-hidden="true" />
            </button>
            <p className="visually-hidden" aria-live="polite">{copiado ? "Código copiado" : ""}</p>
          </div>
        )}

        {recomendados.length > 0 && (
          <>
            <h3 className="fs-md mt-5">{gustos.length ? "Te va a encantar" : "Lo más pedido"}</h3>
            <ul className="bienvenida-productos">
              {recomendados.map((p) => (
                <li key={p.id}>
                  <a href={`catalogo.html?producto=${p.id}`}>
                    <img src={p.imagen} alt="" width="120" height="90" />
                    <span>{p.nombre}</span>
                    <b>{soles(p.precio)}</b>
                  </a>
                </li>
              ))}
            </ul>
          </>
        )}

        <div className="bienvenida-botones">
          <a className="btn btn-solid theme-primary btn-lg" href={gustos.length === 1 ? `catalogo.html?categoria=${gustos[0]}` : "catalogo.html"}>
            <i className="bi bi-bag-heart" aria-hidden="true" /> Ir a comprar
          </a>
          <button type="button" className="btn btn-outline theme-primary btn-lg" onClick={onContinuar}>Ver mi cuenta</button>
        </div>
      </div>
    </div>
  );
}
