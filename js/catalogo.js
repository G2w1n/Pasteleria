// =========================================================
// Catálogo: tarjetas, filtros, buscador, orden y detalle.
// Las tarjetas y el detalle se usan en dos páginas:
// Inicio (favoritos) y Catálogo (todos los productos).
// =========================================================
import { Dialog } from "https://cdn.jsdelivr.net/npm/bootstrap@6.0.0-alpha.1/dist/js/bootstrap.bundle.min.js";
import { CATEGORIAS, productos } from "./productos.js";
import { dibujarProducto } from "./ilustraciones.js";
import { transicion, transicionConTipo } from "./animaciones.js";

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

// view-transition-name: cada tarjeta tiene un nombre único para que,
// al filtrar u ordenar, el navegador la deslice hasta su nueva posición
const tarjetaProducto = (p) => `
  <div class="col" style="view-transition-name: tarjeta-${p.id}">
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

const $ = (selector) => document.querySelector(selector);

// ---------- Agregar (lo escucha el carrito) ----------
// "origen" es el dibujo que vuela hasta el carrito
function pedirAgregar(id, cantidad = 1, origen = null) {
  const producto = productos.find((p) => p.id === id);
  if (!producto || agotado(producto)) return;
  document.dispatchEvent(new CustomEvent("kuyay:agregar", { detail: { producto, cantidad, origen } }));
}

// ---------- Detalle del producto (Dialog de Bootstrap) ----------
let productoAbierto = null;

// La imagen de la tarjeta "crece" hasta la ventana de detalle: la tarjeta y el
// detalle comparten por un momento el mismo view-transition-name
function abrirDetalle(id, tarjeta = null) {
  const p = productos.find((x) => x.id === id);
  if (!p) return;
  const dibujo = tarjeta?.querySelector(".producto-media");
  const dialogo = $("#detalleProducto");

  if (dibujo) dibujo.style.viewTransitionName = "producto-activo";
  const vista = transicionConTipo("detalle", () => {
    if (dibujo) dibujo.style.viewTransitionName = "";
    $("#detalleMedia").style.viewTransitionName = "producto-activo";
    dialogo.classList.add("dialog-instant"); // sin la animación propia de Bootstrap: la hace la transición
    llenarDetalle(p);
    // show() abre el <dialog> al instante; no esperamos su promesa porque
    // Bootstrap la resuelve con un retardo que frenaría la animación
    Dialog.getOrCreateInstance(dialogo).show();
  });
  // Sin soporte, transicionConTipo ya abrió el detalle; solo queda limpiar
  const limpiar = () => {
    $("#detalleMedia").style.viewTransitionName = "";
    dialogo.classList.remove("dialog-instant");
  };
  if (vista) vista.finished.finally(limpiar);
  else limpiar();
}

function llenarDetalle(p) {
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
}

function cambiarCantidad(delta) {
  const input = $("#detalleCantidad");
  input.value = Math.min(Math.max(Number(input.value) + delta, 1), Number(input.max));
}

function iniciarDetalle() {
  $("#detalleMenos").addEventListener("click", () => cambiarCantidad(-1));
  $("#detalleMas").addEventListener("click", () => cambiarCantidad(1));
  $("#detalleAgregar").addEventListener("click", async () => {
    // El dibujo vuela desde la tarjeta del catálogo, cuando el detalle ya se cerró
    const id = productoAbierto.id;
    const cantidad = Number($("#detalleCantidad").value);
    await Dialog.getInstance($("#detalleProducto"))?.hide();
    const tarjeta = document.querySelector(`[data-detalle="${id}"]`)?.closest(".producto");
    pedirAgregar(id, cantidad, tarjeta?.querySelector(".producto-media > svg, .producto-media > img"));
  });
}

// El botón cambia un momento a "✓ Agregado" y luego vuelve a la normalidad
function confirmarBoton(boton) {
  if (boton.classList.contains("btn-agregado")) return;
  const original = boton.innerHTML;
  boton.classList.add("btn-agregado");
  boton.innerHTML = `<i class="bi bi-check-lg" aria-hidden="true"></i> Agregado`;
  setTimeout(() => {
    boton.classList.remove("btn-agregado");
    boton.innerHTML = original;
  }, 1600);
}

// Delegación de eventos: un solo listener para todas las tarjetas de una grilla
function activarTarjetas(grilla) {
  grilla.addEventListener("click", (e) => {
    const detalle = e.target.closest("[data-detalle]");
    const agregar = e.target.closest("[data-agregar]");
    if (detalle) abrirDetalle(detalle.dataset.detalle, detalle.closest(".producto"));
    if (agregar) {
      const dibujo = agregar.closest(".producto").querySelector(".producto-media > svg, .producto-media > img");
      pedirAgregar(agregar.dataset.agregar, 1, dibujo);
      confirmarBoton(agregar);
    }
  });
}

// ================= PÁGINA INICIO =================

// Los 4 favoritos: más vendidos y nuevos, sin agotados
export function iniciarDestacados() {
  const grilla = $("#grillaDestacados");
  grilla.innerHTML = filtrarProductos(productos).filter((p) => !agotado(p)).slice(0, 4).map(tarjetaProducto).join("");
  activarTarjetas(grilla);
  iniciarDetalle();
}

// Tarjetas de categoría que llevan al catálogo ya filtrado
export function pintarCategorias() {
  $("#categoriasInicio").innerHTML = CATEGORIAS.map((c) => {
    const lista = productos.filter((p) => p.categoria === c.id);
    const muestra = lista.find((p) => p.etiqueta) ?? lista[0];
    return `<li class="revelar">
      <a class="categoria-tarjeta" href="catalogo.html?categoria=${c.id}" style="--tono: ${muestra.ilustracion.fondo}">
        <span class="categoria-dibujo">${dibujarProducto(muestra.ilustracion)}</span>
        <span class="categoria-nombre">${c.nombre}</span>
        <span class="categoria-cantidad">${lista.length} productos <i class="bi bi-arrow-right" aria-hidden="true"></i></span>
      </a>
    </li>`;
  }).join("");
}

// ================= PÁGINA CATÁLOGO =================

// El estado se lee de la URL (?categoria=tortas&q=lucuma&orden=precio-asc)
// para que un enlace filtrado se pueda compartir
const leerURL = () => {
  const p = new URLSearchParams(location.search);
  const categoria = p.get("categoria");
  return {
    categoria: CATEGORIAS.some((c) => c.id === categoria) ? categoria : "todos",
    texto: p.get("q") ?? "",
    orden: ORDENES[p.get("orden")] ? p.get("orden") : "destacados",
  };
};

function escribirURL({ categoria, texto, orden }) {
  const p = new URLSearchParams();
  if (categoria !== "todos") p.set("categoria", categoria);
  if (texto) p.set("q", texto);
  if (orden !== "destacados") p.set("orden", orden);
  history.replaceState(null, "", p.size ? `?${p}` : location.pathname);
}

export function iniciarCatalogo() {
  const estado = leerURL();

  function pintarFiltros() {
    const contar = (id) => (id === "todos" ? productos.length : productos.filter((p) => p.categoria === id).length);
    $("#filtros").innerHTML = [{ id: "todos", nombre: "Todos" }, ...CATEGORIAS]
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
    $("#resumenCatalogo").textContent = `${lista.length} ${lista.length === 1 ? "producto" : "productos"}`;
    escribirURL(estado);
  }

  // Los cambios de filtro y orden se animan; el buscador no (se escribe letra por letra)
  const actualizar = ({ animar = true } = {}) => (animar ? transicion(pintarCatalogo) : pintarCatalogo());

  $("#buscador").value = estado.texto;
  $("#orden").value = estado.orden;
  pintarFiltros();
  pintarCatalogo();

  $("#filtros").addEventListener("click", (e) => {
    const boton = e.target.closest("[data-categoria]");
    if (!boton || boton.dataset.categoria === estado.categoria) return;
    estado.categoria = boton.dataset.categoria;
    pintarFiltros();
    actualizar();
  });

  $("#buscador").addEventListener("input", (e) => {
    estado.texto = e.target.value;
    actualizar({ animar: false });
  });

  $("#orden").addEventListener("change", (e) => {
    estado.orden = e.target.value;
    actualizar();
  });

  $("#limpiarBusqueda").addEventListener("click", () => {
    estado.texto = "";
    estado.categoria = "todos";
    $("#buscador").value = "";
    pintarFiltros();
    actualizar();
    $("#buscador").focus();
  });

  activarTarjetas($("#grillaProductos"));
  iniciarDetalle();
}
