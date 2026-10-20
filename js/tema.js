// =========================================================
// Modo claro / oscuro.
// El tema inicial lo aplica un script corto en el <head>
// (para que la página no "parpadee" al cargar). Este módulo
// solo maneja el botón.
// =========================================================

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
    document.documentElement.dataset.bsTheme = nuevo;
    guardar(nuevo);
    pintarBoton(boton, nuevo);
  });
}
