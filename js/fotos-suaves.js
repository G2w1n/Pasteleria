// =========================================================
// Fotos que cargan suaves: mientras llega la foto real se ve su
// versión diminuta, borrosa, y al terminar de cargar se aclara.
// Sirve para cualquier <img> de img/productos/*.webp, la dibuje el
// JS de la tienda o React: se detectan al aparecer en la página
// (MutationObserver), sin tocar los componentes.
// =========================================================
import { FOTOS_MINI } from "./fotos-mini.js";
import { prefiereQuieto } from "./animaciones.js";

const RUTA = /img\/productos\/([a-z0-9-]+)\.webp$/;

function preparar(img) {
  const id = img.getAttribute("src")?.match(RUTA)?.[1];
  if (!id || img.dataset.suave === id || !FOTOS_MINI[id]) return;
  img.dataset.suave = id;
  if (img.complete && img.naturalWidth) return; // ya estaba guardada en el navegador: se ve al instante

  img.style.backgroundImage = `url("${FOTOS_MINI[id]}")`;
  img.classList.add("foto-cargando");
  const listo = () => {
    img.classList.remove("foto-cargando");
    img.style.backgroundImage = "";
    if (prefiereQuieto()) return;
    // Con una animación (y no con transition) para no pisar el zoom al pasar el mouse
    img.classList.add("foto-aclara");
    img.addEventListener("animationend", () => img.classList.remove("foto-aclara"), { once: true });
  };
  img.addEventListener("load", listo, { once: true });
  img.addEventListener("error", listo, { once: true });
}

export function iniciarFotosSuaves() {
  const revisar = (nodo) => {
    if (nodo.nodeType !== Node.ELEMENT_NODE) return;
    if (nodo.tagName === "IMG") preparar(nodo);
    else nodo.querySelectorAll('img[src*="img/productos/"]').forEach(preparar);
  };
  revisar(document.body);
  new MutationObserver((cambios) => {
    for (const cambio of cambios) {
      if (cambio.type === "attributes") preparar(cambio.target);
      else cambio.addedNodes.forEach(revisar);
    }
  }).observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ["src"] });
}
