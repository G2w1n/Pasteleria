// src/components/EnVivo.jsx
// "Hoy en Kuyay": números del día en vivo desde Neon y productos que se están acabando.
// Se actualiza solo cada minuto; los números suben animados (salvo movimiento reducido).
import { useEffect, useRef, useState } from "react";
import { prefiereQuieto } from "../utilidades.js";

const CADA = 60000; // ms

// Número que cuenta desde su valor anterior hasta el nuevo
function Contador({ valor, decimales = 0 }) {
  const [mostrado, setMostrado] = useState(prefiereQuieto() ? valor : 0);
  const anterior = useRef(0);
  useEffect(() => {
    if (prefiereQuieto()) return setMostrado(valor);
    const desde = anterior.current;
    const inicio = performance.now();
    let cuadro;
    const paso = (ahora) => {
      const t = Math.min((ahora - inicio) / 900, 1);
      setMostrado(desde + (valor - desde) * (1 - (1 - t) ** 3));
      if (t < 1) cuadro = requestAnimationFrame(paso);
      else anterior.current = valor;
    };
    cuadro = requestAnimationFrame(paso);
    return () => cancelAnimationFrame(cuadro);
  }, [valor]);
  return mostrado.toLocaleString("es-PE", { minimumFractionDigits: decimales, maximumFractionDigits: decimales });
}

export default function EnVivo({ inicial, productosIniciales, api, onVer }) {
  const [datos, setDatos] = useState({ resumen: inicial, productos: productosIniciales });

  useEffect(() => {
    const reloj = setInterval(() => {
      api("productos").then((d) => setDatos({ resumen: d.resumen, productos: d.productos })).catch(() => {});
    }, CADA);
    return () => clearInterval(reloj);
  }, [api]);

  const r = datos.resumen;
  if (!r) return null;
  const acabando = datos.productos.filter((p) => p.stock > 0 && p.stock <= 5).toSorted((a, b) => a.stock - b.stock).slice(0, 4);
  const tarjetas = [
    { icono: "bi-bag-check", valor: r.pedidos_hoy, texto: r.pedidos_hoy === 1 ? "pedido hoy" : "pedidos hoy" },
    { icono: "bi-truck", valor: r.entregados, texto: "pedidos entregados" },
    { icono: "bi-people", valor: r.clientes, texto: r.clientes === 1 ? "cliente con cuenta" : "clientes con cuenta" },
    r.calificacion
      ? { icono: "bi-star-fill", valor: r.calificacion, decimales: 1, texto: `de 5 · ${r.resenas} ${r.resenas === 1 ? "reseña" : "reseñas"}` }
      : { icono: "bi-star", valor: null, texto: "¡Deja la primera reseña!" },
  ];

  return (
    <div className="en-vivo">
      <div className="en-vivo-cabecera">
        <h2 className="titulo-seccion mb-0" id="enVivoTitulo">Hoy en Kuyay</h2>
        <span className="en-vivo-punto"><i aria-hidden="true" /> En vivo</span>
      </div>
      <ul className="en-vivo-cifras">
        {tarjetas.map((t) => (
          <li key={t.texto} className="en-vivo-cifra">
            <i className={`bi ${t.icono}`} aria-hidden="true" />
            <strong>{t.valor === null ? "★" : <Contador valor={t.valor} decimales={t.decimales} />}</strong>
            <span>{t.texto}</span>
          </li>
        ))}
      </ul>
      {acabando.length > 0 && (
        <div className="en-vivo-acabando">
          <p className="mb-2 fw-semibold"><i className="bi bi-fire" aria-hidden="true" /> Se están acabando</p>
          <ul>
            {acabando.map((p) => (
              <li key={p.id}>
                <button type="button" className="chip" onClick={() => onVer(p)}>
                  {p.nombre} <b>· {p.stock === 1 ? "¡queda 1!" : `quedan ${p.stock}`}</b>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
