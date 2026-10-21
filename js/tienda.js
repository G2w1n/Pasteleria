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
import { iniciarCatalogo, iniciarDestacados, pintarCategorias } from "./catalogo.js";
import { iniciarCarrito } from "./carrito.js";
import { iniciarPedido } from "./pedido.js";
import { iniciarAnimaciones } from "./animaciones.js";

const $ = (selector) => document.querySelector(selector);
const existe = (selector) => document.querySelector(selector) !== null;

// ---------- Comunes a todas las páginas ----------
insertarComponentes({ conDetalle: existe("#grillaProductos") || existe("#grillaDestacados"), whatsapp: NEGOCIO.whatsapp });
iniciarTema($("#btnTema"));
iniciarCarrito();

// ---------- Según la página ----------
if (existe("#grillaDestacados")) iniciarDestacados(); // Inicio
if (existe("#categoriasInicio")) pintarCategorias(); // Inicio
if (existe("#grillaProductos")) iniciarCatalogo(); // Catálogo
if (existe("#formPedido")) iniciarPedido(); // Pedido especial

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
