// =========================================================
// Kuyay · Pastelería de autor
// Lógica de la tienda. Es un módulo ES (type="module"):
// sus variables NO son globales.
// En las fases 3 y 4 aquí van el catálogo y el carrito.
// =========================================================
import { Drawer } from "https://cdn.jsdelivr.net/npm/bootstrap@6.0.0-alpha.1/dist/js/bootstrap.bundle.min.js";
import { NEGOCIO } from "./config.js";
import { iniciarTema } from "./tema.js";

iniciarTema(document.querySelector("#btnTema"));

// ---------- Drawers: cerrar al elegir una sección ----------
// Un enlace interno (#catalogo, #pedido...) dentro del menú o del carrito
// cierra el panel y deja que el navegador baje a esa sección.
// (No usamos data-bs-dismiss en enlaces: Bootstrap cancela la navegación.)
document.querySelectorAll(".drawer").forEach((drawer) => {
  drawer.querySelectorAll('a[href^="#"]').forEach((enlace) => {
    enlace.addEventListener("click", () => Drawer.getInstance(drawer)?.hide());
  });
});

// ---------- Horario: "Abierto ahora" / "Cerrado" ----------
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

const estado = document.querySelector("#estadoTienda");
if (estado) {
  const abierto = estaAbierto();
  estado.textContent = abierto ? "Abierto ahora" : "Cerrado ahora";
  estado.classList.add(abierto ? "theme-success" : "theme-secondary");
}

// Resaltar la fila de hoy en la tabla de horario
const hoy = horaEnLima().dia;
document.querySelector(`[data-dia~="${hoy}"]`)?.classList.add("hoy");

// ---------- Pie de página ----------
document.querySelector("#anio").textContent = new Date().getFullYear();
