// =========================================================
// Página "Mi cuenta": ingresar, crear cuenta y seguir pedidos.
// La sesión vive en una cookie HttpOnly que crea la API:
// este archivo nunca ve ni guarda la contraseña o el token.
// =========================================================
import { api, apiDisponible, motivoSinConexion, obtenerSesion, olvidarSesion } from "./api.js";
import { soles } from "./catalogo.js";
import { confeti } from "./animaciones.js";
import { productos } from "./productos.js";

const $ = (selector) => document.querySelector(selector);

const ROLES = { cliente: "Cliente", empleado: "Empleado", administrador: "Administrador" };
const PASOS_RECOJO = ["recibido", "en_preparacion", "listo", "entregado"];
const PASOS_DELIVERY = ["recibido", "en_preparacion", "en_camino", "entregado"];
const NOMBRE_ESTADO = {
  recibido: "Recibido",
  en_preparacion: "En preparación",
  listo: "Listo para recoger",
  en_camino: "En camino",
  entregado: "Entregado",
  cancelado: "Cancelado",
};

// Evita que un nombre con < o > se interprete como HTML
const escapar = (texto) =>
  String(texto).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);

const fechaCorta = (iso) =>
  new Intl.DateTimeFormat("es-PE", { day: "numeric", month: "short", hour: "numeric", minute: "2-digit", timeZone: "America/Lima" }).format(new Date(iso));

// Fecha y franja de entrega elegidas en el checkout (pedidos antiguos no las tienen)
const entrega = (p) =>
  p.fecha_entrega
    ? ` · ${new Intl.DateTimeFormat("es-PE", { weekday: "short", day: "numeric", month: "short", timeZone: "UTC" }).format(new Date(`${p.fecha_entrega}T12:00:00Z`))}, ${p.franja === "manana" ? "mañana" : "tarde"}`
    : "";

const iniciales = (nombre) =>
  nombre.trim().split(/\s+/).slice(0, 2).map((p) => p[0]).join("").toUpperCase();

function mostrar(vista) {
  for (const id of ["cuentaCargando", "cuentaSinApi", "cuentaAcceso", "cuentaPanel"]) $(`#${id}`).hidden = id !== vista;
}

// ---------- Pedidos con su seguimiento (Stepper de Bootstrap 6) ----------
function tarjetaPedido(p) {
  const pasos = p.tipo_entrega === "delivery" ? PASOS_DELIVERY : PASOS_RECOJO;
  const actual = pasos.indexOf(p.estado);
  const seguimiento = p.estado === "cancelado"
    ? `<p class="pedido-cancelado"><i class="bi bi-x-circle" aria-hidden="true"></i> Pedido cancelado</p>`
    : `<ol class="stepper stepper-horizontal pedido-seguimiento" aria-label="Seguimiento del pedido ${p.codigo}">
        ${pasos.map((paso, i) => `<li class="stepper-item ${i <= actual ? "active" : ""}" ${i === actual ? 'aria-current="step"' : ""}>${NOMBRE_ESTADO[paso]}</li>`).join("")}
      </ol>`;
  return `
    <article class="card pedido-tarjeta revelar">
      <div class="card-body">
        <header class="pedido-cabecera">
          <h3 class="fs-lg mb-0">${p.codigo}</h3>
          <span class="badge ${p.estado === "cancelado" ? "theme-secondary" : p.estado === "entregado" ? "theme-success" : "theme-accent"}">${NOMBRE_ESTADO[p.estado]}</span>
          <span class="fg-3 fs-sm pedido-fecha">${fechaCorta(p.creado_en)}</span>
        </header>
        ${seguimiento}
        <ul class="pedido-productos">
          ${p.productos.map((it) => `<li><span>${it.cantidad} × ${escapar(it.nombre)}</span><span>${soles(it.importe)}</span></li>`).join("")}
        </ul>
        <p class="pedido-total">
          <span class="fg-3 fs-sm">${p.tipo_entrega === "delivery" ? `Delivery a ${escapar(p.distrito)}` : "Recojo en tienda"}${entrega(p)} · ${p.metodo_pago}</span>
          <strong>${soles(p.total)}</strong>
        </p>
      </div>
    </article>`;
}

async function pintarPedidos() {
  const caja = $("#misPedidos");
  caja.innerHTML = `<p class="fg-3"><span class="spinner-border spinner-sm" aria-hidden="true"></span> Buscando tus pedidos…</p>`;
  try {
    const { pedidos } = await api("pedidos");
    caja.innerHTML = pedidos.length
      ? pedidos.map(tarjetaPedido).join("")
      : `<div class="carrito-vacio">
          <i class="bi bi-receipt" aria-hidden="true"></i>
          <p class="fw-semibold mb-0">Aún no tienes pedidos</p>
          <p class="fg-3 fs-sm">Cuando confirmes uno desde el carrito, lo verás aquí.</p>
          <a class="btn btn-outline theme-primary" href="catalogo.html">Ver catálogo</a>
        </div>`;
    caja.querySelectorAll(".revelar").forEach((el) => el.classList.add("visible"));
  } catch (error) {
    caja.innerHTML = `<div class="alert theme-danger" role="alert">${escapar(error.message)}</div>`;
  }
}

// Avisa al menú (js/tienda.js) que cambió la sesión: muestra el nombre o "Ingresar"
const avisarSesion = (usuario) => document.dispatchEvent(new CustomEvent("kuyay:sesion", { detail: usuario }));

function pintarPanel(usuario) {
  avisarSesion(usuario);
  $("#cuentaAvatar").textContent = iniciales(usuario.nombre);
  $("#cuentaNombre").textContent = `Hola, ${usuario.nombre.split(" ")[0]}`;
  $("#cuentaCorreo").textContent = usuario.correo;
  $("#cuentaRol").textContent = ROLES[usuario.rol] ?? usuario.rol;
  $("#cuentaIrPanel").hidden = usuario.rol === "cliente";
  mostrar("cuentaPanel");
  pintarPedidos();
}

export async function iniciarCuenta() {
  if (!apiDisponible()) {
    if (motivoSinConexion()) $("#cuentaMotivo").textContent = `Detalle técnico: ${motivoSinConexion()}`;
    return mostrar("cuentaSinApi");
  }

  // Ingresar / Crear cuenta (React): al entrar se muestra el panel de la cuenta
  const { montarAcceso } = await import("./react/acceso.js");
  // cuenta.html#registro abre directo en "Crear cuenta" (solo la primera vez; al cerrar sesión, "Ingresar")
  const mostrarAcceso = (inicio = location.hash === "#registro" ? "registro" : "ingresar") => {
    // ?restablecer=... viene del enlace del correo "¿Olvidaste tu contraseña?"
    const tokenRestablecer = new URLSearchParams(location.search).get("restablecer") ?? "";
    montarAcceso($("#islaAcceso"), {
      api,
      inicio,
      tokenRestablecer,
      // Para las recomendaciones de la bienvenida (según los gustos elegidos)
      productos: productos.map((p) => ({ ...p, imagen: p.foto ?? `img/productos/${p.id}.svg` })),
      onBienvenida: () => confeti(), // cuenta nueva: confeti con el cupón de regalo
      onIngreso: async (usuario) => {
        if (tokenRestablecer) history.replaceState(null, "", location.pathname); // el enlace ya se usó
        await obtenerSesion({ recargar: true });
        pintarPanel(usuario);
        $("#cuentaPanel").scrollIntoView({ block: "start", behavior: "smooth" });
      },
    });
    mostrar("cuentaAcceso");
  };

  $("#btnSalir").addEventListener("click", async () => {
    await api("auth?accion=salir", { metodo: "POST" }).catch(() => {});
    olvidarSesion();
    avisarSesion(null);
    mostrarAcceso("ingresar");
  });

  const usuario = await obtenerSesion();
  if (usuario) pintarPanel(usuario);
  else mostrarAcceso();
}
