// =========================================================
// Catálogo: filtros, buscador, ordenamiento y detalle.
// =========================================================
import { Dialog } from "https://cdn.jsdelivr.net/npm/bootstrap@6.0.0-alpha.1/dist/js/bootstrap.bundle.min.js";
import { CATEGORIAS, productos } from "./productos.js";
import { dibujarProducto } from "./ilustraciones.js";

// ---------- Utilidades (funciones flecha) ----------
export const soles = (monto) => `S/ ${monto.toFixed(2)}`;

// "Lúcuma" y "lucuma" deben coincidir al buscar
const normalizar = (texto) => texto.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().trim();

const nombreCategoria = (id) => CATEGORIAS.find((c) => c.id === id)?.nombre ?? id;
const agotado = (producto) => producto.stock === 0;

const ETIQUETAS = {
  nuevo: { texto: "Nuevo", tema: "theme-accent" },
  popular: { texto: "Más vendido", tema: "theme-primary" },
};

// ---------- Filtrar y ordenar ----------
// Orden "destacados": primero los más vendidos, luego los nuevos y al final los agotados
const peso = (p) => (agotado(p) ? 3 : p.etiqueta === "popular" ? 0 : p.etiqueta === "nuevo" ? 1 : 2);

const ORDENES = {
  destacados: (a, b) => peso(a) - peso(b),
  "precio-asc": (a, b) => a.precio - b.precio,
  "precio-desc": (a, b) => b.precio - a.precio,
  nombre: (a, b) => a.nombre.localeCompare(b.nombre, "es"),
};

// Parámetros por defecto: sin filtros devuelve todo en orden destacado
export function filtrarProductos(lista, { categoria = "todos", texto = "", orden = "destacados" } = {}) {
  const buscado = normalizar(texto);
  return lista
    .filter((p) => categoria === "todos" || p.categoria === categoria)
    .filter((p) => !buscado || normalizar(`${p.nombre} ${p.descripcion} ${p.ingredientes.join(" ")}`).includes(buscado))
    .toSorted(ORDENES[orden] ?? ORDENES.destacados);
}

// ---------- Plantillas HTML ----------
const imagenProducto = (p, conTitulo = false) =>
  p.foto
    ? `<img src="${p.foto}" alt="${conTitulo ? p.nombre : ""}" loading="lazy">`
    : dibujarProducto(p.ilustracion, conTitulo ? p.nombre : "");

function insignias(p) {
  if (agotado(p)) return `<span class="badge theme-secondary">Agotado</span>`;
  const etiqueta = ETIQUETAS[p.etiqueta];
  return etiqueta ? `<span class="badge ${etiqueta.tema}">${etiqueta.texto}</span>` : "";
}

const botonAgregar = (p, extra = "") =>
  agotado(p)
    ? `<button class="btn btn-subtle theme-secondary ${extra}" type="button" disabled>Agotado</button>`
    : `<button class="btn btn-solid theme-primary ${extra}" type="button" data-agregar="${p.id}"
         aria-label="Agregar ${p.nombre} al carrito"><i class="bi bi-bag-plus" aria-hidden="true"></i> Agregar</button>`;

const tarjetaProducto = (p) => `
  <div class="col">
    <article class="card producto h-100 ${agotado(p) ? "producto-agotado" : ""}">
      <div class="producto-media" style="--tono: ${p.ilustracion.fondo}">
        ${imagenProducto(p)}
        <div class="producto-insignias">${insignias(p)}</div>
      </div>
      <div class="card-body producto-cuerpo">
        <p class="producto-categoria">${nombreCategoria(p.categoria)}</p>
        <h3 class="producto-nombre">
          <button class="producto-enlace" type="button" data-detalle="${p.id}">${p.nombre}</button>
        </h3>
        <p class="producto-descripcion">${p.descripcion}</p>
        <div class="producto-pie">
          <span class="producto-precio">${soles(p.precio)}</span>
          ${botonAgregar(p, "btn-sm")}
        </div>
      </div>
    </article>
  </div>`;

// ---------- Estado de la vista ----------
const estado = { categoria: "todos", texto: "", orden: "destacados" };

const $ = (selector) => document.querySelector(selector);

function pintarFiltros() {
  const contar = (id) => (id === "todos" ? productos.length : productos.filter((p) => p.categoria === id).length);
  const opciones = [{ id: "todos", nombre: "Todos" }, ...CATEGORIAS];
  $("#filtros").innerHTML = opciones
    .map(
      (c) => `<li class="nav-item">
        <button class="nav-link ${c.id === estado.categoria ? "active" : ""}" type="button"
                data-categoria="${c.id}" aria-pressed="${c.id === estado.categoria}">
          ${c.nombre} <span class="filtro-cantidad">${contar(c.id)}</span>
        </button>
      </li>`,
    )
    .join("");
}

function pintarCatalogo() {
  const lista = filtrarProductos(productos, estado);
  $("#grillaProductos").innerHTML = lista.map(tarjetaProducto).join("");
  $("#sinResultados").hidden = lista.length > 0;
  $("#textoBuscado").textContent = estado.texto;

  const n = lista.length;
  $("#resumenCatalogo").textContent = `${n} ${n === 1 ? "producto" : "productos"}`;
}

// ---------- Detalle del producto (Dialog de Bootstrap) ----------
let productoAbierto = null;

function abrirDetalle(id) {
  const p = productos.find((x) => x.id === id);
  if (!p) return;
  productoAbierto = p;

  $("#detalleMedia").style.setProperty("--tono", p.ilustracion.fondo);
  $("#detalleMedia").innerHTML = imagenProducto(p, true) + `<div class="producto-insignias">${insignias(p)}</div>`;
  $("#detalleCategoria").textContent = nombreCategoria(p.categoria);
  $("#detalleTitulo").textContent = p.nombre;
  $("#detallePrecio").textContent = soles(p.precio);
  $("#detallePorcion").textContent = p.porcion;
  $("#detalleDescripcion").textContent = p.descripcion;
  $("#detalleIngredientes").innerHTML = p.ingredientes.map((i) => `<li>${i}</li>`).join("");
  $("#detalleStock").textContent = agotado(p) ? "Agotado por hoy" : p.stock <= 5 ? `¡Quedan solo ${p.stock}!` : "Disponible hoy";
  $("#detalleStock").className = `detalle-stock ${agotado(p) ? "fg-danger" : p.stock <= 5 ? "fg-warning" : "fg-success"}`;

  const cantidad = $("#detalleCantidad");
  cantidad.value = 1;
  cantidad.max = Math.max(p.stock, 1);
  $("#detalleCompra").hidden = agotado(p);
  $("#detalleAgotado").hidden = !agotado(p);

  Dialog.getOrCreateInstance($("#detalleProducto")).show();
}

function cambiarCantidad(delta) {
  const input = $("#detalleCantidad");
  const nueva = Math.min(Math.max(Number(input.value) + delta, 1), Number(input.max));
  input.value = nueva;
}

// Avisa al resto de la tienda (el carrito, en la fase 4) que se quiere agregar algo
function pedirAgregar(id, cantidad = 1) {
  const producto = productos.find((p) => p.id === id);
  if (!producto || agotado(producto)) return;
  document.dispatchEvent(new CustomEvent("kuyay:agregar", { detail: { producto, cantidad } }));
}

// ---------- Inicio ----------
export function iniciarCatalogo() {
  pintarFiltros();
  pintarCatalogo();

  $("#filtros").addEventListener("click", (e) => {
    const boton = e.target.closest("[data-categoria]");
    if (!boton) return;
    estado.categoria = boton.dataset.categoria;
    pintarFiltros();
    pintarCatalogo();
  });

  $("#buscador").addEventListener("input", (e) => {
    estado.texto = e.target.value;
    pintarCatalogo();
  });

  $("#orden").addEventListener("change", (e) => {
    estado.orden = e.target.value;
    pintarCatalogo();
  });

  $("#limpiarBusqueda").addEventListener("click", () => {
    estado.texto = "";
    estado.categoria = "todos";
    $("#buscador").value = "";
    pintarFiltros();
    pintarCatalogo();
    $("#buscador").focus();
  });

  // Delegación de eventos: un solo listener para todas las tarjetas
  $("#grillaProductos").addEventListener("click", (e) => {
    const detalle = e.target.closest("[data-detalle]");
    const agregar = e.target.closest("[data-agregar]");
    if (detalle) abrirDetalle(detalle.dataset.detalle);
    if (agregar) pedirAgregar(agregar.dataset.agregar);
  });

  $("#detalleMenos").addEventListener("click", () => cambiarCantidad(-1));
  $("#detalleMas").addEventListener("click", () => cambiarCantidad(1));
  $("#detalleAgregar").addEventListener("click", () => {
    pedirAgregar(productoAbierto.id, Number($("#detalleCantidad").value));
    Dialog.getInstance($("#detalleProducto"))?.hide();
  });
}
