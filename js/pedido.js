// =========================================================
// Pedido especial: torta personalizada.
// Precio en vivo, "torta viva" que crece y se decora,
// pasos (Stepper), calendario (Datepicker), regalo (Switch),
// validación con reglas propias y envío por WhatsApp.
// =========================================================
import { Datepicker } from "https://cdn.jsdelivr.net/npm/bootstrap@6.0.0-alpha.1/dist/js/bootstrap.bundle.min.js";
import { NEGOCIO } from "./config.js";
import { soles } from "./catalogo.js";
import { sumar } from "./carrito.js";
import { crearTortaViva } from "./torta-viva.js";
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

const PRECIO_REGALO = 8; // tarjeta con dedicatoria y caja de regalo
const DIAS_ANTICIPACION = 2;
const DIAS_MAXIMO = 60;
const DOMINGO = 0;

const $ = (selector) => document.querySelector(selector);
const porId = (lista, id) => lista.find((op) => op.id === id) ?? lista[0];
const conPrecio = (op) => (op.precio ? `${op.nombre} · +S/ ${op.precio}` : op.nombre);

// ---------- Precio (usa sumar con parámetro rest) ----------
export function calcularPrecio({ tamano, bizcocho, relleno, cobertura, extras = [], regalo = false }) {
  return sumar(
    porId(TAMANOS, tamano).precio,
    porId(BIZCOCHOS, bizcocho).precio,
    porId(RELLENOS, relleno).precio,
    porId(COBERTURAS, cobertura).precio,
    ...extras.map((id) => porId(EXTRAS, id).precio),
    regalo ? PRECIO_REGALO : 0,
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

// Fecha escrita a mano: acepta "25/10/2026" y "2026-10-25". Devuelve "AAAA-MM-DD" o "".
function leerFechaEscrita(texto) {
  const t = texto.trim();
  let m = t.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
  let [a, mes, d] = m ? [m[1], m[2], m[3]] : [];
  if (!m) {
    m = t.match(/^(\d{1,2})[/.-](\d{1,2})[/.-](\d{4})$/);
    if (!m) return "";
    [d, mes, a] = [m[1], m[2], m[3]];
  }
  const iso = `${a}-${mes.padStart(2, "0")}-${d.padStart(2, "0")}`;
  const fecha = new Date(`${iso}T12:00:00Z`);
  return !Number.isNaN(fecha.getTime()) && fecha.toISOString().slice(0, 10) === iso ? iso : "";
}

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
    regalo: datos.get("regalo") === "on",
    dedicatoria: datos.get("dedicatoria").trim(),
    alergias: datos.get("alergias").trim(),
    // La fecha se guarda en formato AAAA-MM-DD en data-iso (el campo muestra el texto largo)
    fecha: form.fecha.dataset.iso ?? "",
    fechaEscrita: datos.get("fecha").trim(),
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
function reglaFecha(fecha, escrita = "") {
  if (!fecha && escrita) return "No reconocemos esa fecha. Elígela en el calendario o escríbela como 25/10/2026.";
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

  form.fecha.setCustomValidity(reglaFecha(p.fecha, p.fechaEscrita));
  form.franja.setCustomValidity(reglaFranja(p.fecha, p.franja));
  form.distrito.required = delivery;
  form.direccion.required = delivery;

  $("#fechaError").textContent = reglaFecha(p.fecha, p.fechaEscrita);
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
let actualizarTorta = null; // se crea en iniciarPedido()

function pintarResumen(form) {
  const p = leerPedido(form);
  const tamano = porId(TAMANOS, p.tamano);
  const bizcocho = porId(BIZCOCHOS, p.bizcocho);
  const relleno = porId(RELLENOS, p.relleno);
  const cobertura = porId(COBERTURAS, p.cobertura);
  const extras = p.extras.map((id) => porId(EXTRAS, id).nombre);

  // La torta viva crece con el tamaño y muestra los extras elegidos
  actualizarTorta({
    tamano: tamano.id,
    colores: { masa: bizcocho.color, relleno: relleno.color, cobertura: cobertura.color },
    extras: p.extras,
    texto: p.mensaje,
    descripcion: `Vista previa: torta ${tamano.nombre.toLowerCase()} de ${bizcocho.nombre} con ${relleno.nombre} y ${cobertura.nombre}${extras.length ? `, con ${extras.join(", ").toLowerCase()}` : ""}`,
  });

  const filas = [
    ["Tamaño", `${tamano.nombre} · ${tamano.detalle}`],
    ["Bizcocho", bizcocho.nombre],
    ["Relleno", relleno.nombre],
    ["Cobertura", cobertura.nombre],
    ...(extras.length ? [["Extras", extras.join(", ")]] : []),
    ...(p.mensaje ? [["Mensaje", `“${p.mensaje}”`]] : []),
    ...(p.regalo ? [["Regalo", "Tarjeta y caja de regalo"]] : []),
    ...(p.fecha && !reglaFecha(p.fecha) ? [["Entrega", fechaLarga(p.fecha)]] : []),
  ];
  $("#resumenLista").innerHTML = filas.map(([k, v]) => `<div><dt>${k}</dt><dd>${v}</dd></div>`).join("");
  const precio = calcularPrecio(p);
  animarNumero($("#resumenPrecio"), precio, soles);
  animarNumero($("#precioBoton"), precio, (n) => `· ${soles(n)}`);
  $("#mensajeContador").textContent = `${p.mensaje.length} / 40`;
  $("#dedicatoriaContador").textContent = `${p.dedicatoria.length} / 140`;
  $("#camposRegalo").hidden = !p.regalo;
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
    ...(p.regalo ? [`• Es un regalo: tarjeta y caja (+${soles(PRECIO_REGALO)})${p.dedicatoria ? `. Dedicatoria: "${p.dedicatoria}"` : ""}`] : []),
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
  actualizarTorta = crearTortaViva($("#resumenMedia"));

  const tocados = new Set();
  let intentoEnviar = false;

  // ---------- Calendario (Datepicker de Bootstrap 6) ----------
  // Solo deja elegir desde pasado mañana hasta 60 días (hora de Lima)
  Datepicker.getOrCreateInstance(form.fecha, {
    dateMin: sumarDias(hoyEnLima(), DIAS_ANTICIPACION),
    dateMax: sumarDias(hoyEnLima(), DIAS_MAXIMO),
    locale: "es-PE",
    firstWeekday: 1,
    dateFormat: { weekday: "long", day: "numeric", month: "long", year: "numeric" },
  });
  form.fecha.addEventListener("change.bs.datepicker", (e) => {
    form.fecha.dataset.iso = e.dates?.[0] ?? "";
    tocados.add("fecha");
    actualizar();
  });
  // Si la escriben a mano, se interpreta el texto
  form.fecha.addEventListener("input", () => {
    form.fecha.dataset.iso = leerFechaEscrita(form.fecha.value);
  });

  // ---------- Pasos (Stepper de Bootstrap 6) ----------
  const pasos = [...form.querySelectorAll("fieldset.paso")];
  const items = [...$("#pasosPedido").children];
  const visitados = new Set([0]);
  let pasoActual = 0;
  const pasoValido = (i) => [...pasos[i].querySelectorAll("input, select, textarea")].every((c) => c.checkValidity());

  function pintarPasos() {
    items.forEach((item, i) => {
      const completo = visitados.has(i) && i !== pasoActual && pasoValido(i);
      item.classList.toggle("completo", completo);
      item.classList.toggle("actual", i === pasoActual);
      item.classList.toggle("active", completo || i === pasoActual); // Bootstrap colorea los "active"
      const enlace = item.querySelector("a");
      if (i === pasoActual) enlace.setAttribute("aria-current", "step");
      else enlace.removeAttribute("aria-current");
      enlace.setAttribute("aria-label", `Paso ${i + 1}: ${enlace.textContent}${completo ? " (completo)" : ""}`);
    });
  }
  const irAPaso = (i) => {
    if (i < 0 || i === pasoActual) return;
    pasoActual = i;
    visitados.add(i);
    pintarPasos();
  };
  // El paso actual es el que tiene el foco o el que está en el centro de la pantalla
  form.addEventListener("focusin", (e) => irAPaso(pasos.indexOf(e.target.closest("fieldset.paso"))));
  if ("IntersectionObserver" in window) {
    const observador = new IntersectionObserver((entradas) => {
      entradas.forEach((en) => en.isIntersecting && irAPaso(pasos.indexOf(en.target)));
    }, { rootMargin: "-45% 0px -45% 0px" });
    pasos.forEach((paso) => observador.observe(paso));
  }

  const actualizar = () => {
    aplicarReglas(form);
    $("#camposDelivery").hidden = form.entrega.value !== "delivery";
    CAMPOS.forEach((nombre) => {
      if (intentoEnviar || tocados.has(nombre)) marcar(form[nombre]);
    });
    if (intentoEnviar) mostrarErrores(CAMPOS.map((n) => form[n]).filter((c) => !c.checkValidity()));
    pintarResumen(form);
    pintarPasos();
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
    items.forEach((item) => item.classList.add("active", "completo"));
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
    form.fecha.dataset.iso = "";
    visitados.clear();
    visitados.add(0);
    pasoActual = 0;
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
