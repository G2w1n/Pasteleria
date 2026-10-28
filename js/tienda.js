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
import { api, apiDisponible, cargarCatalogo, obtenerSesion, resumenDelDia } from "./api.js";
import { CATEGORIAS, productos } from "./productos.js";

const $ = (selector) => document.querySelector(selector);
const existe = (selector) => document.querySelector(selector) !== null;
const PERSONAL = ["administrador", "empleado"]; // pueden entrar al panel
// Los componentes React usan "unidad" e "imagen" (como en la práctica de la Semana 11)
const productosParaReact = () => productos.map((p) => ({ ...p, unidad: p.porcion, imagen: p.foto ?? `img/productos/${p.id}.svg` }));

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
if (existe("#islaPanel")) montarPanelReact().catch(console.error); // Panel (React)

// ---------- Botón de cuenta: muestra el nombre si hay sesión ----------
// Se vuelve a pintar al ingresar o salir (evento "kuyay:sesion"), sin recargar la página.
function pintarBotonCuenta(usuario) {
  $("#btnCuenta .texto-cuenta").textContent = usuario ? usuario.nombre.split(" ")[0] : "Ingresar";
  $("#btnCuenta").setAttribute("aria-label", usuario ? `Mi cuenta (${usuario.nombre})` : "Ingresar o crear cuenta");
  // Administradores y empleados ven el enlace al panel en el menú
  const personal = usuario && PERSONAL.includes(usuario.rol);
  if (personal && !existe("#enlacePanel")) {
    $(".navbar-nav").insertAdjacentHTML("beforeend",
      `<li class="nav-item"><a class="nav-link enlace-panel" id="enlacePanel" href="admin.html"${location.pathname.endsWith("admin.html") ? ' aria-current="page"' : ""}><i class="bi bi-speedometer2" aria-hidden="true"></i> Panel</a></li>`);
  }
  if (!personal) $("#enlacePanel")?.closest("li").remove();
}
obtenerSesion().then(pintarBotonCuenta);
document.addEventListener("kuyay:sesion", (e) => pintarBotonCuenta(e.detail));

// ---------- Panel de la tienda (React) en admin.html ----------
async function montarPanelReact() {
  const contenedor = $("#islaPanel");
  const aviso = (icono, titulo, texto, enlace = "") =>
    (contenedor.innerHTML = `<div class="sin-resultados"><i class="bi ${icono}" aria-hidden="true"></i>
      <p class="fw-semibold mb-0">${titulo}</p><p class="fg-3">${texto}</p>${enlace}</div>`);
  if (!apiDisponible()) return aviso("bi-cloud-slash", "El panel necesita la base de datos", "Ábrelo desde la página publicada en Vercel.");
  const usuario = await obtenerSesion();
  if (!usuario) return aviso("bi-lock", "Inicia sesión", "El panel es solo para el equipo de Kuyay.", `<a class="btn btn-solid theme-primary" href="cuenta.html">Ingresar</a>`);
  if (!PERSONAL.includes(usuario.rol)) return aviso("bi-shield-lock", "No tienes acceso al panel", "Tu cuenta es de cliente.", `<a class="btn btn-outline theme-primary" href="index.html">Volver a la tienda</a>`);
  $("#panelSaludo").textContent = `Hola, ${usuario.nombre.split(" ")[0]} · ${usuario.rol === "administrador" ? "Administrador" : "Empleado"}`;
  const { montarPanel } = await import("./react/panel.js");
  montarPanel(contenedor, { usuario, api });
}

// ---------- Catálogo hecho con React (isla dentro de la página Bootstrap) ----------
// React dibuja la grilla y los filtros; el carrito y el detalle siguen siendo los de la tienda.
async function montarCatalogoReact() {
  const contenedor = $("#islaCatalogo");
  try {
    const { montarCatalogo } = await import("./react/catalogo.js");
    montarCatalogo(contenedor, {
      productos: productosParaReact(),
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

// ---------- Buscador del menú (React), en todas las páginas ----------

async function montarBuscadorReact() {
  const { montarBuscador } = await import("./react/buscador.js");
  montarBuscador($("#islaBuscador"), {
    productos: productosParaReact(),
    categorias: CATEGORIAS,
    // En el catálogo el detalle se abre ahí mismo; en otras páginas se va al catálogo
    onElegir: (producto) =>
      existe("#islaCatalogo") ? abrirDetalle(producto.id) : (location.href = `catalogo.html?producto=${producto.id}`),
    urlResultados: (texto) => `catalogo.html?q=${encodeURIComponent(texto)}`,
  });
}
if (existe("#islaBuscador")) montarBuscadorReact().catch(console.error);

// ---------- Seguimiento sin cuenta (React) en "Mi cuenta" ----------
if (existe("#islaSeguimiento") && apiDisponible()) {
  import("./react/seguimiento.js").then(({ montarSeguimiento }) =>
    montarSeguimiento($("#islaSeguimiento"), { api, codigoInicial: new URLSearchParams(location.search).get("seguir") ?? "" }),
  ).catch(console.error);
}

// ---------- "Hoy en Kuyay" (React) en el Inicio: solo lo ve el personal ----------
let enVivoMontado = false;
async function pintarEnVivo(usuario) {
  const esPersonal = PERSONAL.includes(usuario?.rol);
  $("#seccionEnVivo").hidden = !esPersonal;
  if (!esPersonal || enVivoMontado) return;
  enVivoMontado = true;
  const { montarEnVivo } = await import("./react/envivo.js");
  montarEnVivo($("#islaEnVivo"), {
    inicial: resumenDelDia(),
    productosIniciales: productos,
    api,
    onVer: (producto) => abrirDetalle(producto.id),
  });
}
if (existe("#islaEnVivo") && apiDisponible() && resumenDelDia()) {
  obtenerSesion().then(pintarEnVivo).catch(console.error);
  document.addEventListener("kuyay:sesion", (e) => pintarEnVivo(e.detail).catch(console.error));
}

// ---------- Reseñas (React) en la pestaña del detalle ----------
document.addEventListener("kuyay:detalle", async ({ detail: { producto } }) => {
  if (!apiDisponible()) return;
  const [{ mostrarResenas }, usuario] = await Promise.all([import("./react/resenas.js"), obtenerSesion()]);
  mostrarResenas($("#islaResenas"), {
    productoId: producto.id,
    usuario,
    api,
    onTotal: (total) => ($("#pestanaResenas").textContent = total ? `Reseñas (${total})` : "Reseñas"),
  });
});

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
