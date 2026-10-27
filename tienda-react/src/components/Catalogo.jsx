// src/components/Catalogo.jsx
// Catálogo con filtros, buscador, orden, precio, alérgenos, favoritos,
// vista grilla/lista, "Cargar más" y vistos recientemente.
import { useLayoutEffect, useRef, useState } from "react";
import ProductoCard from "./ProductoCard.jsx";
import { useLocalStorage } from "../hooks/useLocalStorage.js";
import { conTransicion, sinTildes, soles } from "../utilidades.js";

const POR_PAGINA = 8;
const MAX_VISTOS = 6;

// Orden "destacados": primero los más vendidos, luego los nuevos y al final los agotados
const peso = (p) => (p.stock === 0 ? 3 : p.etiqueta === "popular" ? 0 : p.etiqueta === "nuevo" ? 1 : 2);
const ORDENES = {
  destacados: { texto: "Destacados", comparar: (a, b) => peso(a) - peso(b) },
  "precio-asc": { texto: "Precio: menor a mayor", comparar: (a, b) => a.precio - b.precio },
  "precio-desc": { texto: "Precio: mayor a menor", comparar: (a, b) => b.precio - a.precio },
  nombre: { texto: "Nombre (A–Z)", comparar: (a, b) => a.nombre.localeCompare(b.nombre, "es") },
  valorados: { texto: "Mejor valorados", comparar: (a, b) => (b.calificacion?.promedio ?? 0) - (a.calificacion?.promedio ?? 0) },
};

// Estado inicial: se puede leer de la URL (?categoria=tortas&q=lucuma&orden=precio-asc)
function filtrosIniciales(categorias, precioTope, desdeURL) {
  const base = { categoria: "todos", texto: "", orden: "destacados", precioMax: precioTope, sinAlergenos: [], disponibles: false };
  if (!desdeURL) return base;
  const p = new URLSearchParams(location.search);
  const categoria = p.get("categoria");
  return {
    ...base,
    categoria: categorias.some((c) => c.id === categoria) || categoria === "favoritos" ? categoria : "todos",
    texto: p.get("q") ?? "",
    orden: ORDENES[p.get("orden")] ? p.get("orden") : "destacados",
  };
}

export default function Catalogo({ productos, categorias, cantidadEnCarrito = () => 0, onAgregar, onVerDetalle, sincronizarURL = false }) {
  const precioTope = Math.ceil(Math.max(...productos.map((p) => p.precio)) / 5) * 5;
  const alergenos = [...new Set(productos.flatMap((p) => p.alergenos ?? []))].sort((a, b) => a.localeCompare(b, "es"));

  // ESTADO: cuando cambia, React vuelve a dibujar
  const [filtros, setFiltros] = useState(() => filtrosIniciales(categorias, precioTope, sincronizarURL));
  const [limite, setLimite] = useState(POR_PAGINA);
  const [masFiltros, setMasFiltros] = useState(false);
  const [vista, setVista] = useLocalStorage("kuyay-vista", "grilla");
  const [favoritos, setFavoritos] = useLocalStorage("kuyay-favoritos", []);
  const [vistos, setVistos] = useLocalStorage("kuyay-vistos", []);

  // Cambiar un filtro vuelve a mostrar desde la primera "página"
  const actualizar = (cambios, { animar = true } = {}) => {
    const aplicar = () => {
      setFiltros((f) => ({ ...f, ...cambios }));
      setLimite(POR_PAGINA);
    };
    animar ? conTransicion("filtro", aplicar) : aplicar();
  };
  const limpiar = () => actualizar({ categoria: "todos", texto: "", orden: "destacados", precioMax: precioTope, sinAlergenos: [], disponibles: false });

  // Estado DERIVADO: se calcula en cada render, no se guarda en otro estado
  const texto = sinTildes(filtros.texto);
  const visibles = productos
    .filter((p) => filtros.categoria === "todos" || (filtros.categoria === "favoritos" ? favoritos.includes(p.id) : p.categoria === filtros.categoria))
    .filter((p) => !texto || sinTildes(`${p.nombre} ${p.descripcion} ${(p.ingredientes ?? []).join(" ")}`).includes(texto))
    .filter((p) => p.precio <= filtros.precioMax)
    .filter((p) => !filtros.sinAlergenos.some((a) => (p.alergenos ?? []).includes(a)))
    .filter((p) => !filtros.disponibles || p.stock > 0)
    .toSorted(ORDENES[filtros.orden].comparar); // toSorted no modifica el arreglo original
  const mostrados = visibles.slice(0, limite);

  const nombreCategoria = (id) => categorias.find((c) => c.id === id)?.nombre ?? id;
  const contar = (id) => (id === "todos" ? productos.length : productos.filter((p) => p.categoria === id).length);

  // Chips con los filtros activos: cada uno se quita con un clic
  const chips = [
    filtros.categoria !== "todos" && { texto: filtros.categoria === "favoritos" ? "Favoritos" : nombreCategoria(filtros.categoria), quitar: { categoria: "todos" } },
    filtros.texto && { texto: `“${filtros.texto}”`, quitar: { texto: "" } },
    filtros.precioMax < precioTope && { texto: `Hasta ${soles(filtros.precioMax)}`, quitar: { precioMax: precioTope } },
    ...filtros.sinAlergenos.map((a) => ({ texto: `Sin ${a.toLowerCase()}`, quitar: { sinAlergenos: filtros.sinAlergenos.filter((x) => x !== a) } })),
    filtros.disponibles && { texto: "Disponibles hoy", quitar: { disponibles: false } },
  ].filter(Boolean);
  const filtrosExtra = (filtros.precioMax < precioTope) + filtros.sinAlergenos.length + filtros.disponibles;

  // La URL refleja los filtros: un enlace filtrado se puede compartir
  useLayoutEffect(() => {
    if (!sincronizarURL) return;
    const p = new URLSearchParams();
    if (filtros.categoria !== "todos") p.set("categoria", filtros.categoria);
    if (filtros.texto) p.set("q", filtros.texto);
    if (filtros.orden !== "destacados") p.set("orden", filtros.orden);
    history.replaceState(null, "", p.size ? `?${p}` : location.pathname);
  }, [filtros.categoria, filtros.texto, filtros.orden, sincronizarURL]);

  // La "pastilla" de color se desliza hasta la categoría activa
  const listaFiltros = useRef(null);
  const indicador = useRef(null);
  const primeraVez = useRef(true);
  useLayoutEffect(() => {
    const mover = () => {
      const activo = listaFiltros.current?.querySelector(".nav-link.active");
      if (!activo) return;
      const lista = listaFiltros.current;
      const x = activo.getBoundingClientRect().left - lista.getBoundingClientRect().left + lista.scrollLeft;
      indicador.current.classList.toggle("sin-transicion", primeraVez.current);
      indicador.current.style.width = `${activo.offsetWidth}px`;
      indicador.current.style.transform = `translateX(${x}px)`;
      primeraVez.current = false;
    };
    mover();
    document.fonts?.ready.then(mover);
    window.addEventListener("resize", mover);
    return () => window.removeEventListener("resize", mover);
  }, [filtros.categoria, favoritos.length]);

  const alternarFavorito = (id) =>
    setFavoritos((lista) => (lista.includes(id) ? lista.filter((x) => x !== id) : [...lista, id]));
  const verDetalle = (producto, tarjeta) => {
    setVistos((lista) => [producto.id, ...lista.filter((x) => x !== producto.id)].slice(0, MAX_VISTOS));
    onVerDetalle(producto, tarjeta);
  };
  const recientes = vistos.map((id) => productos.find((p) => p.id === id)).filter(Boolean);

  const tarjeta = (p) => (
    <ProductoCard producto={p} nombreCategoria={nombreCategoria(p.categoria)} enCarrito={cantidadEnCarrito(p.id)}
                  favorito={favoritos.includes(p.id)} onAgregar={onAgregar} onVerDetalle={verDetalle} onFavorito={alternarFavorito} />
  );

  return (
    <div className="catalogo-react">
      {/* Barra de herramientas: categorías, buscador, orden y más filtros */}
      <div className="catalogo-herramientas">
        <ul className="nav nav-pills filtros" ref={listaFiltros} aria-label="Filtrar por categoría">
          <li className="filtros-indicador" ref={indicador} aria-hidden="true" />
          {categorias.map((c) => (
            <li className="nav-item" key={c.id}>
              <button className={`nav-link ${filtros.categoria === c.id ? "active" : ""}`} type="button"
                      aria-pressed={filtros.categoria === c.id} onClick={() => actualizar({ categoria: c.id })}>
                {c.nombre} <span className="filtro-cantidad">{contar(c.id)}</span>
              </button>
            </li>
          ))}
          <li className="nav-item">
            <button className={`nav-link ${filtros.categoria === "favoritos" ? "active" : ""}`} type="button"
                    aria-pressed={filtros.categoria === "favoritos"} onClick={() => actualizar({ categoria: "favoritos" })}>
              <i className="bi bi-heart-fill" aria-hidden="true" /> Favoritos <span className="filtro-cantidad">{favoritos.length}</span>
            </button>
          </li>
        </ul>
        <div className="catalogo-busqueda">
          <label className="form-control form-adorn buscador">
            <span className="form-adorn-icon"><i className="bi bi-search" aria-hidden="true" /></span>
            <span className="visually-hidden">Buscar productos</span>
            {/* Input controlado: value + onChange */}
            <input className="form-ghost" type="search" placeholder="Busca lúcuma, cacao, empanada…" autoComplete="off"
                   value={filtros.texto} onChange={(e) => actualizar({ texto: e.target.value }, { animar: false })} />
          </label>
          <label className="visually-hidden" htmlFor="ordenReact">Ordenar productos</label>
          <select className="form-control orden" id="ordenReact" value={filtros.orden} onChange={(e) => actualizar({ orden: e.target.value })}>
            {Object.entries(ORDENES).map(([valor, { texto }]) => <option key={valor} value={valor}>{texto}</option>)}
          </select>
          <button type="button" className={`btn ${masFiltros ? "btn-solid" : "btn-outline"} theme-primary boton-mas-filtros`}
                  aria-expanded={masFiltros} aria-controls="filtrosExtra" onClick={() => setMasFiltros((v) => !v)}>
            <i className="bi bi-sliders" aria-hidden="true" /> Filtros
            {filtrosExtra > 0 && <span className="badge theme-accent">{filtrosExtra}</span>}
          </button>
        </div>
      </div>

      {/* Más filtros: precio (Range), alérgenos (Chips) y disponibles (Switch) */}
      <div className="card filtros-extra" id="filtrosExtra" hidden={!masFiltros}>
        <div className="card-body">
          <div className="filtro-bloque">
            <label className="form-label" htmlFor="precioMax">Precio máximo: <strong>{soles(filtros.precioMax)}</strong></label>
            <div className="form-range" style={{ "--bs-range-fill": (filtros.precioMax - 5) / (precioTope - 5) }}>
              <input className="form-range-input" type="range" id="precioMax" min="5" max={precioTope} step="5"
                     value={filtros.precioMax} onChange={(e) => actualizar({ precioMax: Number(e.target.value) }, { animar: false })} />
            </div>
            <div className="filtro-escala" aria-hidden="true"><span>S/ 5</span><span>{soles(precioTope)}</span></div>
          </div>
          <fieldset className="filtro-bloque">
            <legend className="form-label">Sin estos alérgenos</legend>
            <div className="chips-alergenos">
              {alergenos.map((a) => {
                const activo = filtros.sinAlergenos.includes(a);
                return (
                  <button key={a} type="button" className={`chip ${activo ? "active" : ""}`} aria-pressed={activo}
                          onClick={() => actualizar({ sinAlergenos: activo ? filtros.sinAlergenos.filter((x) => x !== a) : [...filtros.sinAlergenos, a] })}>
                    {activo && <i className="bi bi-check2 chip-icon" aria-hidden="true" />} Sin {a.toLowerCase()}
                  </button>
                );
              })}
            </div>
          </fieldset>
          <div className="filtro-bloque filtro-switch">
            <div className="switch">
              <input type="checkbox" role="switch" id="soloDisponibles" checked={filtros.disponibles}
                     onChange={(e) => actualizar({ disponibles: e.target.checked })} />
            </div>
            <label htmlFor="soloDisponibles">Solo disponibles hoy</label>
          </div>
        </div>
      </div>

      {/* Resumen, chips de filtros activos y vista */}
      <div className="catalogo-barra">
        <p className="fg-3 fs-sm mb-0" aria-live="polite">{visibles.length} {visibles.length === 1 ? "producto" : "productos"}</p>
        {chips.length > 0 && (
          <ul className="chips-activos" aria-label="Filtros activos">
            {chips.map((c) => (
              <li key={c.texto}>
                <button type="button" className="chip active" onClick={() => actualizar(c.quitar)} aria-label={`Quitar filtro ${c.texto}`}>
                  {c.texto} <i className="bi bi-x chip-dismiss" aria-hidden="true" />
                </button>
              </li>
            ))}
            <li><button type="button" className="btn btn-text btn-sm" onClick={limpiar}>Limpiar todo</button></li>
          </ul>
        )}
        <div className="btn-group vista-selector" role="group" aria-label="Vista">
          <button type="button" className={`btn btn-sm ${vista === "grilla" ? "btn-solid" : "btn-outline"} theme-secondary`}
                  aria-pressed={vista === "grilla"} aria-label="Ver en grilla" onClick={() => conTransicion("filtro", () => setVista("grilla"))}>
            <i className="bi bi-grid-3x3-gap" aria-hidden="true" />
          </button>
          <button type="button" className={`btn btn-sm ${vista === "lista" ? "btn-solid" : "btn-outline"} theme-secondary`}
                  aria-pressed={vista === "lista"} aria-label="Ver en lista" onClick={() => conTransicion("filtro", () => setVista("lista"))}>
            <i className="bi bi-list-ul" aria-hidden="true" />
          </button>
        </div>
      </div>

      {visibles.length === 0 ? (
        <div className="sin-resultados">
          <i className={`bi ${filtros.categoria === "favoritos" && favoritos.length === 0 ? "bi-heart" : "bi-search-heart"}`} aria-hidden="true" />
          {filtros.categoria === "favoritos" && favoritos.length === 0 ? (
            <>
              <p className="fw-semibold mb-0">Aún no tienes favoritos</p>
              <p className="fg-3 fs-sm">Toca el corazón de un producto para guardarlo aquí.</p>
            </>
          ) : (
            <>
              <p className="fw-semibold mb-0">No encontramos productos{filtros.texto ? <> para “{filtros.texto}”</> : " con esos filtros"}</p>
              <p className="fg-3 fs-sm">Prueba con otra palabra o quita algún filtro.</p>
            </>
          )}
          <button className="btn btn-outline theme-primary" type="button" onClick={limpiar}>Ver todo el catálogo</button>
        </div>
      ) : (
        <div className={`row g-7 mt-1 ${vista === "lista" ? "row-cols-1 vista-lista" : "row-cols-1 sm:row-cols-2 lg:row-cols-3 xl:row-cols-4"}`} id="grillaProductos">
          {/* map + key única: así React sabe qué tarjeta es cuál */}
          {mostrados.map((p) => (
            <div className="col" key={p.id} style={{ viewTransitionName: `tarjeta-${p.id}` }}>{tarjeta(p)}</div>
          ))}
        </div>
      )}

      {visibles.length > limite && (
        <div className="cargar-mas">
          <p className="fg-3 fs-sm mb-2">Mostrando {mostrados.length} de {visibles.length}</p>
          <div className="progress" role="progressbar" aria-label="Productos mostrados" aria-valuenow={mostrados.length} aria-valuemin="0" aria-valuemax={visibles.length}>
            <div className="progress-bar" style={{ width: `${(mostrados.length / visibles.length) * 100}%` }} />
          </div>
          <button type="button" className="btn btn-outline theme-primary mt-4" onClick={() => setLimite((n) => n + POR_PAGINA)}>
            Cargar más <i className="bi bi-arrow-down" aria-hidden="true" />
          </button>
        </div>
      )}

      {recientes.length > 0 && (
        <section className="vistos" aria-labelledby="vistosTitulo">
          <div className="vistos-cabecera">
            <h2 className="titulo-seccion fs-2xl mb-0" id="vistosTitulo">Vistos recientemente</h2>
            <button type="button" className="btn btn-text btn-sm" onClick={() => setVistos([])}>Borrar historial</button>
          </div>
          <ul className="vistos-lista">
            {recientes.map((p) => (
              <li key={p.id}>
                <button type="button" className="visto" onClick={(e) => onVerDetalle(p, e.currentTarget)}>
                  <img src={p.imagen} alt="" width="160" height="120" loading="lazy" />
                  <span className="visto-nombre">{p.nombre}</span>
                  <span className="visto-precio">{soles(p.precio)}</span>
                </button>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
