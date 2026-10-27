// src/components/acceso/ChecklistClave.jsx
// Reglas de la contraseña que se marcan solas mientras escribes, con barra de fuerza.
export const REGLAS = [
  { id: "largo", texto: "8 caracteres o más", cumple: (c) => c.length >= 8 },
  { id: "mayus", texto: "Una mayúscula", cumple: (c) => /[A-ZÁÉÍÓÚÑ]/.test(c) },
  { id: "numero", texto: "Un número", cumple: (c) => /\d/.test(c) },
  { id: "simbolo", texto: "Un símbolo (!#$…)", cumple: (c) => /[^A-Za-z0-9ÁÉÍÓÚÑáéíóúñ]/.test(c) },
];
const NIVELES = ["Muy débil", "Débil", "Regular", "Buena", "¡Muy segura!"];

export const puntaje = (clave) => REGLAS.filter((r) => r.cumple(clave)).length;

export default function ChecklistClave({ clave }) {
  const n = puntaje(clave);
  return (
    <div className="checklist-clave">
      <div className="fuerza">
        <div className="progress" role="progressbar" aria-label="Seguridad de la contraseña" aria-valuenow={n} aria-valuemin="0" aria-valuemax="4" aria-valuetext={NIVELES[n]}>
          <div className={`progress-bar fuerza-${n}`} style={{ width: `${(n / 4) * 100}%` }} />
        </div>
        <span className="fuerza-texto">{clave ? NIVELES[n] : ""}</span>
      </div>
      <ul className="reglas">
        {REGLAS.map((r) => {
          const ok = r.cumple(clave);
          return (
            <li key={r.id} className={ok ? "cumple" : ""}>
              <i className={`bi ${ok ? "bi-check-circle-fill" : "bi-circle"}`} aria-hidden="true" />
              <span>{r.texto}</span>
              <span className="visually-hidden">{ok ? ": cumplido" : ": pendiente"}</span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
