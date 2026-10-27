// src/components/acceso/Ingresar.jsx · cara de la tarjeta para iniciar sesión
import { useState } from "react";
import Campo from "./Campo.jsx";
import CampoClave from "./CampoClave.jsx";
import { validarCorreo } from "./validar.js";

export default function Ingresar({ api, correoInicial = "", onIngreso, onIrRegistro, enfocar }) {
  const [correo, setCorreo] = useState(correoInicial);
  const [clave, setClave] = useState("");
  const [tocado, setTocado] = useState(false);
  const [error, setError] = useState("");
  const [enviando, setEnviando] = useState(false);
  const vCorreo = validarCorreo(correo, tocado);

  const enviar = async (e) => {
    e.preventDefault();
    setTocado(true);
    if (!correo || !clave) return setError("Escribe tu correo y tu contraseña.");
    if (validarCorreo(correo, true).estado !== "ok") return setError("Revisa el formato del correo.");
    setEnviando(true);
    setError("");
    try {
      const { usuario } = await api("auth?accion=login", { metodo: "POST", datos: { correo, clave } });
      onIngreso(usuario, { nuevo: false });
    } catch (err) {
      setError(err.message);
      setEnviando(false);
    }
  };

  return (
    <form onSubmit={enviar} noValidate className="acceso-form">
      <h2 className="acceso-titulo">¡Hola de nuevo! <span aria-hidden="true">👋</span></h2>
      <p className="fg-2 mb-4">Ingresa para ver tus pedidos y comprar más rápido.</p>
      {error && <div className="alert theme-danger acceso-error" role="alert">{error}</div>}
      <Campo etiqueta="Correo" {...vCorreo}>
        {(a) => <input {...a} ref={enfocar} type="email" autoComplete="email" required value={correo}
                       onChange={(e) => setCorreo(e.target.value)} onBlur={(e) => e.target.value && setTocado(true)} />}
      </Campo>
      <CampoClave etiqueta="Contraseña" valor={clave} onCambiar={setClave} autoComplete="current-password" />
      <button className="btn btn-solid theme-primary btn-lg w-100 acceso-enviar" type="submit" disabled={enviando}>
        {enviando ? <><span className="spinner-border spinner-sm" aria-hidden="true" /> Ingresando…</> : "Ingresar"}
      </button>
      <p className="acceso-cambiar">¿Primera vez en Kuyay? <button type="button" className="btn-enlace" onClick={() => onIrRegistro(correo)}>Crea tu cuenta</button></p>
    </form>
  );
}
