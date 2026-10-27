// =========================================================
// Kuyay · Pastelería de autor
// Punto de entrada: todas las páginas cargan este módulo y
// aquí se inicia solo lo que cada página necesita.
// Es un módulo ES (type="module"): sus variables NO son globales.
// =========================================================
import { Drawer } from "https://cdn.jsdelivr.net/npm/bootstrap@6.0.0-alpha.1/dist/js/bootstrap.bundle.min.js";
import { NEGOCIO } from "./config.js";
import { insertarComponentes } from "./componentes.js";
import { iniciarTema } from "./tema.js";
import { abrirDetalle, iniciarDetalle, iniciarDestacados, pintarCategorias } from "./catalogo.js";
import { iniciarCarrito } from "./carrito.js";
import { iniciarPedido } from "./pedido.js";
import { iniciarCuenta } from "./cuenta.js";
import { iniciarAnimaciones } from "./animaciones.js";
import { cargarCatalogo, obtenerSesion } from "./api.js";
import { CATEGORIAS, productos } from "./productos.js";

const $ = (selector) => document.querySelector(selector);
const existe = (selector) => document.querySelector(selector) !== null;

// ---------- Datos: base de datos (Neon) si la API responde; si no, js/productos.js ----------
await cargarCatalogo();

// ---------- Comunes a todas las páginas ----------
insertarComponentes({ conDetalle: existe("#islaCatalogo") || existe("#grillaDestacados"), whatsapp: NEGOCIO.whatsapp });
iniciarTema($("#btnTema"));
iniciarCarrito();

// ---------- Según la página ----------
if (existe("#grillaDestacados")) iniciarDestacados(); // Inicio
if (existe("#categoriasInicio")) pintarCategorias(); // Inicio
if (existe("#islaCatalogo")) montarCatalogoReact(); // Catálogo (React)
if (existe("#formPedido")) iniciarPedido(); // Pedido especial
if (existe("#cuentaPanel")) iniciarCuenta(); // Mi cuenta

// ---------- Botón de cuenta: muestra el nombre si hay sesión ----------
obtenerSesion().then((usuario) => {
  if (usuario) $("#btnCuenta .texto-cuenta").textContent = usuario.nombre.split(" ")[0];
});

// ---------- Catálogo hecho con React (isla dentro de la página Bootstrap) ----------
// React dibuja la grilla y los filtros; el carrito y el detalle siguen siendo los de la tienda.
async function montarCatalogoReact() {
  const contenedor = $("#islaCatalogo");
  try {
    const { montarCatalogo } = await import("./react/catalogo.js");
    montarCatalogo(contenedor, {
      productos: productos.map((p) => ({ ...p, unidad: p.porcion, imagen: p.foto ?? `img/productos/${p.id}.svg` })),
      categorias: [{ id: "todos", nombre: "Todos" }, ...CATEGORIAS],
      onAgregar: (producto, cantidad, origen) =>
        document.dispatchEvent(new CustomEvent("kuyay:agregar", { detail: { producto, cantidad, origen } })),
      onVerDetalle: (producto, tarjeta) => abrirDetalle(producto.id, tarjeta),
    });
    iniciarDetalle();
    // ?producto=torta-lucuma abre su detalle (lo usa el buscador del menú)
    const pedido = new URLSearchParams(location.search).get("producto");
    if (pedido) requestAnimationFrame(() => abrirDetalle(pedido));
  } catch (error) {
    console.error(error);
    contenedor.innerHTML = `<div class="alert theme-danger">No se pudo cargar el catálogo. Recarga la página.</div>`;
  }
}

// ---------- Drawers: cerrar al elegir un enlace ----------
// (No usamos data-bs-dismiss en enlaces: Bootstrap cancela la navegación.)
document.querySelectorAll(".drawer").forEach((drawer) => {
  drawer.addEventListener("click", (e) => {
    if (e.target.closest("a[href]")) Drawer.getInstance(drawer)?.hide();
  });
});

// ---------- Horario: "Abierto ahora" / "Cerrado" (página Visítanos) ----------
// Se calcula con la hora de Lima, aunque el visitante esté en otro país.
const horaEnLima = (fecha = new Date()) => {
  const partes = new Intl.DateTimeFormat("en-US", {
    timeZone: NEGOCIO.zonaHoraria,
    weekday: "short",
    hour: "numeric",
    minute: "numeric",
    hourCycle: "h23",
  }).formatToParts(fecha);
  const valor = (tipo) => partes.find((p) => p.type === tipo).value;
  const dias = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  return { dia: dias.indexOf(valor("weekday")), hora: Number(valor("hour")) + Number(valor("minute")) / 60 };
};

function estaAbierto({ dia, hora } = horaEnLima()) {
  const [abre, cierra] = NEGOCIO.horario[dia];
  return hora >= abre && hora < cierra;
}

if (existe("#estadoTienda")) {
  const abierto = estaAbierto();
  $("#estadoTienda").textContent = abierto ? "Abierto ahora" : "Cerrado ahora";
  $("#estadoTienda").classList.add(abierto ? "theme-success" : "theme-secondary");
  $(`[data-dia~="${horaEnLima().dia}"]`)?.classList.add("hoy");
}

// ---------- Pie de página ----------
$("#anio").textContent = new Date().getFullYear();

// Al final: así también se animan los elementos que se pintaron arriba
iniciarAnimaciones();
