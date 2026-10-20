// =========================================================
// Kuyay · Pastelería de autor
// Lógica de la tienda. Es un módulo ES (type="module"):
// sus variables NO son globales.
// En las fases 3 y 4 aquí van el catálogo y el carrito.
// =========================================================

// Año actual en el pie de página
const anio = document.querySelector("#anio");
if (anio) anio.textContent = new Date().getFullYear();
