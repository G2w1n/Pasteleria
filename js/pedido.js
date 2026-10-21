// =========================================================
// Pedido especial: torta personalizada.
// Precio en vivo, vista previa que cambia de color,
// validación con reglas propias y envío por WhatsApp.
// =========================================================
import { NEGOCIO } from "./config.js";
import { soles } from "./catalogo.js";
import { sumar } from "./carrito.js";
import { dibujarProducto } from "./ilustraciones.js";
import { animarNumero, confeti } from "./animaciones.js";

// ---------- Opciones y precios ----------
// "color" se usa para pintar la vista previa de la torta
const TAMANOS = [
  { id: "mini", nombre: "Mini", detalle: "6 porciones", precio: 65 },
  { id: "mediana", nombre: "Mediana", detalle: "12 porciones", precio: 110 },
  { id: "grande", nombre: "Grande", detalle: "20 porciones", precio: 170 },
  { id: "fiesta", nombre: "Fiesta", detalle: "30 porciones · 2 pisos", precio: 240 },
];
const BIZCOCHOS = [
  { id: "vainilla", nombre: "Vainilla", precio: 0, color: "#f6e4c3" },
  { id: "chocolate", nombre: "Cacao 70 %", precio: 10, color: "#5a352c" },
  { id: "lucuma", nombre: "Lúcuma", precio: 8, color: "#f0c27a" },
  { id: "red-velvet", nombre: "Red velvet de betarraga", precio: 12, color: "#9b2335" },
];
const RELLENOS = [
  { id: "manjar", nombre: "Manjar blanco", precio: 0, color: "#c98a4b" },
  { id: "fudge", nombre: "Fudge de chocolate", precio: 0, color: "#3a2420" },
  { id: "crema-lucuma", nombre: "Crema de lúcuma", precio: 8, color: "#e9a23b" },
  { id: "maracuya", nombre: "Mousse de maracuyá", precio: 6, color: "#f2b705" },
  { id: "frutos-rojos", nombre: "Frutos rojos", precio: 10, color: "#b3264f" },
];
const COBERTURAS = [
  { id: "chantilly", nombre: "Chantilly", precio: 0, color: "#fffaf2" },
  { id: "buttercream", nombre: "Buttercream de mora", precio: 8, color: "#d98fb0" },
  { id: "ganache", nombre: "Ganache de cacao", precio: 10, color: "#4a2a22" },
  { id: "fondant", nombre: "Fondant decorado", precio: 25, color: "#f8e6ec" },
];
const EXTRAS = [
  { id: "topper", nombre: "Topper personalizado", precio: 18 },
  { id: "flores", nombre: "Flores comestibles", precio: 15 },
  { id: "aguaymanto", nombre: "Aguaymantos frescos", precio: 10 },
  { id: "foto", nombre: "Foto comestible", precio: 25 },
  { id: "velas", nombre: "Velas y número", precio: 6 },
];

const DIAS_ANTICIPACION = 2;
const DIAS_MAXIMO = 60;
const DOMINGO = 0;

const $ = (selector) => document.querySelector(selector);
const porId = (lista, id) => lista.find((op) => op.id === id) ?? lista[0];
const conPrecio = (op) => (op.precio ? `${op.nombre} · +S/ ${op.precio}` : op.nombre);

// ---------- Precio (usa sumar con parámetro rest) ----------
export function calcularPrecio({ tamano, bizcocho, relleno, cobertura, extras = [] }) {
  return sumar(
    porId(TAMANOS, tamano).precio,
    porId(BIZCOCHOS, bizcocho).precio,
    porId(RELLENOS, relleno).precio,
    porId(COBERTURAS, cobertura).precio,
    ...extras.map((id) => porId(EXTRAS, id).precio),
  );
}

// ---------- Fechas (siempre con el calendario de Lima) ----------
// Trabajamos con texto "AAAA-MM-DD", igual que <input type="date">
const hoyEnLima = () => new Intl.DateTimeFormat("en-CA", { timeZone: NEGOCIO.zonaHoraria }).format(new Date());

const sumarDias = (fechaTexto, dias) => {
  const fecha = new Date(`${fechaTexto}T12:00:00Z`);
  fecha.setUTCDate(fecha.getUTCDate() + dias);
  return fecha.toISOString().slice(0, 10);
};

const diaSemana = (fechaTexto) => new Date(`${fechaTexto}T12:00:00Z`).getUTCDay();

const fechaLarga = (fechaTexto) =>
  new Intl.DateTimeFormat("es-PE", { weekday: "long", day: "numeric", month: "long", timeZone: "UTC" }).format(new Date(`${fechaTexto}T12:00:00Z`));

// ---------- Leer el formulario ----------
function leerPedido(form) {
  const datos = new FormData(form);
  return {
    tamano: datos.get("tamano"),
    bizcocho: datos.get("bizcocho"),
    relleno: datos.get("relleno"),
    cobertura: datos.get("cobertura"),
    extras: datos.getAll("extras"),
    ocasion: datos.get("ocasion"),
    mensaje: datos.get("mensaje").trim(),
    alergias: datos.get("alergias").trim(),
    fecha: datos.get("fecha"),
    franja: datos.get("franja"),
    entrega: datos.get("entrega"),
    distrito: datos.get("distrito"),
    direccion: datos.get("direccion").trim(),
    nombre: datos.get("nombre").trim(),
    telefono: datos.get("telefono").trim(),
    correo: datos.get("correo").trim(),
  };
}

// ---------- Validación ----------
// Reglas que HTML no puede expresar solo. Devuelven el mensaje de error o "".
function reglaFecha(fecha) {
  if (!fecha) return "Elige la fecha de entrega.";
  const minima = sumarDias(hoyEnLima(), DIAS_ANTICIPACION);
  const maxima = sumarDias(hoyEnLima(), DIAS_MAXIMO);
  if (fecha < minima) return `Necesitamos al menos ${DIAS_ANTICIPACION} días. La fecha más cercana es el ${fechaLarga(minima)}.`;
  if (fecha > maxima) return `Tomamos pedidos hasta con ${DIAS_MAXIMO} días de anticipación.`;
  return "";
}

const reglaFranja = (fecha, franja) =>
  fecha && diaSemana(fecha) === DOMINGO && franja === "tarde" ? "Los domingos solo entregamos en la mañana (cerramos a las 2:00 p. m.)." : "";

function aplicarReglas(form) {
  const p = leerPedido(form);
  const delivery = p.entrega === "delivery";

  form.fecha.setCustomValidity(reglaFecha(p.fecha));
  form.franja.setCustomValidity(reglaFranja(p.fecha, p.franja));
  form.distrito.required = delivery;
  form.direccion.required = delivery;

  $("#fechaError").textContent = reglaFecha(p.fecha);
  $("#franjaError").textContent = reglaFranja(p.fecha, p.franja);
}

const CAMPOS = ["fecha", "franja", "distrito", "direccion", "nombre", "telefono", "correo"];

// Marca en rojo solo los campos que la persona ya tocó (o todos al enviar)
function marcar(campo) {
  campo.classList.toggle("is-invalid", !campo.checkValidity());
  campo.setAttribute("aria-invalid", String(!campo.checkValidity()));
}

const ETIQUETAS = { fecha: "Fecha de entrega", franja: "Horario", distrito: "Distrito", direccion: "Dirección", nombre: "Nombre", telefono: "Celular", correo: "Correo" };

function mostrarErrores(invalidos) {
  const caja = $("#pedidoErrores");
  if (invalidos.length === 0) {
    caja.hidden = true;
    return;
  }
  caja.innerHTML = `<div>
    <strong><i class="bi bi-exclamation-triangle-fill" aria-hidden="true"></i>
    Revisa ${invalidos.length === 1 ? "este campo" : `estos ${invalidos.length} campos`}:</strong>
    <ul class="mb-0 mt-2">${invalidos.map((c) => `<li><a class="alert-link" href="#${c.id}">${ETIQUETAS[c.name]}</a></li>`).join("")}</ul>
  </div>`;
  caja.hidden = false;
}

// ---------- Resumen en vivo ----------
function pintarResumen(form) {
  const p = leerPedido(form);
  const tamano = porId(TAMANOS, p.tamano);
  const bizcocho = porId(BIZCOCHOS, p.bizcocho);
  const relleno = porId(RELLENOS, p.relleno);
  const cobertura = porId(COBERTURAS, p.cobertura);
  const extras = p.extras.map((id) => porId(EXTRAS, id).nombre);

  // La vista previa reutiliza la ilustración "rebanada" con los colores elegidos
  $("#resumenMedia").innerHTML = dibujarProducto(
    { forma: "rebanada", masa: bizcocho.color, relleno: relleno.color, cobertura: cobertura.color, topping: p.extras.includes("aguaymanto") ? "#f2a516" : "#8e2c4e" },
    `Vista previa: torta de ${bizcocho.nombre} con ${relleno.nombre} y ${cobertura.nombre}`,
  );

  const filas = [
    ["Tamaño", `${tamano.nombre} · ${tamano.detalle}`],
    ["Bizcocho", bizcocho.nombre],
    ["Relleno", relleno.nombre],
    ["Cobertura", cobertura.nombre],
    ...(extras.length ? [["Extras", extras.join(", ")]] : []),
    ...(p.mensaje ? [["Mensaje", `“${p.mensaje}”`]] : []),
    ...(p.fecha && !reglaFecha(p.fecha) ? [["Entrega", fechaLarga(p.fecha)]] : []),
  ];
  $("#resumenLista").innerHTML = filas.map(([k, v]) => `<div><dt>${k}</dt><dd>${v}</dd></div>`).join("");
  const precio = calcularPrecio(p);
  animarNumero($("#resumenPrecio"), precio, soles);
  animarNumero($("#precioBoton"), precio, (n) => `· ${soles(n)}`);
  $("#mensajeContador").textContent = `${p.mensaje.length} / 40`;
}

// ---------- Mensaje final ----------
function mensajePedido(p) {
  const franja = p.franja === "manana" ? "mañana" : "tarde";
  const entrega = p.entrega === "delivery" ? `Delivery a ${p.direccion}, ${p.distrito}` : "Recojo en tienda";
  return [
    `¡Hola ${NEGOCIO.nombre}! Quiero encargar una torta personalizada:`,
    "",
    `• Ocasión: ${p.ocasion}`,
    `• Tamaño: ${porId(TAMANOS, p.tamano).nombre} (${porId(TAMANOS, p.tamano).detalle})`,
    `• Bizcocho: ${porId(BIZCOCHOS, p.bizcocho).nombre}`,
    `• Relleno: ${porId(RELLENOS, p.relleno).nombre}`,
    `• Cobertura: ${porId(COBERTURAS, p.cobertura).nombre}`,
    ...(p.extras.length ? [`• Extras: ${p.extras.map((id) => porId(EXTRAS, id).nombre).join(", ")}`] : []),
    ...(p.mensaje ? [`• Mensaje: "${p.mensaje}"`] : []),
    ...(p.alergias ? [`• Indicaciones: ${p.alergias}`] : []),
    "",
    `Entrega: ${fechaLarga(p.fecha)}, en la ${franja}`,
    entrega,
    "",
    `*Precio estimado: ${soles(calcularPrecio(p))}*`,
    "",
    `A nombre de: ${p.nombre} · ${p.telefono}${p.correo ? ` · ${p.correo}` : ""}`,
  ].join("\n");
}

// ---------- Pintar opciones ----------
function pintarOpciones() {
  $("#opcionesTamano").innerHTML = TAMANOS.map(
    (t, i) => `<label class="opcion-tarjeta opcion-tamano">
      <input class="radio" type="radio" name="tamano" value="${t.id}" ${i === 1 ? "checked" : ""}>
      <span><b>${t.nombre}</b><small>${t.detalle}</small><em>${soles(t.precio)}</em></span>
    </label>`,
  ).join("");

  const opciones = (lista) => lista.map((op) => `<option value="${op.id}">${conPrecio(op)}</option>`).join("");
  $("#bizcocho").innerHTML = opciones(BIZCOCHOS);
  $("#relleno").innerHTML = opciones(RELLENOS);
  $("#cobertura").innerHTML = opciones(COBERTURAS);

  $("#opcionesExtras").innerHTML = EXTRAS.map(
    (e) => `<label class="opcion-extra">
      <input class="check" type="checkbox" name="extras" value="${e.id}">
      <span>${e.nombre}</span><small>+${soles(e.precio)}</small>
    </label>`,
  ).join("");
}

// ---------- Inicio ----------
export function iniciarPedido() {
  const form = $("#formPedido");
  pintarOpciones();

  // Límites del calendario
  form.fecha.min = sumarDias(hoyEnLima(), DIAS_ANTICIPACION);
  form.fecha.max = sumarDias(hoyEnLima(), DIAS_MAXIMO);

  const tocados = new Set();
  let intentoEnviar = false;

  const actualizar = () => {
    aplicarReglas(form);
    $("#camposDelivery").hidden = form.entrega.value !== "delivery";
    CAMPOS.forEach((nombre) => {
      if (intentoEnviar || tocados.has(nombre)) marcar(form[nombre]);
    });
    if (intentoEnviar) mostrarErrores(CAMPOS.map((n) => form[n]).filter((c) => !c.checkValidity()));
    pintarResumen(form);
  };

  // Solo números en el celular
  form.telefono.addEventListener("input", () => {
    form.telefono.value = form.telefono.value.replace(/\D/g, "");
  });

  form.addEventListener("input", actualizar);
  form.addEventListener("change", actualizar);
  form.addEventListener("focusout", (e) => {
    if (CAMPOS.includes(e.target.name)) {
      tocados.add(e.target.name);
      actualizar();
    }
  });

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    intentoEnviar = true;
    actualizar();

    const invalidos = CAMPOS.map((n) => form[n]).filter((c) => !c.checkValidity());
    if (invalidos.length) {
      $("#pedidoErrores").focus();
      return;
    }

    const pedido = leerPedido(form);
    const texto = mensajePedido(pedido);
    $("#confirmacionResumen").textContent = texto;
    $("#confirmacionWhatsApp").href = `https://wa.me/${NEGOCIO.whatsapp}?text=${encodeURIComponent(texto)}`;
    form.hidden = true;
    $("#pedidoConfirmacion").hidden = false;
    $("#pedidoConfirmacion").focus();
    confeti();
  });

  $("#btnEditarPedido").addEventListener("click", () => {
    $("#pedidoConfirmacion").hidden = true;
    form.hidden = false;
    form.querySelector("[name=tamano]:checked").focus();
  });

  $("#btnNuevoPedido").addEventListener("click", () => {
    form.reset();
    tocados.clear();
    intentoEnviar = false;
    CAMPOS.forEach((n) => {
      form[n].classList.remove("is-invalid");
      form[n].removeAttribute("aria-invalid");
    });
    $("#pedidoErrores").hidden = true;
    $("#pedidoConfirmacion").hidden = true;
    form.hidden = false;
    actualizar();
    $("#formPedido").scrollIntoView({ block: "start" });
  });

  actualizar();
}
