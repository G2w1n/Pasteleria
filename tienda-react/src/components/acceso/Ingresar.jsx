// src/components/acceso/Ingresar.jsx · cara de la tarjeta para iniciar sesión
import { useState } from "react";
import Campo from "./Campo.jsx";
import CampoClave from "./CampoClave.jsx";
import { validarCorreo } from "./validar.js";
import BotonEnviar from "./BotonEnviar.jsx";

export default function Ingresar({ api, correoInicial = "", onIngreso, onIrRegistro, onOlvido, onError, enfocar }) {
  const [correo, setCorreo] = useState(correoInicial);
  const [clave, setClave] = useState("");
  const [tocado, setTocado] = useState(false);
  const [error, setError] = useState("");
  const [estado, setEstado] = useState("listo"); // listo · cargando · hecho
  const vCorreo = validarCorreo(correo, tocado);

  const enviar = async (e) => {
    e.preventDefault();
    setTocado(true);
    if (!correo || !clave) return setError("Escribe tu correo y tu contraseña.");
    if (validarCorreo(correo, true).estado !== "ok") return setError("Revisa el formato del correo.");
    setEstado("cargando");
    setError("");
    try {
      const { usuario } = await api("auth?accion=login", { metodo: "POST", datos: { correo, clave } });
      setEstado("hecho");
      onIngreso(usuario, { nuevo: false });
    } catch (err) {
      setError(err.message);
      setEstado("listo");
      onError?.();
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
      <p className="olvido"><button type="button" className="btn-enlace" onClick={() => onOlvido(correo)}>¿Olvidaste tu contraseña?</button></p>
      <BotonEnviar estado={estado} texto="Ingresar" textoCargando="Ingresando…" textoHecho="¡Qué gusto verte!" className="w-100 acceso-enviar" />
      <p className="acceso-cambiar">¿Primera vez en Kuyay? <button type="button" className="btn-enlace" onClick={() => onIrRegistro(correo)}>Crea tu cuenta</button></p>
    </form>
  );
}
