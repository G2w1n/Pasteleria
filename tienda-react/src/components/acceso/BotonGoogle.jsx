// src/components/acceso/BotonGoogle.jsx
// "Continuar con Google" con el botón oficial de Google (Google Identity Services).
// Solo aparece si en Vercel está la variable GOOGLE_CLIENT_ID.
import { useEffect, useRef, useState } from "react";

let cargaScript = null;
const cargarGoogle = () =>
  (cargaScript ??= new Promise((resolver, rechazar) => {
    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.onload = resolver;
    script.onerror = rechazar;
    document.head.append(script);
  }));

export default function BotonGoogle({ clienteId, api, onIngreso, onError }) {
  const contenedor = useRef(null);
  const [mensaje, setMensaje] = useState("");
  // Las funciones del padre cambian en cada render: se guardan en una ref para no rearmar el botón
  const avisos = useRef({ onIngreso, onError });
  avisos.current = { onIngreso, onError };

  useEffect(() => {
    if (!clienteId) return;
    let vigente = true;
    cargarGoogle()
      .then(() => {
        if (!vigente || !window.google) return;
        window.google.accounts.id.initialize({
          client_id: clienteId,
          // Google nos da un token firmado; la API lo verifica y crea la sesión
          callback: async ({ credential }) => {
            setMensaje("Entrando con Google…");
            try {
              const { usuario, nuevo } = await api("auth?accion=google", { metodo: "POST", datos: { credential } });
              avisos.current.onIngreso(usuario, { nuevo, gustos: [] });
            } catch (err) {
              setMensaje(err.message);
              avisos.current.onError?.();
            }
          },
        });
        window.google.accounts.id.renderButton(contenedor.current, {
          theme: document.documentElement.dataset.bsTheme === "dark" ? "filled_black" : "outline",
          size: "large", shape: "pill", text: "continue_with", locale: "es", width: contenedor.current.offsetWidth || 320,
        });
      })
      .catch(() => vigente && setMensaje("No se pudo cargar el botón de Google."));
    return () => {
      vigente = false;
    };
  }, [clienteId, api]);

  if (!clienteId) return null;
  return (
    <div className="acceso-google">
      <p className="acceso-separador"><span>o</span></p>
      <div ref={contenedor} className="google-boton" />
      {mensaje && <p className="fs-sm text-center mt-2 mb-0" role="status">{mensaje}</p>}
    </div>
  );
}
