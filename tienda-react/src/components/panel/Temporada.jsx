// src/components/panel/Temporada.jsx · interruptor del Modo Navidad (solo administrador)
// Se guarda en Neon (tabla configuracion) y la tienda lo lee de /api/productos.
import { useEffect, useState } from "react";

export default function Temporada({ api }) {
  const [navidad, setNavidad] = useState(null);
  const [guardando, setGuardando] = useState(false);
  const [mensaje, setMensaje] = useState("");

  useEffect(() => {
    api("admin?recurso=temporada").then((d) => setNavidad(d.navidad)).catch((e) => setMensaje(e.message));
  }, [api]);

  const cambiar = async (activo) => {
    setGuardando(true);
    setMensaje("");
    try {
      const d = await api("admin?recurso=temporada", { metodo: "POST", datos: { id: "navidad", activo } });
      setNavidad(d.navidad);
      setMensaje(d.navidad ? "Modo Navidad activado. La tienda lo mostrará en menos de un minuto." : "Modo Navidad desactivado.");
    } catch (e) {
      setMensaje(e.message);
    } finally {
      setGuardando(false);
    }
  };

  return (
    <div className={`card temporada ${navidad ? "temporada-activa" : ""}`}>
      <div className="card-body">
        <span className="temporada-icono" aria-hidden="true">🎄</span>
        <div className="temporada-texto">
          <p className="fw-semibold mb-0"><label htmlFor="modoNavidad">Modo Navidad</label></p>
          <p className="fs-sm fg-2 mb-0" id="modoNavidadAyuda">Nieve suave, cinta navideña y el panetón destacado en toda la tienda. Actívalo y desactívalo cuando quieras.</p>
          <p className="fs-sm mb-0 mt-1" role="status">{mensaje}</p>
        </div>
        <div className="switch">
          <input type="checkbox" role="switch" id="modoNavidad" aria-describedby="modoNavidadAyuda"
                 checked={navidad === true} disabled={navidad === null || guardando} onChange={(e) => cambiar(e.target.checked)} />
        </div>
      </div>
    </div>
  );
}
