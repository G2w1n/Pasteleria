// =========================================================
// Modo claro / oscuro.
// El tema inicial lo aplica un script corto en el <head>
// (para que la página no "parpadee" al cargar). Este módulo
// solo maneja el botón.
// =========================================================

import { transicionConTipo } from "./animaciones.js";

const CLAVE = "kuyay-tema";

const temaActual = () => document.documentElement.dataset.bsTheme ?? "light";

const guardar = (tema) => {
  try {
    localStorage.setItem(CLAVE, tema);
  } catch {
    // Modo privado o almacenamiento bloqueado: el tema no se recuerda, pero funciona
  }
};

function pintarBoton(boton, tema) {
  const oscuro = tema === "dark";
  boton.querySelector("i").className = oscuro ? "bi bi-sun" : "bi bi-moon-stars";
  boton.setAttribute("aria-label", oscuro ? "Activar modo claro" : "Activar modo oscuro");
  boton.setAttribute("aria-pressed", String(oscuro));
}

export function iniciarTema(boton) {
  if (!boton) return;
  pintarBoton(boton, temaActual());

  boton.addEventListener("click", () => {
    const nuevo = temaActual() === "dark" ? "light" : "dark";
    const aplicar = () => {
      document.documentElement.dataset.bsTheme = nuevo;
      pintarBoton(boton, nuevo);
    };
    guardar(nuevo);

    // El nuevo tema se expande en un círculo desde el botón
    const vista = transicionConTipo("tema", aplicar);
    if (!vista) return;
    const r = boton.getBoundingClientRect();
    const x = r.left + r.width / 2;
    const y = r.top + r.height / 2;
    const radio = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y));
    vista.ready.then(() => {
      document.documentElement.animate(
        { clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${radio}px at ${x}px ${y}px)`] },
        { duration: 650, easing: "cubic-bezier(.4, 0, .2, 1)", pseudoElement: "::view-transition-new(root)" },
      );
    }).catch(() => {}); // si el navegador cancela la transición, el tema ya quedó aplicado
  });
}
