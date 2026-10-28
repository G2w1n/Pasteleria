// src/components/acceso/Recuperar.jsx · "¿Olvidaste tu contraseña?": pide el enlace por correo
import { useState } from "react";
import Campo from "./Campo.jsx";
import BotonEnviar from "./BotonEnviar.jsx";
import { validarCorreo } from "./validar.js";
import { NEGOCIO } from "../../utilidades.js";

export default function Recuperar({ api, correoInicial = "", onVolver, enfocar }) {
  const [correo, setCorreo] = useState(correoInicial);
  const [estado, setEstado] = useState("listo");
  const [error, setError] = useState({ texto: "", sinCorreo: false });
  const [enviado, setEnviado] = useState("");
  const vCorreo = validarCorreo(correo, Boolean(correo));

  const enviar = async (e) => {
    e.preventDefault();
    if (vCorreo.estado !== "ok") return setError({ texto: "Escribe el correo de tu cuenta." });
    setEstado("cargando");
    setError({ texto: "" });
    try {
      const r = await api("auth?accion=recuperar", { metodo: "POST", datos: { correo } });
      setEstado("hecho");
      setEnviado(r.mensaje);
    } catch (err) {
      setEstado("listo");
      setError({ texto: err.message, sinCorreo: err.estado === 503 });
    }
  };

  if (enviado) {
    return (
      <div className="acceso-form recuperar-enviado" role="status">
        <p className="recuperar-sobre" aria-hidden="true">📬</p>
        <h2 className="acceso-titulo text-center">Revisa tu correo</h2>
        <p className="fg-2 text-center">{enviado}</p>
        <p className="fg-3 fs-sm text-center">El enlace vence en 30 minutos.</p>
        <button type="button" className="btn btn-outline theme-primary btn-lg w-100" onClick={onVolver}>Volver a ingresar</button>
      </div>
    );
  }

  return (
    <form onSubmit={enviar} noValidate className="acceso-form">
      <h2 className="acceso-titulo">¿Olvidaste tu contraseña? <span aria-hidden="true">🔑</span></h2>
      <p className="fg-2 mb-4">Escribe tu correo y te enviamos un enlace para crear una nueva.</p>
      {error.texto && (
        <div className="alert theme-danger acceso-error" role="alert">
          {error.texto}
          {error.sinCorreo && (
            <> <a href={`https://wa.me/${NEGOCIO.whatsapp}?text=${encodeURIComponent(`Hola, necesito recuperar mi cuenta (${correo})`)}`} target="_blank" rel="noopener noreferrer">Abrir WhatsApp</a></>
          )}
        </div>
      )}
      <Campo etiqueta="Correo de tu cuenta" {...vCorreo}>
        {(a) => <input {...a} ref={enfocar} type="email" autoComplete="email" required value={correo} onChange={(e) => setCorreo(e.target.value)} />}
      </Campo>
      <BotonEnviar estado={estado} texto="Enviar enlace" textoCargando="Enviando…" textoHecho="¡Enviado!" className="w-100 acceso-enviar" />
      <p className="acceso-cambiar"><button type="button" className="btn-enlace" onClick={onVolver}><i className="bi bi-arrow-left" aria-hidden="true" /> Volver a ingresar</button></p>
    </form>
  );
}
