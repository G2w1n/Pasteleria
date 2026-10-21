// =========================================================
// Animaciones y transiciones.
// Todo respeta el ajuste "reducir movimiento" del sistema:
// si está activo, los cambios ocurren al instante.
// =========================================================

export const prefiereQuieto = () => matchMedia("(prefers-reduced-motion: reduce)").matches;

// ---------- Transición de vista (View Transitions API) ----------
// Envuelve un cambio del DOM para que el navegador lo anime:
// por ejemplo, las tarjetas se deslizan a su nuevo lugar al filtrar.
export function transicion(cambiar) {
  if (!document.startViewTransition || prefiereQuieto()) return cambiar();
  return document.startViewTransition(cambiar);
}

// Igual que transicion(), pero con un "tipo" para que el CSS sepa qué animar
// (por ejemplo "tema" o "detalle"). Si el navegador no entiende los tipos,
// el cambio se hace sin animación.
export function transicionConTipo(tipo, cambiar) {
  if (!document.startViewTransition || prefiereQuieto()) {
    cambiar();
    return null;
  }
  try {
    return document.startViewTransition({ update: cambiar, types: [tipo] });
  } catch {
    cambiar();
    return null;
  }
}

// ---------- Confeti con los colores de la marca ----------
const COLORES_CONFETI = ["#8e2c4e", "#e0a03a", "#f2a516", "#e58aa9", "#5a8f5e", "#fbf6ef"];

export function confeti({ x = innerWidth / 2, y = innerHeight / 3, cantidad = 70 } = {}) {
  if (prefiereQuieto()) return;
  const capa = document.createElement("div");
  capa.className = "confeti";
  capa.setAttribute("aria-hidden", "true");
  document.body.append(capa);

  const vuelos = Array.from({ length: cantidad }, (_, i) => {
    const pieza = document.createElement("i");
    pieza.style.background = COLORES_CONFETI[i % COLORES_CONFETI.length];
    pieza.style.left = `${x}px`;
    pieza.style.top = `${y}px`;
    if (i % 3 === 0) pieza.style.borderRadius = "50%";
    capa.append(pieza);

    // Cada pieza sale en una dirección al azar, sube y luego cae girando
    const angulo = Math.random() * Math.PI * 2;
    const fuerza = 120 + Math.random() * 220;
    const dx = Math.cos(angulo) * fuerza;
    const dy = Math.sin(angulo) * fuerza - 160;
    const giro = (Math.random() - 0.5) * 900;
    return pieza.animate(
      [
        { transform: "translate(0, 0) rotate(0deg)", opacity: 1 },
        { transform: `translate(${dx}px, ${dy}px) rotate(${giro / 2}deg)`, opacity: 1, offset: 0.45 },
        { transform: `translate(${dx * 1.2}px, ${dy + 420}px) rotate(${giro}deg)`, opacity: 0 },
      ],
      { duration: 1400 + Math.random() * 900, easing: "cubic-bezier(.2, .6, .4, 1)" },
    ).finished;
  });
  Promise.all(vuelos).then(() => capa.remove());
}

// ---------- Tarjetas con efecto 3D al mover el mouse ----------
// Solo en computadoras (puntero fino con hover). Las variables CSS --rx y --ry
// inclinan la tarjeta; --brillo-x y --brillo-y mueven el reflejo de luz.
function tarjetas3D() {
  if (prefiereQuieto() || !matchMedia("(hover: hover) and (pointer: fine)").matches) return;
  const SELECTOR = ".producto, .categoria-tarjeta";
  const MAX = 6; // grados

  document.addEventListener("pointermove", (e) => {
    const tarjeta = e.target.closest(SELECTOR);
    if (!tarjeta) return;
    const r = tarjeta.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width; // 0 a 1
    const py = (e.clientY - r.top) / r.height;
    tarjeta.classList.add("en-3d");
    tarjeta.style.setProperty("--ry", `${(px - 0.5) * 2 * MAX}deg`);
    tarjeta.style.setProperty("--rx", `${(0.5 - py) * 2 * MAX}deg`);
    tarjeta.style.setProperty("--brillo-x", `${px * 100}%`);
    tarjeta.style.setProperty("--brillo-y", `${py * 100}%`);
  });

  document.addEventListener("pointerout", (e) => {
    const tarjeta = e.target.closest(SELECTOR);
    if (tarjeta && !tarjeta.contains(e.relatedTarget)) {
      tarjeta.classList.remove("en-3d");
      tarjeta.style.removeProperty("--rx");
      tarjeta.style.removeProperty("--ry");
    }
  });
}

// ---------- Números que "cuentan" hasta su nuevo valor ----------
// formato: función que convierte el número en texto (por ejemplo, soles)
export function animarNumero(elemento, valor, formato = String, duracion = 450) {
  const inicio = Number(elemento.dataset.valor ?? 0);
  elemento.dataset.valor = valor;
  if (prefiereQuieto() || inicio === valor) {
    elemento.textContent = formato(valor);
    return;
  }
  const t0 = performance.now();
  const suavizado = (t) => 1 - (1 - t) ** 3; // rápido al inicio, lento al final
  const paso = (ahora) => {
    const t = Math.min((ahora - t0) / duracion, 1);
    elemento.textContent = formato(inicio + (valor - inicio) * suavizado(t));
    if (t < 1 && Number(elemento.dataset.valor) === valor) requestAnimationFrame(paso);
  };
  requestAnimationFrame(paso);
}

// ---------- "Vuela al carrito" ----------
// Copia el dibujo del producto y lo lleva en curva hasta el ícono del carrito.
export function volarAlCarrito(origen, destino) {
  if (!origen || !destino || prefiereQuieto()) return Promise.resolve();
  const desde = origen.getBoundingClientRect();
  const hasta = destino.getBoundingClientRect();
  if (!desde.width) return Promise.resolve();

  const copia = origen.cloneNode(true);
  copia.removeAttribute("id");
  copia.setAttribute("aria-hidden", "true");
  copia.classList.add("volando");
  Object.assign(copia.style, {
    left: `${desde.left}px`,
    top: `${desde.top}px`,
    width: `${desde.width}px`,
    height: `${desde.height}px`,
  });
  document.body.append(copia);

  const dx = hasta.left + hasta.width / 2 - (desde.left + desde.width / 2);
  const dy = hasta.top + hasta.height / 2 - (desde.top + desde.height / 2);
  const escala = 28 / desde.width;

  const vuelo = copia.animate(
    [
      { transform: "translate(0, 0) scale(1)", opacity: 1 },
      { transform: `translate(${dx * 0.55}px, ${dy * 0.25 - 80}px) scale(${Math.max(escala * 3, 0.35)}) rotate(-8deg)`, opacity: 1, offset: 0.55 },
      { transform: `translate(${dx}px, ${dy}px) scale(${escala}) rotate(0deg)`, opacity: 0.4 },
    ],
    { duration: 750, easing: "cubic-bezier(.5, 0, .3, 1)" },
  );
  return vuelo.finished.then(() => copia.remove());
}

// ---------- Elementos que aparecen al hacer scroll ----------
function revelarAlScroll() {
  const elementos = document.querySelectorAll(".revelar");
  if (prefiereQuieto() || !("IntersectionObserver" in window)) return;

  // Solo se ocultan si JavaScript funciona: sin JS, todo se ve normal
  document.documentElement.classList.add("con-animaciones");

  const observador = new IntersectionObserver(
    (entradas) => {
      entradas.forEach((entrada) => {
        if (!entrada.isIntersecting) return;
        entrada.target.classList.add("visible");
        observador.unobserve(entrada.target); // se anima una sola vez
      });
    },
    { rootMargin: "0px 0px -10% 0px" },
  );

  // Retraso escalonado entre hermanos (tarjetas en fila)
  elementos.forEach((el) => {
    const hermanos = [...el.parentElement.children].filter((h) => h.classList.contains("revelar"));
    el.style.setProperty("--retraso", `${hermanos.indexOf(el) * 90}ms`);
    observador.observe(el);
  });
}

// ---------- Cifras que suben al aparecer (página Nosotros) ----------
function contadores() {
  const cifras = document.querySelectorAll("[data-contar]");
  const formatear = (el) => (n) => {
    const decimales = Number(el.dataset.decimales ?? 0);
    return n.toLocaleString("es-PE", { minimumFractionDigits: decimales, maximumFractionDigits: decimales }) + (el.dataset.sufijo ?? "");
  };
  const contar = (el) => animarNumero(el, Number(el.dataset.contar), formatear(el), 1600);

  if (!("IntersectionObserver" in window)) return cifras.forEach(contar);
  const observador = new IntersectionObserver((entradas) => {
    entradas.forEach((e) => {
      if (!e.isIntersecting) return;
      contar(e.target);
      observador.unobserve(e.target);
    });
  }, { threshold: 0.6 });
  cifras.forEach((el) => observador.observe(el));
}

// ---------- Menú que se compacta al bajar ----------
function cabeceraAlScroll() {
  const cabecera = document.querySelector(".cabecera");
  let pendiente = false;
  const actualizar = () => {
    cabecera.classList.toggle("con-scroll", window.scrollY > 12);
    pendiente = false;
  };
  window.addEventListener("scroll", () => {
    if (!pendiente) requestAnimationFrame(actualizar);
    pendiente = true;
  }, { passive: true });
  actualizar();
}

export function iniciarAnimaciones() {
  revelarAlScroll();
  contadores();
  cabeceraAlScroll();
  tarjetas3D();
}
