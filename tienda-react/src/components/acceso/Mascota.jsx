// src/components/acceso/Mascota.jsx
// Cupcake que acompaña el formulario:
//   · mira hacia lo que escribes (los ojos siguen el texto)
//   · se tapa los ojos cuando escribes la contraseña, y espía si la muestras
//   · se pone triste con un error y salta de alegría al entrar
//   · se ARMA por capas mientras creas tu cuenta: nivel 1 pirotín, 2 crema, 3 cereza, 4 vela encendida
// Es decorativo (aria-hidden): la información siempre está en el formulario.
export default function Mascota({ modo = "mirar", mirada = 0.5, nivel = 3 }) {
  const capa = (n) => `mascota-capa ${nivel >= n ? "visible" : ""}`;
  const tapa = modo === "tapar" || modo === "espiar";
  const dx = (mirada - 0.5) * 10; // los ojos se mueven de izquierda a derecha
  const dy = modo === "mirar" ? 3 : 0;

  return (
    <svg className={`mascota mascota-${modo}`} viewBox="0 0 160 150" aria-hidden="true">
      <ellipse cx="80" cy="144" rx="44" ry="5" className="mascota-sombra" />
      <g className="mascota-cuerpo">
        {/* Pirotín */}
        <path d="M34 82h92l-10 58H44z" className="mascota-pirotin" />
        <path d="M50 84l4 54M66 84l2 56M80 84v56M94 84l-2 56M110 84l-4 54" className="mascota-rayas" />
        {/* Capa 2: crema */}
        <g className={capa(2)}>
          <path d="M28 86c-8-20 10-30 20-28-2-18 18-28 32-18 14-10 34 0 32 18 10-2 28 8 20 28z" className="mascota-crema" />
        </g>
        {/* Capa 3: cereza y chispas */}
        <g className={capa(3)}>
          <circle cx="80" cy="30" r="9" className="mascota-cereza" />
          <path d="M80 22c2-8 8-12 14-12" className="mascota-tallo" />
          <g className="mascota-chispas">
            <rect x="52" y="56" width="7" height="3" rx="1.5" transform="rotate(-30 55 57)" />
            <rect x="102" y="52" width="7" height="3" rx="1.5" transform="rotate(25 105 53)" />
            <rect x="70" y="44" width="7" height="3" rx="1.5" transform="rotate(10 73 45)" />
          </g>
        </g>
        {/* Capa 4: vela encendida (¡cuenta creada!) */}
        <g className={capa(4)}>
          <rect x="104" y="22" width="7" height="26" rx="2" className="mascota-vela" />
          <path d="M104 30l7-4M104 38l7-4" className="mascota-vela-rayas" />
          <path d="M107.5 6c5 6 5 10 0 13-5-3-5-7 0-13z" className="mascota-llama" />
        </g>
        {/* Cara */}
        <g className="mascota-cara">
          {modo === "feliz" ? (
            <>
              <path d="M58 104q6-7 12 0M90 104q6-7 12 0" className="mascota-ojo-feliz" />
            </>
          ) : (
            <g transform={`translate(${dx} ${dy})`}>
              <g className="mascota-ojo"><circle cx="64" cy="104" r="6" /><circle cx="66" cy="102" r="2" className="mascota-brillo" /></g>
              <g className="mascota-ojo"><circle cx="96" cy="104" r="6" /><circle cx="98" cy="102" r="2" className="mascota-brillo" /></g>
            </g>
          )}
          <ellipse cx="54" cy="116" rx="6" ry="3.5" className="mascota-mejilla" />
          <ellipse cx="106" cy="116" rx="6" ry="3.5" className="mascota-mejilla" />
          {modo === "triste"
            ? <path d="M72 124q8-6 16 0" className="mascota-boca" />
            : <path d={modo === "feliz" ? "M68 116q12 14 24 0" : "M72 118q8 7 16 0"} className="mascota-boca" />}
        </g>
        {/* Manitos de crema: suben a taparle los ojos */}
        <g className={`mascota-manos ${tapa ? "arriba" : ""}`}>
          <ellipse cx="62" cy="104" rx="13" ry="10" className={`mascota-mano izquierda ${modo === "espiar" ? "espiando" : ""}`} />
          <ellipse cx="98" cy="104" rx="13" ry="10" className="mascota-mano derecha" />
        </g>
      </g>
    </svg>
  );
}
