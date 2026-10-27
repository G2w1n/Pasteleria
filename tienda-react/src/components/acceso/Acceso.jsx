// src/components/acceso/Acceso.jsx
// Tarjeta que GIRA en 3D entre "Ingresar" y "Crear cuenta".
// La cara que no se ve queda "inert": no se puede enfocar ni la leen los lectores de pantalla.
import { useEffect, useRef, useState } from "react";
import Ingresar from "./Ingresar.jsx";
import Registro from "./Registro.jsx";

export default function Acceso({ api, onIngreso, inicio = "ingresar" }) {
  const [cara, setCara] = useState(inicio);
  const [correo, setCorreo] = useState("");
  const primerCampo = { ingresar: useRef(null), registro: useRef(null) };
  const yaGiro = useRef(false);

  const girar = (destino) => (correoActual = "") => {
    setCorreo(correoActual);
    setCara(destino);
    yaGiro.current = true;
  };

  // Al girar, el foco pasa al primer campo de la cara nueva
  useEffect(() => {
    if (yaGiro.current) setTimeout(() => primerCampo[cara].current?.focus(), 350);
  }, [cara]);

  return (
    <div className={`acceso-escena ${cara === "registro" ? "girada" : ""}`}>
      <div className="acceso-tarjeta">
        <section className="card acceso-cara acceso-frente" inert={cara !== "ingresar"} aria-hidden={cara !== "ingresar"}>
          <div className="card-body">
            <Ingresar key={`i-${correo}`} api={api} correoInicial={correo} onIngreso={onIngreso}
                      onIrRegistro={girar("registro")} enfocar={primerCampo.ingresar} />
          </div>
        </section>
        <section className="card acceso-cara acceso-dorso" inert={cara !== "registro"} aria-hidden={cara !== "registro"}>
          <div className="card-body">
            <Registro key={`r-${correo}`} api={api} correoInicial={correo} onIngreso={onIngreso}
                      onIrIngresar={girar("ingresar")} enfocar={primerCampo.registro} />
          </div>
        </section>
      </div>
    </div>
  );
}
