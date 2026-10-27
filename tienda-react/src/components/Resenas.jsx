// src/components/Resenas.jsx
// Reseñas de un producto (se muestran en la pestaña "Reseñas" del detalle).
// Los clientes con cuenta pueden dejar o editar la suya; se guardan en Neon.
import { useEffect, useState } from "react";

const fecha = (iso) => new Intl.DateTimeFormat("es-PE", { day: "numeric", month: "short", year: "numeric" }).format(new Date(iso));
const estrellas = (n) => "★".repeat(Math.round(n)) + "☆".repeat(5 - Math.round(n));
const TEXTOS = ["", "No me gustó", "Regular", "Bueno", "Muy bueno", "¡Excelente!"];

export default function Resenas({ productoId, usuario, api, onTotal }) {
  const [datos, setDatos] = useState(null);
  const [error, setError] = useState("");
  const [recarga, setRecarga] = useState(0);
  const [puntaje, setPuntaje] = useState(0);
  const [comentario, setComentario] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [mensaje, setMensaje] = useState("");

  // Se piden las reseñas cada vez que cambia el producto (o después de guardar)
  useEffect(() => {
    let vigente = true;
    setError("");
    api(`resenas?producto=${encodeURIComponent(productoId)}`)
      .then((d) => {
        if (!vigente) return;
        setDatos(d);
        onTotal?.(d.total);
        const propia = d.resenas.find((r) => r.propia);
        setPuntaje(propia?.estrellas ?? 0);
        setComentario(propia?.comentario ?? "");
      })
      .catch((e) => vigente && setError(e.message));
    return () => {
      vigente = false;
    };
  }, [productoId, recarga, api, onTotal]);

  const guardar = async (e) => {
    e.preventDefault();
    if (!puntaje) return setMensaje("Elige cuántas estrellas le das.");
    setEnviando(true);
    setMensaje("");
    try {
      await api("resenas", { metodo: "POST", datos: { producto: productoId, estrellas: puntaje, comentario } });
      setMensaje("¡Gracias! Tu reseña se publicó.");
      setRecarga((n) => n + 1);
    } catch (err) {
      setMensaje(err.message);
    } finally {
      setEnviando(false);
    }
  };

  if (error) return <p className="fg-3 mb-0">{error}</p>;
  if (!datos) return <p className="fg-3 mb-0"><span className="spinner-border spinner-sm" aria-hidden="true" /> Cargando reseñas…</p>;
  const propia = datos.resenas.find((r) => r.propia);

  return (
    <div className="resenas">
      {datos.total > 0 ? (
        <div className="resenas-resumen">
          <div className="resenas-promedio">
            <strong>{datos.promedio.toFixed(1)}</strong>
            <span className="resenas-estrellas" aria-hidden="true">{estrellas(datos.promedio)}</span>
            <span className="fg-3 fs-sm">{datos.total} {datos.total === 1 ? "reseña" : "reseñas"}</span>
            <span className="visually-hidden">{datos.promedio.toFixed(1)} de 5 estrellas</span>
          </div>
          <ul className="resenas-reparto" aria-label="Reparto de estrellas">
            {datos.reparto.map((r) => (
              <li key={r.estrellas}>
                <span>{r.estrellas} ★</span>
                <div className="progress" role="progressbar" aria-label={`${r.estrellas} estrellas`} aria-valuenow={r.cantidad} aria-valuemin="0" aria-valuemax={datos.total}>
                  <div className="progress-bar" style={{ width: `${(r.cantidad / datos.total) * 100}%` }} />
                </div>
                <span className="fg-3">{r.cantidad}</span>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <p className="fg-2">Aún no hay reseñas. ¡Sé el primero en opinar!</p>
      )}

      {datos.resenas.length > 0 && (
        <ul className="resenas-lista">
          {datos.resenas.map((r) => (
            <li key={r.id} className="resena-item">
              <div className="resena-cabecera">
                <span className="avatar avatar-sm resena-avatar" aria-hidden="true">{r.nombre[0]}</span>
                <b>{r.nombre}{r.propia && <span className="badge theme-accent ms-2">Tú</span>}</b>
                <span className="resenas-estrellas" aria-label={`${r.estrellas} de 5 estrellas`}>{estrellas(r.estrellas)}</span>
                <span className="fg-3 fs-xs ms-auto">{fecha(r.fecha)}</span>
              </div>
              {r.comentario && <p className="mb-0">{r.comentario}</p>}
            </li>
          ))}
        </ul>
      )}

      {usuario ? (
        <form className="resena-form" onSubmit={guardar}>
          <fieldset>
            <legend className="form-label">{propia ? "Edita tu reseña" : "Deja tu reseña"}</legend>
            {/* Estrellas: radios ocultos, se eligen con clic o con las flechas del teclado */}
            <div className="estrellas-input">
              {[1, 2, 3, 4, 5].map((n) => (
                <label key={n} className={n <= puntaje ? "llena" : ""} title={TEXTOS[n]}>
                  <input type="radio" name={`estrellas-${productoId}`} value={n} checked={puntaje === n} onChange={() => setPuntaje(n)} />
                  <span aria-hidden="true">★</span>
                  <span className="visually-hidden">{n} {n === 1 ? "estrella" : "estrellas"}: {TEXTOS[n]}</span>
                </label>
              ))}
              <span className="fg-2 fs-sm ms-2" aria-hidden="true">{TEXTOS[puntaje]}</span>
            </div>
          </fieldset>
          <label className="visually-hidden" htmlFor={`comentario-${productoId}`}>Comentario</label>
          <textarea className="form-control mt-2" id={`comentario-${productoId}`} rows="2" maxLength="300"
                    placeholder="¿Qué te pareció? (opcional)" value={comentario} onChange={(e) => setComentario(e.target.value)} />
          <div className="resena-acciones">
            <span className="fg-3 fs-xs">{comentario.length} / 300</span>
            <button className="btn btn-solid theme-primary btn-sm" type="submit" disabled={enviando}>
              {enviando && <span className="spinner-border spinner-sm" aria-hidden="true" />} {propia ? "Actualizar" : "Publicar"}
            </button>
          </div>
          {mensaje && <p className="fs-sm mt-2 mb-0" role="status">{mensaje}</p>}
        </form>
      ) : (
        <p className="resena-ingresar mb-0"><a href="cuenta.html">Ingresa a tu cuenta</a> para dejar tu reseña.</p>
      )}
    </div>
  );
}
