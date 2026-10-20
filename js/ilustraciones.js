// =========================================================
// Ilustraciones SVG de los productos.
// Cada forma es una función que recibe los colores del
// producto y devuelve el dibujo como texto SVG.
// Así 16 productos comparten 8 dibujos, cada uno con sus colores.
// =========================================================

// Sombra del plato, común a todas las formas
const sombra = (ancho = 70) => `<ellipse cx="100" cy="132" rx="${ancho}" ry="8" fill="#3a2420" opacity=".12"/>`;

const FORMAS = {
  // Porción de torta en perspectiva
  rebanada: ({ masa, relleno, cobertura, topping }) => `
    ${sombra(72)}
    <path d="M38 74 150 92v38L38 112z" fill="${masa}"/>
    <path d="M38 86l112 18v8L38 95z M38 100l112 18v6L38 107z" fill="${relleno}"/>
    <path d="M150 92 172 64v38l-22 28z" fill="${masa}"/>
    <path d="M150 92 172 64v38l-22 28z" fill="#000" opacity=".12"/>
    <path d="M38 74 150 92l22-28L66 50z" fill="${cobertura}"/>
    <path d="M38 74 150 92v7c-6 0-6 6-12 6s-6-8-12-8-6 6-12 6-6-7-12-7-6 5-12 5-6-6-12-6-6 4-12 4-6-6-12-6-6 3-12 3-6-5-12-5z" fill="${cobertura}"/>
    <circle cx="140" cy="68" r="8" fill="${topping}"/>
    <circle cx="137" cy="65" r="2.2" fill="#fff" opacity=".6"/>`,

  // Postre servido en vaso
  vaso: ({ masa, relleno, cobertura, topping }) => `
    ${sombra(46)}
    <path d="M66 46h68l-8 82H74z" fill="#ffffff" opacity=".55"/>
    <path d="M71 96h58l-3 32H74z" fill="${masa}"/>
    <path d="M69 74h62l-2 22H71z" fill="${relleno}"/>
    <path d="M68 58h64l-1 16H69z" fill="${cobertura}"/>
    <path d="M68 58c6-10 14 4 22-6s14 6 22-2 14 4 20 8z" fill="${cobertura}"/>
    <circle cx="92" cy="54" r="2.4" fill="${topping}"/><circle cx="104" cy="50" r="2.4" fill="${topping}"/><circle cx="114" cy="55" r="2.4" fill="${topping}"/>
    <path d="M66 46h68l-8 82H74z" fill="none" stroke="#3a2420" stroke-opacity=".18" stroke-width="2"/>
    <path d="M78 52l-4 66" stroke="#fff" stroke-opacity=".7" stroke-width="3" stroke-linecap="round"/>`,

  // Alfajor: dos galletas y relleno
  alfajor: ({ masa, relleno, topping }) => `
    ${sombra(66)}
    <ellipse cx="100" cy="112" rx="60" ry="16" fill="${masa}"/>
    <rect x="40" y="98" width="120" height="14" fill="${masa}"/>
    <ellipse cx="100" cy="98" rx="60" ry="16" fill="#000" opacity=".06"/>
    <rect x="44" y="88" width="112" height="12" rx="6" fill="${relleno}"/>
    <ellipse cx="100" cy="84" rx="60" ry="16" fill="${masa}"/>
    <rect x="40" y="70" width="120" height="14" fill="${masa}"/>
    <ellipse cx="100" cy="70" rx="60" ry="16" fill="${masa}"/>
    <ellipse cx="100" cy="70" rx="60" ry="16" fill="#000" opacity=".04"/>
    <g fill="${topping}" opacity=".95">
      <circle cx="78" cy="66" r="2"/><circle cx="96" cy="62" r="2.4"/><circle cx="114" cy="68" r="2"/>
      <circle cx="128" cy="64" r="1.8"/><circle cx="88" cy="74" r="1.8"/><circle cx="106" cy="76" r="2"/><circle cx="70" cy="72" r="1.6"/>
    </g>`,

  // Pan redondo con cortes
  pan: ({ masa, cobertura, topping }) => `
    ${sombra(66)}
    <path d="M38 118c0-36 28-62 62-62s62 26 62 62c0 6-4 10-10 10H48c-6 0-10-4-10-10z" fill="${masa}"/>
    <path d="M38 118c0-36 28-62 62-62s62 26 62 62c0 6-4 10-10 10H48c-6 0-10-4-10-10z" fill="url(#brillo)"/>
    <path d="M70 80c10 6 18 6 26 0M96 72c10 6 18 6 26 0M84 98c10 6 18 6 26 0" fill="none" stroke="${cobertura}" stroke-width="4" stroke-linecap="round"/>
    <g fill="${topping}"><ellipse cx="62" cy="96" rx="2" ry="1.2"/><ellipse cx="132" cy="92" rx="2" ry="1.2"/><ellipse cx="120" cy="108" rx="2" ry="1.2"/><ellipse cx="74" cy="110" rx="2" ry="1.2"/></g>`,

  // Panetón con su molde de papel
  paneton: ({ masa, cobertura, topping }) => `
    ${sombra(56)}
    <path d="M50 52c0-22 22-34 50-34s50 12 50 34z" fill="${masa}"/>
    <path d="M50 52c0-22 22-34 50-34s50 12 50 34z" fill="url(#brillo)"/>
    <g fill="${topping}"><circle cx="78" cy="38" r="3"/><circle cx="104" cy="30" r="3"/><circle cx="124" cy="42" r="3"/><circle cx="92" cy="46" r="2.6"/></g>
    <g fill="${cobertura}" opacity=".85"><circle cx="66" cy="46" r="2.4"/><circle cx="116" cy="36" r="2.4"/><circle cx="138" cy="48" r="2.2"/></g>
    <rect x="48" y="50" width="104" height="78" rx="6" fill="${cobertura}"/>
    <path d="M60 50v78M76 50v78M92 50v78M108 50v78M124 50v78M140 50v78" stroke="#fff" stroke-opacity=".28" stroke-width="5"/>
    <rect x="48" y="50" width="104" height="8" fill="#000" opacity=".12"/>`,

  // Empanada con borde repulgado
  empanada: ({ masa, cobertura, topping }) => `
    ${sombra(72)}
    <path d="M30 116c0-40 31-70 70-70s70 30 70 70z" fill="${masa}"/>
    <path d="M30 116c0-40 31-70 70-70s70 30 70 70z" fill="url(#brillo)"/>
    <path d="M30 116h140" stroke="${cobertura}" stroke-width="10" stroke-linecap="round"/>
    <g fill="${cobertura}">
      <circle cx="36" cy="116" r="7"/><circle cx="52" cy="116" r="7"/><circle cx="68" cy="116" r="7"/><circle cx="84" cy="116" r="7"/>
      <circle cx="100" cy="116" r="7"/><circle cx="116" cy="116" r="7"/><circle cx="132" cy="116" r="7"/><circle cx="148" cy="116" r="7"/><circle cx="164" cy="116" r="7"/>
    </g>
    <g fill="${topping}" opacity=".8"><circle cx="88" cy="72" r="2"/><circle cx="104" cy="66" r="2"/><circle cx="118" cy="76" r="2"/></g>`,

  // Sánguche con relleno en capas
  sanguche: ({ masa, relleno, cobertura, topping }) => `
    ${sombra(70)}
    <rect x="36" y="108" width="128" height="18" rx="9" fill="${masa}"/>
    <path d="M40 104c10-8 22 4 32-4s22 6 32-2 22 6 32-2 18 2 24 6v6H40z" fill="${relleno}"/>
    <rect x="42" y="96" width="116" height="10" rx="5" fill="${cobertura}"/>
    <path d="M48 94c8-8 16 4 24-2s14 4 22-2 14 4 22-2 14 2 20 4" fill="none" stroke="${topping}" stroke-width="5" stroke-linecap="round"/>
    <path d="M36 92c0-30 28-48 64-48s64 18 64 48c0 4-3 6-7 6H43c-4 0-7-2-7-6z" fill="${masa}"/>
    <path d="M36 92c0-30 28-48 64-48s64 18 64 48c0 4-3 6-7 6H43c-4 0-7-2-7-6z" fill="url(#brillo)"/>
    <path d="M70 62c10 4 20 4 30 0M100 58c10 4 20 4 30 0" fill="none" stroke="#000" stroke-opacity=".12" stroke-width="3" stroke-linecap="round"/>`,

  // Tequeños con salsa
  palitos: ({ masa, relleno, cobertura, topping }) => `
    ${sombra(72)}
    <g transform="rotate(-14 92 92)">
      <rect x="34" y="56" width="104" height="20" rx="10" fill="${masa}"/>
      <rect x="34" y="82" width="104" height="20" rx="10" fill="${masa}"/>
      <rect x="34" y="108" width="104" height="20" rx="10" fill="${masa}"/>
      <g fill="none" stroke="${cobertura}" stroke-width="2.5" stroke-linecap="round" opacity=".7">
        <path d="M56 60l10 12M80 60l10 12M104 60l10 12M56 86l10 12M80 86l10 12M104 86l10 12M56 112l10 12M80 112l10 12M104 112l10 12"/>
      </g>
      <ellipse cx="136" cy="66" rx="5" ry="7" fill="${relleno}"/>
    </g>
    <ellipse cx="160" cy="112" rx="26" ry="12" fill="#fbf6ef"/>
    <ellipse cx="160" cy="108" rx="20" ry="8" fill="${topping}"/>`,
};

// El degradado "brillo" (volumen de panes y masas) se define UNA sola vez
// en index.html: si cada dibujo lo repitiera, habría ids duplicados.

/**
 * Devuelve la ilustración SVG de un producto.
 * @param {object} ilustracion - forma y colores (ver productos.js)
 * @param {string} [titulo] - texto alternativo para lectores de pantalla
 */
export function dibujarProducto(ilustracion, titulo = "") {
  const forma = FORMAS[ilustracion.forma] ?? FORMAS.pan;
  const accesible = titulo ? `role="img" aria-label="${titulo}"` : `aria-hidden="true"`;
  return `<svg viewBox="0 0 200 150" xmlns="http://www.w3.org/2000/svg" ${accesible}>${forma(ilustracion)}</svg>`;
}
