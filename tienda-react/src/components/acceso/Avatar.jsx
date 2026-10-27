// src/components/acceso/Avatar.jsx
// Las iniciales aparecen mientras escribes tu nombre, con un color propio
// (el mismo nombre siempre da el mismo color).
const COLORES = ["#8e2c4e", "#a0522d", "#2f6b4f", "#5b3f8c", "#b4532a", "#1f5f7a"];

export const iniciales = (nombre) =>
  nombre.trim().split(/\s+/).filter(Boolean).slice(0, 2).map((p) => p[0].toUpperCase()).join("");

export default function Avatar({ nombre }) {
  const texto = iniciales(nombre);
  const color = COLORES[[...nombre.trim().toLowerCase()].reduce((s, c) => s + c.charCodeAt(0), 0) % COLORES.length];
  return (
    <div className="avatar-vivo" style={{ "--avatar": color }} aria-hidden="true">
      {/* key: cada vez que cambian las iniciales, el círculo "rebota" */}
      <span key={texto} className={texto ? "con-texto" : ""}>{texto || <i className="bi bi-person" />}</span>
    </div>
  );
}
