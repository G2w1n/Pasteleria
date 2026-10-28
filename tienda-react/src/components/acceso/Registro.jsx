// src/components/acceso/Registro.jsx
// Crear cuenta en 3 pasos (Stepper de Bootstrap 6): tus datos → contraseña → contacto y gustos.
// Cada paso se valida antes de avanzar; el avatar muestra tus iniciales en vivo.
import { useEffect, useRef, useState } from "react";
import Campo from "./Campo.jsx";
import CampoClave from "./CampoClave.jsx";
import ChecklistClave from "./ChecklistClave.jsx";
import Avatar from "./Avatar.jsx";
import { CELULAR, CORREO, validarCelular, validarCorreo, validarNombre } from "./validar.js";
import BotonEnviar from "./BotonEnviar.jsx";

const PASOS = ["Tus datos", "Contraseña", "Contacto"];
const GUSTOS = [
  { id: "tortas", texto: "Tortas", icono: "🎂" },
  { id: "postres", texto: "Postres", icono: "🍮" },
  { id: "panes", texto: "Panes", icono: "🥖" },
  { id: "salados", texto: "Salados", icono: "🥟" },
];

export default function Registro({ api, correoInicial = "", onIngreso, onIrIngresar, onError, onPaso, enfocar }) {
  const [paso, setPaso] = useState(0);
  const [datos, setDatos] = useState({ nombre: "", correo: correoInicial, telefono: "", clave: "" });
  const [gustos, setGustos] = useState([]);
  const [tocados, setTocados] = useState({});
  const [disponible, setDisponible] = useState(null); // null = sin revisar · "revisando" · true · false
  const [error, setError] = useState("");
  const [estado, setEstado] = useState("listo"); // listo · cargando · hecho
  const titulo = useRef(null);
  const cambiar = (campo) => (valor) => {
    setDatos((d) => ({ ...d, [campo]: valor }));
    setError(""); // al corregir, el aviso rojo desaparece
  };
  // Un campo se marca como "tocado" al salir de él solo si escribiste algo (vacío no se pinta de rojo)
  const tocar = (campo) => (e) => e.target.value && setTocados((t) => ({ ...t, [campo]: true }));

  // ¿El correo ya tiene cuenta? Se pregunta a la API medio segundo después de dejar de escribir
  useEffect(() => {
    const correo = datos.correo.trim();
    if (!CORREO.test(correo)) return setDisponible(null);
    setDisponible("revisando");
    const reloj = setTimeout(() => {
      api(`auth?correo=${encodeURIComponent(correo)}`).then((r) => setDisponible(r.disponible)).catch(() => setDisponible(null));
    }, 500);
    return () => clearTimeout(reloj);
  }, [datos.correo, api]);

  const vNombre = validarNombre(datos.nombre, tocados.nombre);
  let vCorreo = validarCorreo(datos.correo, tocados.correo);
  if (CORREO.test(datos.correo.trim())) {
    vCorreo = disponible === "revisando" ? { estado: "cargando", mensaje: "Revisando…" }
      : disponible === false ? { estado: "error", mensaje: "Este correo ya tiene una cuenta." }
      : disponible === true ? { estado: "ok", mensaje: "¡Perfecto, está disponible!" }
      : vCorreo;
  }
  const vTelefono = validarCelular(datos.telefono);
  const claveOk = datos.clave.length >= 8;
  const pasoValido = [
    datos.nombre.trim().length >= 3 && CORREO.test(datos.correo.trim()) && disponible !== false && disponible !== "revisando",
    claveOk,
    !datos.telefono || CELULAR.test(datos.telefono),
  ];

  const irA = (n) => {
    setError("");
    setPaso(n);
    onPaso?.(n); // el cupcake suma una capa por paso
    requestAnimationFrame(() => titulo.current?.focus()); // el lector de pantalla anuncia el paso nuevo
  };
  const siguiente = () => {
    if (paso === 0) setTocados((t) => ({ ...t, nombre: true, correo: true }));
    if (paso === 1) setTocados((t) => ({ ...t, clave: true }));
    if (!pasoValido[paso]) {
      onError?.();
      return setError(paso === 0 ? "Completa tu nombre y un correo disponible." : "La contraseña necesita al menos 8 caracteres.");
    }
    irA(paso + 1);
  };

  const enviar = async (e) => {
    e.preventDefault();
    if (paso < PASOS.length - 1) return siguiente();
    if (!pasoValido.every(Boolean)) return setError("Revisa los pasos anteriores.");
    setEstado("cargando");
    setError("");
    try {
      const { usuario } = await api("auth?accion=registro", { metodo: "POST", datos });
      setEstado("hecho");
      // Los gustos se guardan en este navegador para recomendarte productos
      try { localStorage.setItem("kuyay-gustos", JSON.stringify(gustos)); } catch { /* modo privado */ }
      onIngreso(usuario, { nuevo: true, gustos });
    } catch (err) {
      setError(err.message);
      setEstado("listo");
      onError?.();
    }
  };

  return (
    <form onSubmit={enviar} noValidate className="acceso-form">
      <div className="registro-cabecera">
        <Avatar nombre={datos.nombre} />
        <div>
          <h2 className="acceso-titulo">{datos.nombre.trim() ? `¡Hola, ${datos.nombre.trim().split(/\s+/)[0]}!` : "Crea tu cuenta"}</h2>
          <p className="fg-2 mb-0">Guarda tus datos y sigue cada pedido hasta tu puerta.</p>
        </div>
      </div>

      {/* Stepper de Bootstrap 6 */}
      <ol className="stepper stepper-horizontal registro-pasos" aria-label="Pasos para crear tu cuenta">
        {PASOS.map((nombre, i) => (
          <li key={nombre} className={`stepper-item ${i <= paso ? "active" : ""} ${i < paso ? "completo" : ""}`} aria-current={i === paso ? "step" : undefined}>
            {i < paso ? <button type="button" className="btn-enlace" onClick={() => irA(i)}>{nombre}</button> : nombre}
          </li>
        ))}
      </ol>

      <h3 className="registro-paso-titulo" ref={titulo} tabIndex={-1}>
        Paso {paso + 1} de {PASOS.length}: {PASOS[paso]}
      </h3>
      {error && <div className="alert theme-danger acceso-error" role="alert">{error}</div>}

      <div className="registro-paso" key={paso}>
        {paso === 0 && (
          <>
            <Campo etiqueta="Nombre completo" {...vNombre}>
              {(a) => <input {...a} ref={enfocar} autoComplete="name" required value={datos.nombre}
                             onChange={(e) => cambiar("nombre")(e.target.value)} onBlur={tocar("nombre")} />}
            </Campo>
            <Campo etiqueta="Correo" {...vCorreo}
                   accion={disponible === false && (
                     <button type="button" className="btn-enlace campo-accion" onClick={() => onIrIngresar(datos.correo)}>Ingresar</button>
                   )}>
              {(a) => <input {...a} type="email" autoComplete="email" required value={datos.correo}
                             onChange={(e) => cambiar("correo")(e.target.value)} onBlur={tocar("correo")} />}
            </Campo>
          </>
        )}
        {paso === 1 && (
          <>
            <CampoClave etiqueta="Crea una contraseña" valor={datos.clave} onCambiar={cambiar("clave")} autoComplete="new-password"
                        estado={tocados.clave && !claveOk ? "error" : claveOk ? "ok" : "neutro"}
                        mensaje={tocados.clave && !claveOk ? "Mínimo 8 caracteres." : ""} />
            <ChecklistClave clave={datos.clave} />
          </>
        )}
        {paso === 2 && (
          <>
            <Campo etiqueta="Celular (opcional)" {...vTelefono}>
              {(a) => <input {...a} type="tel" inputMode="numeric" maxLength="9" autoComplete="tel-national" value={datos.telefono}
                             onChange={(e) => cambiar("telefono")(e.target.value.replace(/\D/g, ""))} />}
            </Campo>
            <fieldset className="gustos">
              <legend className="form-label">¿Qué se te antoja más? <span className="fg-3 fw-normal">(opcional)</span></legend>
              <div className="gustos-opciones">
                {GUSTOS.map((g) => {
                  const activo = gustos.includes(g.id);
                  return (
                    <button key={g.id} type="button" className={`chip gusto ${activo ? "active" : ""}`} aria-pressed={activo}
                            onClick={() => setGustos((l) => (activo ? l.filter((x) => x !== g.id) : [...l, g.id]))}>
                      <span aria-hidden="true">{g.icono}</span> {g.texto}
                    </button>
                  );
                })}
              </div>
            </fieldset>
          </>
        )}
      </div>

      <div className="progress registro-progreso" role="progressbar" aria-label="Avance del registro" aria-valuenow={paso + 1} aria-valuemin="1" aria-valuemax={PASOS.length}>
        <div className="progress-bar" style={{ width: `${((paso + 1) / PASOS.length) * 100}%` }} />
      </div>
      <div className="registro-botones">
        {paso > 0 && <button type="button" className="btn btn-outline theme-secondary btn-lg" onClick={() => irA(paso - 1)}><i className="bi bi-arrow-left" aria-hidden="true" /> Atrás</button>}
        {paso < PASOS.length - 1 ? (
          <button className="btn btn-solid theme-primary btn-lg acceso-enviar" type="submit">
            Siguiente <i className="bi bi-arrow-right" aria-hidden="true" />
          </button>
        ) : (
          <BotonEnviar estado={estado} texto="Crear cuenta" textoCargando="Creando tu cuenta…" textoHecho="¡Cuenta creada!" className="acceso-enviar" />
        )}
      </div>
      <p className="acceso-cambiar">¿Ya tienes cuenta? <button type="button" className="btn-enlace" onClick={() => onIrIngresar(datos.correo)}>Ingresa aquí</button></p>
    </form>
  );
}
