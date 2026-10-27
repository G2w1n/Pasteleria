// src/components/acceso/Registro.jsx · cara de la tarjeta para crear cuenta
import { useEffect, useState } from "react";
import Campo from "./Campo.jsx";
import CampoClave from "./CampoClave.jsx";
import ChecklistClave from "./ChecklistClave.jsx";
import { CELULAR, CORREO, validarCelular, validarCorreo, validarNombre } from "./validar.js";

export default function Registro({ api, correoInicial = "", onIngreso, onIrIngresar, enfocar }) {
  const [datos, setDatos] = useState({ nombre: "", correo: correoInicial, telefono: "", clave: "" });
  const [tocados, setTocados] = useState({});
  const [disponible, setDisponible] = useState(null); // null = sin revisar · "revisando" · true · false
  const [error, setError] = useState("");
  const [enviando, setEnviando] = useState(false);
  const cambiar = (campo) => (valor) => setDatos((d) => ({ ...d, [campo]: valor }));
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
  if (vCorreo.estado === "ok" || CORREO.test(datos.correo.trim())) {
    vCorreo = disponible === "revisando" ? { estado: "cargando", mensaje: "Revisando…" }
      : disponible === false ? { estado: "error", mensaje: "Este correo ya tiene una cuenta." }
      : disponible === true ? { estado: "ok", mensaje: "¡Perfecto, está disponible!" }
      : vCorreo;
  }
  const vTelefono = validarCelular(datos.telefono);
  const claveOk = datos.clave.length >= 8;
  const listo = vNombre.estado === "ok" && CORREO.test(datos.correo.trim()) && disponible !== false
    && (!datos.telefono || CELULAR.test(datos.telefono)) && claveOk;

  const enviar = async (e) => {
    e.preventDefault();
    setTocados({ nombre: true, correo: true, clave: true });
    if (!listo) return setError("Revisa los campos marcados en rojo.");
    setEnviando(true);
    setError("");
    try {
      const { usuario } = await api("auth?accion=registro", { metodo: "POST", datos });
      onIngreso(usuario, { nuevo: true });
    } catch (err) {
      setError(err.message);
      setEnviando(false);
    }
  };

  return (
    <form onSubmit={enviar} noValidate className="acceso-form">
      <h2 className="acceso-titulo">Crea tu cuenta <span aria-hidden="true">🧁</span></h2>
      <p className="fg-2 mb-4">Guarda tus datos y sigue cada pedido hasta tu puerta.</p>
      {error && <div className="alert theme-danger acceso-error" role="alert">{error}</div>}
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
      <Campo etiqueta="Celular (opcional)" {...vTelefono}>
        {(a) => <input {...a} type="tel" inputMode="numeric" maxLength="9" autoComplete="tel-national" value={datos.telefono}
                       onChange={(e) => cambiar("telefono")(e.target.value.replace(/\D/g, ""))} />}
      </Campo>
      <CampoClave etiqueta="Contraseña" valor={datos.clave} onCambiar={cambiar("clave")} autoComplete="new-password"
                  estado={tocados.clave && !claveOk ? "error" : claveOk ? "ok" : "neutro"}
                  mensaje={tocados.clave && !claveOk ? "Mínimo 8 caracteres." : ""} />
      <ChecklistClave clave={datos.clave} />
      <button className="btn btn-solid theme-primary btn-lg w-100 acceso-enviar" type="submit" disabled={enviando}>
        {enviando ? <><span className="spinner-border spinner-sm" aria-hidden="true" /> Creando tu cuenta…</> : "Crear cuenta"}
      </button>
      <p className="acceso-cambiar">¿Ya tienes cuenta? <button type="button" className="btn-enlace" onClick={() => onIrIngresar(datos.correo)}>Ingresa aquí</button></p>
    </form>
  );
}
