// =========================================================
// Animaciones al hacer scroll.
// Los elementos con la clase "revelar" aparecen suavemente
// cuando entran en pantalla. Si la persona prefiere menos
// movimiento (ajuste del sistema), no se anima nada.
// =========================================================

const prefiereQuieto = () => matchMedia("(prefers-reduced-motion: reduce)").matches;

export function iniciarAnimaciones() {
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

  // Pequeño retraso escalonado entre hermanos (las tarjetas de "Nosotros")
  elementos.forEach((el) => {
    const hermanos = [...el.parentElement.children].filter((h) => h.classList.contains("revelar"));
    el.style.setProperty("--retraso", `${hermanos.indexOf(el) * 90}ms`);
    observador.observe(el);
  });
}
