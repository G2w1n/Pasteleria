// =========================================================
// Carrito de compras.
// Parte 1: lógica pura (no toca el HTML). Usa los conceptos
//          de la semana 10: rest, parámetros por defecto,
//          recursividad y closure.
// Parte 2: interfaz (drawer, contador, Toast y WhatsApp).
// =========================================================
import { Dialog, Drawer, Toast } from "https://cdn.jsdelivr.net/npm/bootstrap@6.0.0-alpha.1/dist/js/bootstrap.bundle.min.js";
import { productos } from "./productos.js";
import { dibujarProducto } from "./ilustraciones.js";
import { soles } from "./catalogo.js";
import { NEGOCIO } from "./config.js";
import { animarNumero, volarAlCarrito, confeti, sacudirCarrito, prefiereQuieto } from "./animaciones.js";
import { api, apiDisponible, costoDeliveryDe, distritosConDelivery, obtenerSesion } from "./api.js";

// ================= PARTE 1: LÓGICA =================

export const MINIMO_DESCUENTO = 100; // S/ desde el que se aplica el descuento
export const PORCENTAJE_DESCUENTO = 10;

// Parámetro REST: recibe cualquier cantidad de números
export const sumar = (...numeros) => numeros.reduce((acumulado, n) => acumulado + n, 0);

// Parámetro por defecto: si no se indica, descuenta 10 %
export const aplicarDescuento = (total, porcentaje = PORCENTAJE_DESCUENTO) => total - (total * porcentaje) / 100;

// Recursividad: caso base (lista vacía) + llamada a sí misma con el resto
export function contarUnidades(lista) {
  if (lista.length === 0) return 0;
  const [primero, ...resto] = lista;
  return primero.cantidad + contarUnidades(resto);
}

// Closure: "items" es privado. Solo se puede cambiar con los métodos que devuelve.
// alCambiar se llama cada vez que el carrito cambia (para guardar y repintar).
export function crearCarrito(itemsIniciales = [], alCambiar = () => {}) {
  let items = itemsIniciales;

  const buscar = (id) => items.find((it) => it.producto.id === id);
  const avisar = () => alCambiar(items);

  return {
    // Devuelve cuántas unidades se agregaron realmente (el stock pone el límite)
    agregar(producto, cantidad = 1) {
      const existente = buscar(producto.id);
      const actual = existente?.cantidad ?? 0;
      const nueva = Math.min(actual + cantidad, producto.stock);
      const agregadas = nueva - actual;
      if (agregadas <= 0) return 0;

      if (existente) existente.cantidad = nueva;
      else items = [...items, { producto, cantidad: nueva }];
      avisar();
      return agregadas;
    },

    cambiarCantidad(id, delta) {
      const item = buscar(id);
      if (!item) return;
      const nueva = Math.min(item.cantidad + delta, item.producto.stock);
      if (nueva <= 0) return this.quitar(id);
      item.cantidad = nueva;
      avisar();
    },

    quitar(id) {
      items = items.filter((it) => it.producto.id !== id);
      avisar();
    },

    vaciar() {
      items = [];
      avisar();
    },

    // Copia, para que nadie modifique "items" desde afuera
    lista: () => items.map((it) => ({ ...it })),
    unidades: () => contarUnidades(items),
    subtotal: () => sumar(...items.map((it) => it.producto.precio * it.cantidad)),

    totales() {
      const subtotal = this.subtotal();
      const conDescuento = subtotal > MINIMO_DESCUENTO;
      // Redondeo a céntimos: 184 * 0.9 da 165.60000000000002 en JavaScript
      const total = Math.round((conDescuento ? aplicarDescuento(subtotal) : subtotal) * 100) / 100;
      return { subtotal, descuento: Math.round((subtotal - total) * 100) / 100, total, conDescuento, faltan: Math.max(MINIMO_DESCUENTO - subtotal, 0) };
    },
  };
}

// ---------- Guardado en localStorage ----------
// Solo se guarda { id, cantidad }: el precio y el nombre se leen del catálogo
// al cargar, así un cambio de precio se refleja aunque el carrito sea antiguo.
const CLAVE = "kuyay-carrito";

function cargarGuardado() {
  try {
    const guardado = JSON.parse(localStorage.getItem(CLAVE)) ?? [];
    return guardado
      .map(({ id, cantidad }) => ({ producto: productos.find((p) => p.id === id), cantidad }))
      .filter((it) => it.producto && it.producto.stock > 0)
      .map((it) => ({ ...it, cantidad: Math.min(it.cantidad, it.producto.stock) }));
  } catch {
    return []; // dato corrupto o almacenamiento bloqueado: empezamos vacío
  }
}

function guardar(items) {
  try {
    localStorage.setItem(CLAVE, JSON.stringify(items.map((it) => ({ id: it.producto.id, cantidad: it.cantidad }))));
  } catch {
    // Modo privado: el carrito funciona, pero no se recuerda al recargar
  }
}

// ================= PARTE 2: INTERFAZ =================

const $ = (selector) => document.querySelector(selector);

// Mensaje de WhatsApp con el detalle del pedido
export function mensajeWhatsApp(lista, { subtotal, descuento, total, conDescuento }) {
  const lineas = lista.map((it) => `• ${it.cantidad} × ${it.producto.nombre} — ${soles(it.producto.precio * it.cantidad)}`);
  return [
    `¡Hola ${NEGOCIO.nombre}! Quisiera hacer este pedido:`,
    "",
    ...lineas,
    "",
    `Subtotal: ${soles(subtotal)}`,
    ...(conDescuento ? [`Descuento ${PORCENTAJE_DESCUENTO} %: −${soles(descuento)}`] : []),
    `*Total: ${soles(total)}*`,
    "",
    "Mi nombre es: ",
    "Dirección de entrega: ",
  ].join("\n");
}

const filaCarrito = ({ producto: p, cantidad }, nuevo = false) => `
  <li class="list-group-item item-carrito ${nuevo ? "entrando" : ""}">
    <div class="item-media" style="--tono: ${p.ilustracion.fondo}">${p.foto ? `<img src="${p.foto}" alt="">` : dibujarProducto(p.ilustracion)}</div>
    <div class="item-info">
      <p class="item-nombre">${p.nombre}</p>
      <p class="item-precio">${soles(p.precio)} c/u</p>
      <div class="cantidad cantidad-sm" role="group" aria-label="Cantidad de ${p.nombre}">
        <button class="btn btn-subtle theme-secondary btn-icon btn-sm" type="button" data-restar="${p.id}"
                aria-label="${cantidad === 1 ? "Quitar" : "Restar uno de"} ${p.nombre}">
          <i class="bi ${cantidad === 1 ? "bi-trash3" : "bi-dash"}" aria-hidden="true"></i>
        </button>
        <span class="cantidad-valor" aria-live="polite">${cantidad}</span>
        <button class="btn btn-subtle theme-secondary btn-icon btn-sm" type="button" data-sumar="${p.id}"
                aria-label="Sumar uno de ${p.nombre}" ${cantidad >= p.stock ? "disabled" : ""}>
          <i class="bi bi-plus" aria-hidden="true"></i>
        </button>
      </div>
      ${cantidad >= p.stock ? `<p class="item-limite">Máximo disponible hoy</p>` : ""}
    </div>
    <div class="item-total">
      <span>${soles(p.precio * cantidad)}</span>
      <button class="btn btn-text btn-sm item-quitar" type="button" data-quitar="${p.id}">Quitar</button>
    </div>
  </li>`;

let idsPintados = null; // para animar solo las filas nuevas
let teniaDescuento = null; // para celebrar solo cuando se alcanza

function pintarCarrito(carrito) {
  const lista = carrito.lista();
  // Aviso para el catálogo de React ("Agregar (2)", "Sin stock")
  document.dispatchEvent(new CustomEvent("kuyay:carrito", { detail: lista.map((it) => ({ id: it.producto.id, cantidad: it.cantidad })) }));
  const unidades = carrito.unidades();
  const t = carrito.totales();
  const vacio = lista.length === 0;

  // Contador del menú
  const contador = $("#contadorCarrito");
  contador.textContent = unidades;
  contador.dataset.cantidad = unidades;
  $("#btnCarrito").setAttribute("aria-label", `Abrir carrito (${unidades} ${unidades === 1 ? "producto" : "productos"})`);
  $("#carritoCantidad").textContent = vacio ? "" : `(${unidades})`;

  $("#carritoVacio").hidden = !vacio;
  const anteriores = idsPintados ?? new Set(lista.map((it) => it.producto.id));
  $("#carritoLista").innerHTML = lista.map((it) => filaCarrito(it, !anteriores.has(it.producto.id))).join("");
  idsPintados = new Set(lista.map((it) => it.producto.id));
  $("#carritoPie").hidden = vacio;
  if (vacio) {
    teniaDescuento = false;
    return;
  }

  // ¡Confeti la primera vez que el subtotal supera S/ 100!
  if (teniaDescuento === false && t.conDescuento) {
    // Con el carrito abierto, sale desde la barra del descuento; si no, desde el centro
    const meta = $("#metaDescuento").getBoundingClientRect();
    confeti($("#carrito").open ? { x: meta.left + meta.width / 2, y: meta.top } : {});
  }
  teniaDescuento = t.conDescuento;

  // Barra de progreso hacia el descuento
  const avance = Math.min((t.subtotal / MINIMO_DESCUENTO) * 100, 100);
  $("#metaBarra").style.width = `${avance}%`;
  $("#metaTexto").innerHTML = t.conDescuento
    ? `<i class="bi bi-gift" aria-hidden="true"></i> ¡Tienes <strong>${PORCENTAJE_DESCUENTO} % de descuento</strong>!`
    : t.faltan === 0
      ? `Agrega un producto más y obtén <strong>${PORCENTAJE_DESCUENTO} % de descuento</strong>`
      : `Te faltan <strong>${soles(t.faltan)}</strong> para superar ${soles(MINIMO_DESCUENTO)} y obtener ${PORCENTAJE_DESCUENTO} % de descuento`;
  $("#metaDescuento").classList.toggle("lograda", t.conDescuento);

  $("#carritoSubtotal").textContent = soles(t.subtotal);
  $("#filaDescuento").hidden = !t.conDescuento;
  $("#carritoDescuento").textContent = `−${soles(t.descuento)}`;
  animarNumero($("#carritoTotal"), t.total, soles);

  $("#btnWhatsApp").href = `https://wa.me/${NEGOCIO.whatsapp}?text=${encodeURIComponent(mensajeWhatsApp(lista, t))}`;
}

// Aviso flotante (Toast de Bootstrap 6) al agregar un producto
function avisar(texto, { tema = "theme-success", icono = "bi-check-circle-fill", conBoton = true } = {}) {
  const toast = document.createElement("div");
  toast.className = `toast ${tema}`;
  toast.setAttribute("role", "status");
  toast.setAttribute("aria-live", "polite");
  toast.innerHTML = `
    <div class="toast-body aviso">
      <i class="bi ${icono}" aria-hidden="true"></i>
      <span>${texto}</span>
      ${conBoton ? `<button class="btn btn-text btn-sm" type="button" data-ver-carrito>Ver carrito</button>` : ""}
      <button class="btn-close" type="button" data-bs-dismiss="toast" aria-label="Cerrar aviso"></button>
    </div>`;
  $("#avisos").append(toast);
  toast.addEventListener("hidden.bs.toast", () => toast.remove());
  Toast.getOrCreateInstance(toast, { delay: 3500 }).show();
}

const abrirCarrito = () => Drawer.getOrCreateInstance($("#carrito")).show();

// ---------- Inicio ----------
export function iniciarCarrito() {
  const carrito = crearCarrito(cargarGuardado(), (items) => {
    guardar(items);
    pintarCarrito(carrito);
  });
  pintarCarrito(carrito);

  // El catálogo pide agregar (evento emitido por catalogo.js)
  document.addEventListener("kuyay:agregar", async ({ detail: { producto, cantidad, origen } }) => {
    const agregadas = carrito.agregar(producto, cantidad);
    if (agregadas > 0) {
      await volarAlCarrito(origen, $("#btnCarrito"));
      sacudirCarrito();
    }
    if (agregadas === 0) {
      avisar(`Ya tienes todas las unidades disponibles de ${producto.nombre}.`, { tema: "theme-warning", icono: "bi-exclamation-circle-fill" });
    } else if (agregadas < cantidad) {
      avisar(`Solo quedaban ${agregadas} de ${producto.nombre}. Las agregamos a tu carrito.`, { tema: "theme-warning", icono: "bi-exclamation-circle-fill" });
    } else {
      avisar(`Agregaste ${cantidad > 1 ? `${cantidad} × ` : ""}<strong>${producto.nombre}</strong>`);
    }
    const contador = $("#contadorCarrito");
    contador.classList.remove("rebote");
    void contador.offsetWidth; // reinicia la animación
    contador.classList.add("rebote");
  });

  // Botones dentro del carrito (delegación de eventos)
  $("#carritoLista").addEventListener("click", (e) => {
    const boton = e.target.closest("button");
    if (!boton) return;
    const { sumar: mas, restar: menos, quitar } = boton.dataset;
    if (mas) carrito.cambiarCantidad(mas, 1);
    if (menos) carrito.cambiarCantidad(menos, -1);
    if (quitar) carrito.quitar(quitar);
  });

  // Al vaciar, las filas salen deslizándose una por una antes de borrarse
  $("#btnVaciar").addEventListener("click", async () => {
    if (!confirm("¿Vaciar el carrito?")) return;
    if (!prefiereQuieto()) {
      const filas = [...$("#carritoLista").children];
      await Promise.all(
        filas.map((fila, i) =>
          fila.animate([{ opacity: 1, transform: "none" }, { opacity: 0, transform: "translateX(60px)" }], {
            duration: 280,
            delay: i * 70,
            easing: "ease-in",
            fill: "forwards",
          }).finished,
        ),
      );
    }
    carrito.vaciar();
  });

  $("#avisos").addEventListener("click", (e) => {
    if (e.target.closest("[data-ver-carrito]")) abrirCarrito();
  });

  if (apiDisponible()) iniciarCheckout(carrito);
  return carrito;
}

// ================= PARTE 3: CONFIRMAR PEDIDO (API + Neon) =================
// Solo se activa si la API responde. El pedido se guarda en la base de datos,
// que descuenta el stock y lo muestra en "Mis pedidos" y en los reportes.

function iniciarCheckout(carrito) {
  const dialogo = $("#checkout");
  const form = $("#formCheckout");
  const listo = $("#checkoutListo");
  const error = $("#checkoutError");
  let enviando = false;

  form.distrito.innerHTML =
    `<option value="">Elige tu distrito</option>` +
    distritosConDelivery().map((d) => `<option value="${d}">${d} · ${soles(costoDeliveryDe(d))}</option>`).join("");

  const esDelivery = () => form.tipo_entrega.value === "delivery";
  let cupon = null; // { codigo, porcentaje } si se aplicó uno válido

  // El cupón no se suma al 10 % automático: se usa el que descuente más
  function totalesConCupon() {
    const t = carrito.totales();
    const conCupon = cupon ? Math.round(t.subtotal * cupon.porcentaje) / 100 : 0;
    if (conCupon <= t.descuento) return { ...t, usaCupon: false };
    return { ...t, descuento: conCupon, total: Math.round((t.subtotal - conCupon) * 100) / 100, conDescuento: true, usaCupon: true };
  }

  async function aplicarCupon() {
    const codigo = form.cupon_texto.value.trim();
    const estado = $("#ckCuponEstado");
    if (!codigo) {
      cupon = null;
      estado.textContent = "";
      return pintarTotales();
    }
    $("#ckAplicarCupon").disabled = true;
    try {
      ({ cupon } = await api(`cupones?codigo=${encodeURIComponent(codigo)}`));
      const t = totalesConCupon();
      estado.className = "form-text mb-0 fg-success";
      estado.textContent = t.usaCupon
        ? `✓ Cupón ${cupon.codigo}: ${cupon.porcentaje} % de descuento.`
        : `✓ Cupón válido, pero tu descuento automático ya es igual o mayor.`;
    } catch (error) {
      cupon = null;
      estado.className = "form-text mb-0 fg-danger";
      estado.textContent = error.message;
    } finally {
      $("#ckAplicarCupon").disabled = false;
      pintarTotales();
    }
  }

  function pintarTotales() {
    const t = totalesConCupon();
    const costo = esDelivery() ? (costoDeliveryDe(form.distrito.value) ?? 0) : 0;
    $("#ckDelivery").hidden = !esDelivery();
    form.distrito.required = form.direccion.required = esDelivery();
    $("#ckCostoDelivery").textContent = form.distrito.value ? `${form.distrito.value} · ${soles(costo)}` : "Elige tu distrito";
    $("#ckSubtotal").textContent = soles(t.subtotal);
    $("#ckFilaDescuento").hidden = !t.conDescuento;
    $("#ckDescuentoTexto").textContent = t.usaCupon ? `Cupón ${cupon.codigo} (${cupon.porcentaje} %)` : `Descuento ${PORCENTAJE_DESCUENTO} %`;
    $("#ckDescuento").textContent = `−${soles(t.descuento)}`;
    $("#ckDeliveryMonto").textContent = soles(costo);
    animarNumero($("#ckTotal"), Math.round((t.total + costo) * 100) / 100, soles);
  }

  // ---------- Día y franja de entrega (los da la API: cupo, domingos y hora de Lima) ----------
  let horarios = [];
  const MOTIVO = { cerrado: "Cerrado", paso: "Ya cerró", lleno: "Lleno" };
  const NOMBRE_FRANJA = { manana: "Mañana", tarde: "Tarde" };
  const hoyLima = () => new Intl.DateTimeFormat("en-CA", { timeZone: NEGOCIO.zonaHoraria }).format(new Date());
  const formatoDia = (iso, opciones) => new Intl.DateTimeFormat("es-PE", { ...opciones, timeZone: "UTC" }).format(new Date(`${iso}T12:00:00Z`));
  const manana = (iso) => new Date(Date.parse(`${iso}T12:00:00Z`) + 864e5).toISOString().slice(0, 10);
  const nombreDia = (iso) => (iso === hoyLima() ? "Hoy" : iso === manana(hoyLima()) ? "Mañana" : formatoDia(iso, { weekday: "short" }).replace(".", ""));
  const fechaLarga = (iso) => formatoDia(iso, { weekday: "long", day: "numeric", month: "long" });
  const textoEntrega = (fecha, franja) => `${fechaLarga(fecha)}, en la ${franja === "manana" ? "mañana" : "tarde"}`;

  function pintarFranjas() {
    const dia = horarios.find((d) => d.fecha === form.fecha_entrega?.value);
    const antes = form.franja?.value;
    $("#ckFranjas").innerHTML = dia
      ? dia.franjas.map((f) => `
          <label class="opcion-tarjeta franja-entrega"><input type="radio" name="franja" value="${f.franja}" required
                 ${f.disponible ? "" : "disabled"} ${f.disponible && f.franja === antes ? "checked" : ""}>
            <span><b><i class="bi ${f.franja === "manana" ? "bi-sunrise" : "bi-sun"}" aria-hidden="true"></i> ${NOMBRE_FRANJA[f.franja]}</b>
              <small>${f.horas}</small>${f.disponible ? "" : `<small class="franja-estado">${MOTIVO[f.motivo]}</small>`}</span></label>`).join("")
      : "";
    // Si solo queda una franja libre, se elige sola
    const libres = dia?.franjas.filter((f) => f.disponible) ?? [];
    if (libres.length === 1 && !form.franja?.value) form.querySelector(`[name=franja][value=${libres[0].franja}]`).checked = true;
  }

  async function cargarHorarios() {
    const antes = form.fecha_entrega?.value;
    try {
      ({ horarios } = await api("pedidos?horarios=1"));
    } catch {
      $("#ckDias").innerHTML = `<p class="fg-danger fs-sm mb-0">No pudimos cargar los horarios. Cierra y vuelve a intentarlo.</p>`;
      return;
    }
    const libre = (d) => d.franjas.some((f) => f.disponible);
    const elegido = horarios.find((d) => d.fecha === antes && libre(d)) ?? horarios.find(libre);
    $("#ckDias").innerHTML = horarios.map((d) => `
      <label class="dia-entrega"><input type="radio" name="fecha_entrega" value="${d.fecha}" required
             aria-label="${fechaLarga(d.fecha)}${libre(d) ? "" : " (sin horarios)"}"
             ${libre(d) ? "" : "disabled"} ${d === elegido ? "checked" : ""}>
        <small>${nombreDia(d.fecha)}</small><b>${formatoDia(d.fecha, { day: "numeric" })}</b><small>${formatoDia(d.fecha, { month: "short" }).replace(".", "")}</small></label>`).join("");
    pintarFranjas();
  }
  form.addEventListener("change", (e) => e.target.name === "fecha_entrega" && pintarFranjas());

  const mostrarError = (texto) => {
    error.textContent = texto;
    error.hidden = !texto;
    if (texto) error.scrollIntoView({ block: "nearest" });
  };

  const cargando = (si) => {
    enviando = si;
    $("#ckEnviar").disabled = si;
    $("#ckEnviar .spinner-border").hidden = !si;
    $("#ckEnviar .ck-texto").textContent = si ? "Guardando tu pedido…" : "Confirmar pedido";
  };

  // Abrir: primero se cierra el carrito y luego se muestra el diálogo
  $("#btnCheckout").addEventListener("click", async () => {
    if (carrito.unidades() === 0) return;
    Drawer.getInstance($("#carrito"))?.hide();
    form.hidden = false;
    listo.hidden = true;
    mostrarError("");
    const usuario = await obtenerSesion();
    if (usuario) {
      form.nombre.value ||= usuario.nombre;
      form.telefono.value ||= usuario.telefono ?? "";
    }
    pintarTotales();
    cargarHorarios();
    Dialog.getOrCreateInstance(dialogo).show();
  });

  form.telefono.addEventListener("input", () => {
    form.telefono.value = form.telefono.value.replace(/\D/g, "");
  });
  form.addEventListener("change", (e) => e.target !== form.cupon_texto && pintarTotales());
  $("#ckAplicarCupon").addEventListener("click", aplicarCupon);
  // Enter dentro del cupón lo aplica (no envía el pedido)
  form.cupon_texto.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      aplicarCupon();
    }
  });

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (enviando) return;
    const invalido = [...form.elements].find((c) => c.willValidate && !c.checkValidity());
    form.querySelectorAll(".is-invalid").forEach((c) => c.classList.remove("is-invalid"));
    if (invalido) {
      invalido.classList.add("is-invalid");
      mostrarError(
        invalido === form.nombre ? "Escribe tu nombre (mínimo 3 letras)."
        : invalido === form.telefono ? "El celular debe tener 9 dígitos y empezar con 9."
        : invalido === form.distrito ? "Elige el distrito de entrega."
        : invalido.name === "fecha_entrega" ? "Elige el día de entrega."
        : invalido.name === "franja" ? "Elige la franja de entrega: mañana o tarde."
        : "Escribe la dirección de entrega.",
      );
      invalido.focus();
      return;
    }

    const lista = carrito.lista();
    const { cupon_texto, ...datos } = Object.fromEntries(new FormData(form));
    if (totalesConCupon().usaCupon) datos.cupon = cupon.codigo;
    mostrarError("");
    cargando(true);
    try {
      const { pedido } = await api("pedidos", {
        metodo: "POST",
        datos: { ...datos, items: lista.map((it) => ({ id: it.producto.id, cantidad: it.cantidad })) },
        espera: 15000,
      });
      const usuario = await obtenerSesion();
      $("#ckCodigo").textContent = pedido.codigo;
      $("#ckResumenListo").textContent = `${datos.tipo_entrega === "delivery" ? `Delivery a ${datos.distrito}` : "Recojo en tienda"} el ${textoEntrega(pedido.fecha_entrega, pedido.franja)} · total ${soles(pedido.total)} · pago con ${datos.metodo_pago}. Guarda tu código para seguir el pedido.`;
      $("#ckVerPedidos").hidden = !usuario;
      $("#ckSeguir").hidden = Boolean(usuario);
      $("#ckSeguir").href = `cuenta.html?seguir=${pedido.codigo}#seguimiento`;
      const texto = `¡Hola ${NEGOCIO.nombre}! Acabo de hacer el pedido *${pedido.codigo}* en la web por ${soles(pedido.total)}, para el ${textoEntrega(pedido.fecha_entrega, pedido.franja)}. A nombre de ${datos.nombre}.`;
      $("#ckWhatsApp").href = `https://wa.me/${NEGOCIO.whatsapp}?text=${encodeURIComponent(texto)}`;
      form.hidden = true;
      listo.hidden = false;
      listo.focus();
      carrito.vaciar();
      confeti();
    } catch (err) {
      mostrarError(err.message);
      if (err.estado === 409) cargarHorarios(); // la franja se llenó: se muestran los horarios al día
    } finally {
      cargando(false);
    }
  });
}
