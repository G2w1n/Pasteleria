// src/components/acceso/NuevaClave.jsx · se abre desde el enlace del correo (?restablecer=...)
import { useState } from "react";
import CampoClave from "./CampoClave.jsx";
import ChecklistClave from "./ChecklistClave.jsx";
import BotonEnviar from "./BotonEnviar.jsx";

export default function NuevaClave({ api, token, onIngreso, onError, onPedirOtro }) {
  const [clave, setClave] = useState("");
  const [estado, setEstado] = useState("listo");
  const [error, setError] = useState("");
  const [vencido, setVencido] = useState(false);

  const guardar = async (e) => {
    e.preventDefault();
    if (clave.length < 8) return setError("La contraseña necesita al menos 8 caracteres.");
    setEstado("cargando");
    setError("");
    try {
      const { usuario } = await api("auth?accion=restablecer", { metodo: "POST", datos: { token, clave } });
      setEstado("hecho");
      onIngreso(usuario, { nuevo: false });
    } catch (err) {
      setEstado("listo");
      setError(err.message);
      setVencido(err.estado === 400 && /venció|usó/.test(err.message));
      onError?.();
    }
  };

  return (
    <form onSubmit={guardar} noValidate className="acceso-form">
      <h2 className="acceso-titulo">Crea tu nueva contraseña <span aria-hidden="true">✨</span></h2>
      <p className="fg-2 mb-4">Elige una contraseña segura; con ella entrarás a tu cuenta.</p>
      {error && (
        <div className="alert theme-danger acceso-error" role="alert">
          {error} {vencido && <button type="button" className="btn-enlace" onClick={onPedirOtro}>Pedir otro enlace</button>}
        </div>
      )}
      <CampoClave etiqueta="Nueva contraseña" valor={clave} onCambiar={(v) => { setClave(v); setError(""); }} autoComplete="new-password"
                  estado={clave.length >= 8 ? "ok" : "neutro"} />
      <ChecklistClave clave={clave} />
      <BotonEnviar estado={estado} texto="Guardar y entrar" textoCargando="Guardando…" textoHecho="¡Contraseña nueva lista!" className="w-100 acceso-enviar" />
    </form>
  );
}
