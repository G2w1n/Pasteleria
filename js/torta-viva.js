// =========================================================
// "Torta viva": la vista previa del pedido especial.
// El SVG se dibuja UNA vez y luego solo se cambian sus
// variables CSS y clases. Así el navegador puede animar
// cada cambio: la torta crece con el tamaño, en "Fiesta"
// cae un segundo piso y los extras aparecen sobre ella.
// =========================================================

const SVG = `
<svg class="torta-viva" viewBox="0 0 400 300" xmlns="http://www.w3.org/2000/svg" role="img">
  <title id="tortaVivaTitulo">Vista previa de tu torta</title>
  <ellipse class="tv-plato" cx="200" cy="272" rx="160" ry="14"/>
  <g class="tv-cuerpo">
    <!-- Piso inferior -->
    <g class="tv-piso tv-piso-1">
      <rect x="90" y="172" width="220" height="92" rx="14" class="tv-masa"/>
      <rect x="90" y="208" width="220" height="12" class="tv-relleno"/>
      <rect x="90" y="236" width="220" height="8" class="tv-relleno"/>
      <path class="tv-cobertura" d="M90 186c0-8 6-14 14-14h192c8 0 14 6 14 14v8c-9 0-9 14-18 14s-9-10-18-10-9 18-18 18-9-14-18-14-9 10-18 10-9-16-18-16-9 12-18 12-9-8-18-8-9 16-18 16-9-12-18-12-9 6-18 6-8-10-16-10z"/>
      <!-- Foto comestible -->
      <g class="tv-extra tv-foto">
        <rect x="168" y="214" width="64" height="40" rx="6" fill="#fff" stroke="#e7d9c9" stroke-width="2"/>
        <rect x="173" y="219" width="54" height="30" rx="3" fill="#bfe0ef"/>
        <circle cx="216" cy="226" r="5" fill="#f2c94c"/>
        <path d="M173 249l16-16 10 10 8-6 20 12z" fill="#5a8f5e"/>
      </g>
      <text class="tv-mensaje" x="200" y="257" text-anchor="middle"></text>
    </g>
    <!-- Piso superior (solo en "Fiesta") -->
    <g class="tv-piso tv-piso-2">
      <rect x="128" y="98" width="144" height="76" rx="12" class="tv-masa"/>
      <rect x="128" y="130" width="144" height="10" class="tv-relleno"/>
      <path class="tv-cobertura" d="M128 110c0-7 5-12 12-12h120c7 0 12 5 12 12v6c-8 0-8 12-16 12s-8-9-16-9-8 15-16 15-8-12-16-12-8 9-16 9-8-14-16-14-8 10-16 10-8-7-16-7-8 9-12 9z"/>
    </g>
    <!-- Decoración de arriba: se sube al piso superior en "Fiesta" -->
    <g class="tv-arriba">
      <g class="tv-extra tv-flores">
        <g transform="translate(118 170)"><circle r="7" fill="#e58aa9"/><circle cx="7" r="7" fill="#e58aa9"/><circle cx="3.5" cy="-6.5" r="7" fill="#f3b3c8"/><circle cx="3.5" cy="3" r="4" fill="#f2c94c"/></g>
        <g transform="translate(272 168)"><circle r="6" fill="#fbf6ef"/><circle cx="6" r="6" fill="#fbf6ef"/><circle cx="3" cy="-5.5" r="6" fill="#fff"/><circle cx="3" cy="2.5" r="3.5" fill="#e0a03a"/></g>
        <path d="M128 168c6-8 14-8 18-4-6 6-12 6-18 4z" fill="#5a8f5e"/>
      </g>
      <g class="tv-extra tv-aguaymantos">
        <circle cx="168" cy="164" r="9" fill="#f2a516"/><circle cx="165" cy="161" r="2.4" fill="#fff" opacity=".6"/>
        <circle cx="236" cy="164" r="9" fill="#f2a516"/><circle cx="233" cy="161" r="2.4" fill="#fff" opacity=".6"/>
        <path d="M160 160c-4-10 2-18 9-19-2 7 3 13 2 19z M228 160c-4-10 2-18 9-19-2 7 3 13 2 19z" fill="#c9b48a"/>
      </g>
      <g class="tv-extra tv-velas">
        <g class="tv-vela" transform="translate(178 128)"><rect x="-4" width="8" height="44" rx="2" fill="#f3b3c8"/><path d="M-4 8l8-4M-4 20l8-4M-4 32l8-4" stroke="#fff" stroke-width="2"/><path class="tv-llama" d="M0 -4c-6 -8 0 -16 0 -18 0 2 6 10 0 18z" fill="#f2a516"/></g>
        <g class="tv-vela" transform="translate(200 122)"><rect x="-4" width="8" height="50" rx="2" fill="#bfe0ef"/><path d="M-4 8l8-4M-4 20l8-4M-4 32l8-4M-4 44l8-4" stroke="#fff" stroke-width="2"/><path class="tv-llama" d="M0 -4c-6 -8 0 -16 0 -18 0 2 6 10 0 18z" fill="#f2a516"/></g>
        <g class="tv-vela" transform="translate(222 128)"><rect x="-4" width="8" height="44" rx="2" fill="#f2c94c"/><path d="M-4 8l8-4M-4 20l8-4M-4 32l8-4" stroke="#fff" stroke-width="2"/><path class="tv-llama" d="M0 -4c-6 -8 0 -16 0 -18 0 2 6 10 0 18z" fill="#f2a516"/></g>
      </g>
      <g class="tv-extra tv-topper">
        <path d="M262 172V92" stroke="#c9b48a" stroke-width="3"/>
        <path d="M262 112c-9-11-26-4-20 9 3 7 20 17 20 17s17-10 20-17c6-13-11-20-20-9z" fill="#8e2c4e"/>
        <path d="M255 118h14" stroke="#fbf6ef" stroke-width="2.5" stroke-linecap="round"/>
      </g>
    </g>
  </g>
</svg>`;

// Escala de la torta según el tamaño elegido
const ESCALAS = { mini: 0.72, mediana: 0.86, grande: 1, fiesta: 1 };

// ¿El bizcocho es oscuro? Entonces el mensaje se escribe en claro
const esOscuro = (hex) => {
  const n = parseInt(hex.slice(1), 16);
  const [r, g, b] = [n >> 16, (n >> 8) & 255, n & 255];
  return 0.299 * r + 0.587 * g + 0.114 * b < 140;
};

export function crearTortaViva(contenedor) {
  contenedor.innerHTML = SVG;
  const svg = contenedor.querySelector("svg");
  const mensaje = svg.querySelector(".tv-mensaje");
  const titulo = svg.querySelector("title");

  // Recibe el pedido actual y actualiza solo lo que cambió
  return function actualizar({ tamano, colores, extras = [], texto = "", descripcion = "" }) {
    svg.dataset.tamano = tamano;
    svg.style.setProperty("--escala", ESCALAS[tamano] ?? 1);
    svg.style.setProperty("--tv-masa", colores.masa);
    svg.style.setProperty("--tv-relleno", colores.relleno);
    svg.style.setProperty("--tv-cobertura", colores.cobertura);
    svg.style.setProperty("--tv-texto", esOscuro(colores.masa) ? "#fbf6ef" : "#3a2420");
    for (const extra of ["velas", "flores", "topper", "aguaymanto", "foto"]) {
      svg.classList.toggle(`con-${extra}`, extras.includes(extra));
    }
    // El mensaje se acorta para que entre en el frente de la torta
    mensaje.textContent = texto.length > 22 ? `${texto.slice(0, 21)}…` : texto;
    titulo.textContent = descripcion;
  };
}
