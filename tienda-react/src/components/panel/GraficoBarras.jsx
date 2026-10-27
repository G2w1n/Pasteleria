// src/components/panel/GraficoBarras.jsx
// Gráfico de barras de UNA serie (SVG, sin librerías): vertical para el tiempo,
// horizontal para rankings. Tooltip al pasar el mouse o enfocar, y vista de tabla.
import { useState } from "react";

const ALTO = 180;

export default function GraficoBarras({ titulo, datos, formato = String, horizontal = false, etiquetaEje = (d) => d.etiqueta }) {
  const [tabla, setTabla] = useState(false);
  const [activo, setActivo] = useState(null);
  const maximo = Math.max(...datos.map((d) => d.valor), 1);

  return (
    <figure className="grafico">
      <figcaption className="grafico-cabecera">
        <h3 className="fs-md mb-0">{titulo}</h3>
        <button type="button" className="btn btn-text btn-sm" onClick={() => setTabla((t) => !t)} aria-pressed={tabla}>
          <i className={`bi ${tabla ? "bi-bar-chart" : "bi-table"}`} aria-hidden="true" /> {tabla ? "Ver gráfico" : "Ver tabla"}
        </button>
      </figcaption>

      {datos.length === 0 ? (
        <p className="fg-3 fs-sm mb-0">Aún no hay datos.</p>
      ) : tabla ? (
        <table className="table table-sm grafico-tabla">
          <thead><tr><th scope="col">{horizontal ? "Nombre" : "Fecha"}</th><th scope="col" className="text-end">Valor</th></tr></thead>
          <tbody>{datos.map((d) => <tr key={d.etiqueta}><td>{d.etiqueta}</td><td className="text-end">{formato(d.valor)}</td></tr>)}</tbody>
        </table>
      ) : horizontal ? (
        // Ranking: barras horizontales con el nombre y el valor escritos (no depende del color)
        <ul className="grafico-ranking">
          {datos.map((d) => (
            <li key={d.etiqueta}>
              <span className="grafico-nombre">{d.etiqueta}</span>
              <span className="grafico-pista"><span className="grafico-barra-h" style={{ width: `${(d.valor / maximo) * 100}%` }} /></span>
              <span className="grafico-valor">{formato(d.valor)}</span>
            </li>
          ))}
        </ul>
      ) : (
        <div className="grafico-lienzo" onPointerLeave={() => setActivo(null)}>
          <svg viewBox={`0 0 ${datos.length * 10} ${ALTO}`} preserveAspectRatio="none" role="img"
               aria-label={`${titulo}. Máximo ${formato(maximo)}. Usa "Ver tabla" para leer cada valor.`}>
            {/* Líneas guía discretas: 50 % y 100 % del máximo */}
            {[0.5, 1].map((f) => <line key={f} className="grafico-guia" x1="0" x2={datos.length * 10} y1={ALTO - f * (ALTO - 6)} y2={ALTO - f * (ALTO - 6)} />)}
            {datos.map((d, i) => {
              const alto = Math.max((d.valor / maximo) * (ALTO - 6), d.valor > 0 ? 2 : 0);
              return (
                <g key={d.etiqueta} onPointerEnter={() => setActivo(i)}>
                  {/* Zona de toque más grande que la barra */}
                  <rect className="grafico-zona" x={i * 10} y="0" width="10" height={ALTO} />
                  <rect className={`grafico-barra ${activo === i ? "activa" : ""}`} x={i * 10 + 1} y={ALTO - alto} width="8" height={alto} rx="1.2" />
                </g>
              );
            })}
          </svg>
          {activo !== null && (
            <div className="grafico-tooltip" style={{ left: `${((activo + 0.5) / datos.length) * 100}%` }} role="status">
              <b>{formato(datos[activo].valor)}</b>
              <span>{datos[activo].etiqueta}</span>
              {datos[activo].detalle && <span>{datos[activo].detalle}</span>}
            </div>
          )}
          <div className="grafico-eje" aria-hidden="true">
            <span>{etiquetaEje(datos[0])}</span>
            <span>{etiquetaEje(datos[datos.length - 1])}</span>
          </div>
        </div>
      )}
    </figure>
  );
}
