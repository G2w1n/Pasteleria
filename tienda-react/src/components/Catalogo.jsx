// src/components/Catalogo.jsx
import { useState } from "react";
import ProductoCard from "./ProductoCard.jsx";
import { categoriasDe } from "../data/productos.js";
import { sinTildes } from "../utilidades.js";

const ORDENES = {
  original: { texto: "Orden original", comparar: () => 0 },
  menor: { texto: "Precio: menor a mayor", comparar: (a, b) => a.precio - b.precio },
  mayor: { texto: "Precio: mayor a menor", comparar: (a, b) => b.precio - a.precio },
  nombre: { texto: "Nombre: A → Z", comparar: (a, b) => a.nombre.localeCompare(b.nombre, "es") },
};

export default function Catalogo({ productos, cargando, origen, cantidadEnCarrito, onAgregar, onVerDetalle }) {
  // Cuatro piezas de ESTADO: cuando cambian, React vuelve a dibujar
  const [categoria, setCategoria] = useState("Todos");
  const [busqueda, setBusqueda] = useState("");
  const [orden, setOrden] = useState("original");
  const [soloDisponibles, setSoloDisponibles] = useState(false);

  // Estado DERIVADO: se calcula en cada render, no se guarda en otro estado
  const categorias = categoriasDe(productos);
  const contar = (c) => productos.filter((p) => c === "Todos" || p.categoria === c).length;
  const texto = sinTildes(busqueda.trim());
  const visibles = productos
    .filter((p) => categoria === "Todos" || p.categoria === categoria)
    .filter((p) => sinTildes(`${p.nombre} ${p.descripcion ?? ""}`).includes(texto))
    .filter((p) => !soloDisponibles || p.stock > 0)
    .toSorted(ORDENES[orden].comparar); // toSorted no modifica el arreglo original

  const hayFiltros = categoria !== "Todos" || busqueda !== "" || orden !== "original" || soloDisponibles;
  const limpiar = () => {
    setCategoria("Todos");
    setBusqueda("");
    setOrden("original");
    setSoloDisponibles(false);
  };

  return (
    <section className="catalogo" id="catalogo" aria-labelledby="tituloCatalogo">
      <div className="catalogo-cab">
        <div>
          <p className="ceja">Horneado hoy</p>
          <h2 id="tituloCatalogo">Catálogo</h2>
        </div>
        <div className="catalogo-info">
          <span className={`origen origen-${origen}`} title={origen === "neon" ? "Precios y stock leídos de la base de datos" : "Datos guardados en el proyecto"}>
            <i aria-hidden="true" /> {cargando ? "Conectando…" : origen === "neon" ? "En vivo desde Neon" : "Datos locales"}
          </span>
          <p aria-live="polite">{visibles.length} de {productos.length} productos</p>
        </div>
      </div>

      <div className="filtros">
        <div className="categorias" role="group" aria-label="Categorías">
          {categorias.map((c) => (
            <button key={c} type="button" className={c === categoria ? "activo" : ""}
                    aria-pressed={c === categoria} onClick={() => setCategoria(c)}>
              {c} <small>{contar(c)}</small>
            </button>
          ))}
        </div>
        <div className="controles">
          <label className="buscador">
            <span className="oculto">Buscar producto</span>
            <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></svg>
            <input type="search" placeholder="Buscar: lúcuma, empanada…" value={busqueda}
                   onChange={(e) => setBusqueda(e.target.value)} />
          </label>
          <label>
            <span className="oculto">Ordenar</span>
            <select value={orden} onChange={(e) => setOrden(e.target.value)}>
              {Object.entries(ORDENES).map(([valor, { texto }]) => <option key={valor} value={valor}>{texto}</option>)}
            </select>
          </label>
          <label className="interruptor">
            <input type="checkbox" checked={soloDisponibles} onChange={(e) => setSoloDisponibles(e.target.checked)} />
            <span>Solo disponibles</span>
          </label>
        </div>
      </div>

      {cargando ? (
        <div className="grilla" aria-busy="true" aria-label="Cargando productos">
          {Array.from({ length: 8 }, (_, i) => <div key={i} className="card esqueleto" />)}
        </div>
      ) : visibles.length === 0 ? (
        <div className="vacio">
          <p className="vacio-icono" aria-hidden="true">🧁</p>
          <p>No encontramos {busqueda ? <>“<b>{busqueda}</b>”</> : "productos"} con esos filtros.</p>
          <button type="button" className="boton" onClick={limpiar}>Ver todo el catálogo</button>
        </div>
      ) : (
        <div className="grilla">
          {visibles.map((p, i) => (
            <ProductoCard key={p.id} producto={p} indice={i} enCarrito={cantidadEnCarrito(p.id)}
                          onAgregar={onAgregar} onVerDetalle={onVerDetalle} />
          ))}
        </div>
      )}

      {hayFiltros && visibles.length > 0 && (
        <p className="limpiar"><button type="button" className="boton-texto" onClick={limpiar}>Quitar filtros</button></p>
      )}
    </section>
  );
}
