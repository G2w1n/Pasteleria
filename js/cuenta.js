// =========================================================
// Página "Mi cuenta": ingresar, crear cuenta y seguir pedidos.
// La sesión vive en una cookie HttpOnly que crea la API:
// este archivo nunca ve ni guarda la contraseña o el token.
// =========================================================
import { Strength } from "https://cdn.jsdelivr.net/npm/bootstrap@6.0.0-alpha.1/dist/js/bootstrap.bundle.min.js";
import { api, apiDisponible, motivoSinConexion, obtenerSesion, olvidarSesion } from "./api.js";
import { soles } from "./catalogo.js";
import { confeti } from "./animaciones.js";

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
          <span class="fg-3 fs-sm">${p.tipo_entrega === "delivery" ? `Delivery a ${escapar(p.distrito)}` : "Recojo en tienda"} · ${p.metodo_pago}</span>
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

function pintarPanel(usuario) {
  $("#cuentaAvatar").textContent = iniciales(usuario.nombre);
  $("#cuentaNombre").textContent = `Hola, ${usuario.nombre.split(" ")[0]}`;
  $("#cuentaCorreo").textContent = usuario.correo;
  $("#cuentaRol").textContent = ROLES[usuario.rol] ?? usuario.rol;
  $("#cuentaIrPanel").hidden = usuario.rol === "cliente";
  mostrar("cuentaPanel");
  pintarPedidos();
}

// ---------- Formularios ----------
function enviarFormulario(form, error, alEnviar) {
  const boton = form.querySelector("[type=submit]");
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    error.hidden = true;
    form.querySelectorAll(".is-invalid").forEach((c) => c.classList.remove("is-invalid"));
    const invalido = [...form.elements].find((c) => c.willValidate && !c.checkValidity());
    if (invalido) {
      invalido.classList.add("is-invalid");
      error.textContent = mensajeCampo(invalido);
      error.hidden = false;
      invalido.focus();
      return;
    }
    boton.disabled = true;
    boton.querySelector(".spinner-border").hidden = false;
    try {
      await alEnviar(Object.fromEntries(new FormData(form)));
    } catch (err) {
      error.textContent = err.message;
      error.hidden = false;
    } finally {
      boton.disabled = false;
      boton.querySelector(".spinner-border").hidden = true;
    }
  });
}

function mensajeCampo(campo) {
  if (campo.name === "nombre") return "Escribe tu nombre (mínimo 3 letras).";
  if (campo.name === "correo") return campo.value ? "Revisa el formato del correo." : "Escribe tu correo.";
  if (campo.name === "telefono") return "El celular debe tener 9 dígitos y empezar con 9.";
  if (campo.name === "clave") return campo.value ? "La contraseña debe tener al menos 8 caracteres." : "Escribe tu contraseña.";
  return "Revisa este campo.";
}

export async function iniciarCuenta() {
  if (!apiDisponible()) {
    if (motivoSinConexion()) $("#cuentaMotivo").textContent = `Detalle técnico: ${motivoSinConexion()}`;
    return mostrar("cuentaSinApi");
  }

  // Mostrar u ocultar la contraseña
  document.querySelectorAll("[data-ver]").forEach((boton) => {
    boton.addEventListener("click", () => {
      const campo = document.getElementById(boton.dataset.ver);
      const visible = campo.type === "password";
      campo.type = visible ? "text" : "password";
      boton.setAttribute("aria-pressed", visible);
      boton.setAttribute("aria-label", visible ? "Ocultar contraseña" : "Mostrar contraseña");
      boton.querySelector("i").className = `bi ${visible ? "bi-eye-slash" : "bi-eye"}`;
    });
  });

  // Medidor de seguridad de la contraseña (Strength de Bootstrap 6)
  Strength.getOrCreateInstance($("#fuerzaClave"), {
    input: "#reClave",
    messages: { weak: "Débil: agrega más caracteres", fair: "Regular: mezcla mayúsculas y números", good: "Buena", strong: "¡Muy segura!" },
  });

  $("#reTelefono").addEventListener("input", (e) => {
    e.target.value = e.target.value.replace(/\D/g, "");
  });

  enviarFormulario($("#formIngresar"), $("#errorIngresar"), async (datos) => {
    const { usuario } = await api("auth?accion=login", { metodo: "POST", datos });
    await obtenerSesion({ recargar: true });
    pintarPanel(usuario);
  });

  enviarFormulario($("#formRegistro"), $("#errorRegistro"), async (datos) => {
    const { usuario } = await api("auth?accion=registro", { metodo: "POST", datos });
    await obtenerSesion({ recargar: true });
    pintarPanel(usuario);
    confeti();
  });

  $("#btnSalir").addEventListener("click", async () => {
    await api("auth?accion=salir", { metodo: "POST" }).catch(() => {});
    olvidarSesion();
    $("#formIngresar").reset();
    mostrar("cuentaAcceso");
  });

  const usuario = await obtenerSesion();
  if (usuario) pintarPanel(usuario);
  else mostrar("cuentaAcceso");
}
