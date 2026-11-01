// =========================================================
// Modo Navidad: solo aparece si el administrador lo activó en el
// panel (lo trae /api/productos). Agrega un aviso con el panetón,
// la cinta navideña (CSS con la clase .navidad) y nieve suave en
// un <canvas>. Cada visitante puede apagar la nieve; con "reducir
// movimiento" no cae nieve, pero sí se ve la decoración.
// =========================================================
import { prefiereQuieto } from "./animaciones.js";

const CLAVE = "kuyay-nieve";
const COPOS = 70;

const leer = () => { try { return localStorage.getItem(CLAVE); } catch { return null; } };
const guardar = (valor) => { try { localStorage.setItem(CLAVE, valor); } catch { /* modo privado: no se recuerda */ } };

function crearNieve() {
  const lienzo = document.createElement("canvas");
  lienzo.className = "nieve";
  lienzo.setAttribute("aria-hidden", "true");
  document.body.append(lienzo);
  const ctx = lienzo.getContext("2d");
  let copos = [];
  let cuadro = null;

  const medir = () => {
    const escala = devicePixelRatio || 1;
    lienzo.width = innerWidth * escala;
    lienzo.height = innerHeight * escala;
    ctx.setTransform(escala, 0, 0, escala, 0, 0);
  };
  const nuevo = (arriba = false) => ({
    x: Math.random() * innerWidth,
    y: arriba ? -10 : Math.random() * innerHeight,
    r: 1.5 + Math.random() * 2.5,
    vy: 0.4 + Math.random() * 0.8,
    fase: Math.random() * Math.PI * 2,
  });
  // En modo claro, copos celestes (los blancos no se ven sobre el fondo crema)
  const color = () => (document.documentElement.dataset.bsTheme === "dark" ? "rgba(255, 255, 255, 0.75)" : "rgba(150, 175, 205, 0.7)");

  const dibujar = () => {
    ctx.clearRect(0, 0, innerWidth, innerHeight);
    ctx.fillStyle = color();
    for (const c of copos) {
      c.y += c.vy;
      c.fase += 0.01;
      c.x += Math.sin(c.fase) * 0.4;
      if (c.y > innerHeight + 10) Object.assign(c, nuevo(true));
      ctx.beginPath();
      ctx.arc(c.x, c.y, c.r, 0, Math.PI * 2);
      ctx.fill();
    }
    cuadro = requestAnimationFrame(dibujar);
  };

  const encender = () => {
    if (cuadro) return;
    medir();
    copos = Array.from({ length: innerWidth < 600 ? COPOS / 2 : COPOS }, () => nuevo());
    lienzo.hidden = false;
    dibujar();
  };
  const apagar = () => {
    cancelAnimationFrame(cuadro);
    cuadro = null;
    lienzo.hidden = true;
  };
  addEventListener("resize", () => cuadro && medir());
  // Pestaña en segundo plano: no gastar batería
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) cancelAnimationFrame(cuadro), (cuadro = null);
    else if (!lienzo.hidden) dibujar();
  });
  return { encender, apagar };
}

export function iniciarNavidad() {
  if (document.querySelector("#islaPanel")) return; // el panel se queda sin decoración
  document.documentElement.classList.add("navidad");

  // Aviso arriba del contenido, con el panetón (en el catálogo abre su detalle)
  const main = document.querySelector("main");
  main?.insertAdjacentHTML("afterbegin", `
    <p class="aviso-navidad">
      <span aria-hidden="true">🎄</span> Llegó la Navidad a Kuyay:
      <a href="catalogo.html?producto=paneton-artesanal">panetón artesanal de masa madre <i class="bi bi-arrow-right" aria-hidden="true"></i></a>
    </p>`);

  if (prefiereQuieto()) return;
  const nieve = crearNieve();
  const boton = document.createElement("button");
  boton.type = "button";
  boton.className = "boton-nieve";
  const pintar = (activa) => {
    boton.innerHTML = `<i class="bi ${activa ? "bi-snow" : "bi-snow2"}" aria-hidden="true"></i> ${activa ? "Quitar nieve" : "Poner nieve"}`;
    boton.setAttribute("aria-pressed", String(activa));
    activa ? nieve.encender() : nieve.apagar();
  };
  boton.addEventListener("click", () => {
    const activa = boton.getAttribute("aria-pressed") !== "true";
    guardar(activa ? "si" : "no");
    pintar(activa);
  });
  document.body.append(boton);
  pintar(leer() !== "no");
}
