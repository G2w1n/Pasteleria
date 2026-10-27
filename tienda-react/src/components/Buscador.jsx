// src/components/Buscador.jsx
// Buscador del menú (patrón Combobox): sugerencias mientras escribes,
// se maneja con el teclado (↑ ↓ Enter Esc) y se abre con la tecla "/".
import { useEffect, useId, useRef, useState } from "react";
import { sinTildes, soles } from "../utilidades.js";

const MAX_RESULTADOS = 6;

// Resalta la parte del nombre que coincide con lo escrito
function Resaltado({ texto, buscado }) {
  const i = buscado ? sinTildes(texto).indexOf(buscado) : -1;
  if (i < 0) return texto;
  return (
    <>
      {texto.slice(0, i)}<mark>{texto.slice(i, i + buscado.length)}</mark>{texto.slice(i + buscado.length)}
    </>
  );
}

export default function Buscador({ productos, categorias, onElegir, urlResultados }) {
  const [abierto, setAbierto] = useState(false);
  const [texto, setTexto] = useState("");
  const [activo, setActivo] = useState(-1);
  const raiz = useRef(null);
  const campo = useRef(null);
  const boton = useRef(null);
  const id = useId();

  const buscado = sinTildes(texto);
  const coincidencias = buscado
    ? productos.filter((p) => sinTildes(`${p.nombre} ${p.descripcion} ${(p.ingredientes ?? []).join(" ")}`).includes(buscado))
    : productos.filter((p) => p.etiqueta === "popular" && p.stock > 0); // sin texto: los más pedidos
  const resultados = coincidencias.slice(0, MAX_RESULTADOS);
  const nombreCategoria = (c) => categorias.find((x) => x.id === c)?.nombre ?? c;

  const abrir = () => {
    setAbierto(true);
    requestAnimationFrame(() => campo.current?.focus());
  };
  const cerrar = (devolverFoco = false) => {
    setAbierto(false);
    setActivo(-1);
    if (devolverFoco) boton.current?.focus();
  };
  const elegir = (producto) => {
    cerrar();
    setTexto("");
    onElegir(producto);
  };
  const verTodos = () => {
    location.href = urlResultados(texto.trim());
  };

  // Atajos: "/" o Ctrl+K abren el buscador; clic afuera lo cierra
  useEffect(() => {
    const atajo = (e) => {
      const escribiendo = e.target.closest("input, textarea, select, [contenteditable]");
      if ((e.key === "/" && !escribiendo) || (e.key.toLowerCase() === "k" && (e.ctrlKey || e.metaKey))) {
        e.preventDefault();
        abrir();
      }
    };
    const clicAfuera = (e) => abierto && !raiz.current.contains(e.target) && cerrar();
    document.addEventListener("keydown", atajo);
    document.addEventListener("pointerdown", clicAfuera);
    return () => {
      document.removeEventListener("keydown", atajo);
      document.removeEventListener("pointerdown", clicAfuera);
    };
  }, [abierto]);

  const teclas = (e) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActivo((i) => (i + 1) % Math.max(resultados.length, 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActivo((i) => (i <= 0 ? resultados.length - 1 : i - 1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (activo >= 0 && resultados[activo]) elegir(resultados[activo]);
      else if (texto.trim()) verTodos();
    } else if (e.key === "Escape") {
      cerrar(true);
    }
  };

  return (
    <div className="buscador-menu" ref={raiz}>
      <button ref={boton} className="btn btn-text btn-icon" type="button" onClick={() => (abierto ? cerrar() : abrir())}
              aria-expanded={abierto} aria-controls={`${id}-panel`} aria-label="Buscar productos (atajo: /)" title="Buscar (/)">
        <i className="bi bi-search" aria-hidden="true" />
      </button>

      {abierto && (
        <div className="buscador-panel" id={`${id}-panel`}>
          <label className="form-control form-adorn">
            <span className="form-adorn-icon"><i className="bi bi-search" aria-hidden="true" /></span>
            <span className="visually-hidden">Buscar productos</span>
            <input ref={campo} className="form-ghost" type="text" placeholder="¿Qué se te antoja? Lúcuma, empanada…" autoComplete="off"
                   role="combobox" aria-expanded="true" aria-controls={`${id}-lista`} aria-autocomplete="list"
                   aria-activedescendant={activo >= 0 ? `${id}-op-${activo}` : undefined}
                   value={texto} onChange={(e) => { setTexto(e.target.value); setActivo(-1); }} onKeyDown={teclas} />
            <kbd className="buscador-atajo" aria-hidden="true">Esc</kbd>
          </label>

          <p className="buscador-titulo" id={`${id}-titulo`}>
            {buscado ? `${coincidencias.length} ${coincidencias.length === 1 ? "resultado" : "resultados"}` : "Los más pedidos"}
          </p>
          {resultados.length > 0 ? (
            <ul className="buscador-resultados" id={`${id}-lista`} role="listbox" aria-labelledby={`${id}-titulo`}>
              {resultados.map((p, i) => (
                // Las opciones se eligen con el mouse o con ↑ ↓ y Enter desde el campo (patrón combobox)
                <li key={p.id} id={`${id}-op-${i}`} role="option" aria-selected={i === activo}
                    className={`buscador-opcion ${i === activo ? "activa" : ""}`}
                    onPointerEnter={() => setActivo(i)} onClick={() => elegir(p)}>
                  <img src={p.imagen} alt="" width="56" height="42" />
                  <span className="buscador-texto">
                    <span className="buscador-nombre"><Resaltado texto={p.nombre} buscado={buscado} /></span>
                    <span className="buscador-categoria">{nombreCategoria(p.categoria)}{p.stock === 0 ? " · Agotado" : ""}</span>
                  </span>
                  <span className="buscador-precio">{soles(p.precio)}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="buscador-vacio" id={`${id}-lista`}>No encontramos “{texto}”. Prueba con lúcuma, cacao o pan.</p>
          )}
          {buscado && coincidencias.length > 0 && (
            <a className="buscador-todos" href={urlResultados(texto.trim())}>
              Ver todos los resultados en el catálogo <i className="bi bi-arrow-right" aria-hidden="true" />
            </a>
          )}
        </div>
      )}
    </div>
  );
}
