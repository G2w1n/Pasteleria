// src/components/acceso/Acceso.jsx
// Tarjeta que GIRA en 3D entre "Ingresar" y "Crear cuenta", con el cupcake que acompaña.
// La cara que no se ve queda "inert": no se puede enfocar ni la leen los lectores de pantalla.
import { useEffect, useRef, useState } from "react";
import Ingresar from "./Ingresar.jsx";
import Registro from "./Registro.jsx";
import Mascota from "./Mascota.jsx";
import Bienvenida from "./Bienvenida.jsx";
import BotonGoogle from "./BotonGoogle.jsx";
import Recuperar from "./Recuperar.jsx";
import NuevaClave from "./NuevaClave.jsx";
import { prefiereQuieto } from "../../utilidades.js";

export default function Acceso({ api, onIngreso, onBienvenida, productos = [], inicio = "ingresar", tokenRestablecer = "" }) {
  const [cara, setCara] = useState(inicio);
  const [correo, setCorreo] = useState("");
  const [mascota, setMascota] = useState({ modo: "mirar", mirada: 0.5 });
  const primerCampo = { ingresar: useRef(null), registro: useRef(null) };
  const [bienvenida, setBienvenida] = useState(null); // { usuario, gustos } al crear la cuenta
  const [google, setGoogle] = useState(null); // ID de cliente de Google (si está configurado en Vercel)
  const [nivelRegistro, setNivelRegistro] = useState(1); // el cupcake se arma mientras completas el registro
  // Cara de adelante: ingresar · recuperar (olvidé mi contraseña) · restablecer (enlace del correo)
  const [frente, setFrente] = useState(tokenRestablecer ? "restablecer" : "ingresar");
  const yaGiro = useRef(false);
  const inclinacion = useRef(null);
  const reloj = useRef(null);

  useEffect(() => {
    api("auth").then((r) => setGoogle(r.google ?? null)).catch(() => {});
  }, [api]);

  const girar = (destino) => (correoActual = "") => {
    setCorreo(correoActual);
    setFrente("ingresar");
    setNivelRegistro(1);
    setCara(destino);
    yaGiro.current = true;
  };

  // Al girar (o cambiar de pantalla), el foco pasa al primer campo de la cara nueva
  useEffect(() => {
    if (yaGiro.current) setTimeout(() => primerCampo[cara].current?.focus(), 350);
  }, [cara]);
  useEffect(() => {
    if (frente === "recuperar") setTimeout(() => primerCampo.ingresar.current?.focus(), 50);
  }, [frente]);

  // ---- El cupcake reacciona a lo que pasa en el formulario (delegación de eventos) ----
  const esClave = (el) => el.matches?.("input[autocomplete$=password]");
  const alEnfocar = (e) => {
    if (esClave(e.target)) setMascota({ modo: e.target.type === "text" ? "espiar" : "tapar", mirada: 0.5 });
    else if (e.target.matches?.("input")) setMascota({ modo: "mirar", mirada: Math.min(e.target.value.length / 28, 1) });
  };
  const alEscribir = (e) => {
    if (!esClave(e.target) && e.target.matches?.("input")) setMascota({ modo: "mirar", mirada: Math.min(e.target.value.length / 28, 1) });
  };
  const alSalir = (e) => {
    if (!e.currentTarget.contains(e.relatedTarget)) setMascota({ modo: "mirar", mirada: 0.5 });
  };
  // "Ver contraseña" cambia el tipo del campo: espía con un ojo
  const alVerClave = (visible) => setMascota((m) => (m.modo === "tapar" || m.modo === "espiar" ? { ...m, modo: visible ? "espiar" : "tapar" } : m));
  const ponerTriste = () => {
    setMascota({ modo: "triste", mirada: 0.5 });
    clearTimeout(reloj.current);
    reloj.current = setTimeout(() => setMascota({ modo: "mirar", mirada: 0.5 }), 1800);
  };
  // Al entrar, salta de alegría; si la cuenta es nueva, primero va la bienvenida
  const entrar = (usuario, extra = {}) => {
    setMascota({ modo: "feliz", mirada: 0.5 });
    setTimeout(() => {
      if (extra.nuevo) {
        setBienvenida({ usuario, gustos: extra.gustos ?? [] });
        onBienvenida?.(usuario);
      } else onIngreso(usuario, extra);
    }, prefiereQuieto() ? 0 : 700);
  };

  // La tarjeta se inclina un poco hacia el mouse (solo con mouse y sin "movimiento reducido").
  // Se cambian variables CSS directamente: no hace falta volver a dibujar con React.
  const inclinar = (e) => {
    if (e.pointerType !== "mouse" || prefiereQuieto()) return;
    const caja = inclinacion.current.getBoundingClientRect();
    const x = (e.clientX - caja.left) / caja.width - 0.5;
    const y = (e.clientY - caja.top) / caja.height - 0.5;
    inclinacion.current.style.setProperty("--incl-x", `${(-y * 7).toFixed(2)}deg`);
    inclinacion.current.style.setProperty("--incl-y", `${(x * 7).toFixed(2)}deg`);
    inclinacion.current.style.setProperty("--brillo-x", `${(x + 0.5) * 100}%`);
    inclinacion.current.style.setProperty("--brillo-y", `${(y + 0.5) * 100}%`);
  };
  const enderezar = () => {
    for (const v of ["--incl-x", "--incl-y"]) inclinacion.current?.style.setProperty(v, "0deg");
  };

  if (bienvenida) {
    return (
      <div className="acceso-escena">
        <Mascota modo="feliz" nivel={4} />
        <Bienvenida {...bienvenida} productos={productos} api={api} onContinuar={() => onIngreso(bienvenida.usuario, { nuevo: true })} />
      </div>
    );
  }

  return (
    <div className={`acceso-escena ${cara === "registro" ? "girada" : ""}`}
         onFocus={alEnfocar} onInput={alEscribir} onBlur={alSalir}
         onClick={(e) => e.target.closest(".ver-clave") && alVerClave(e.target.closest(".ver-clave").getAttribute("aria-pressed") !== "true")}>
      <Mascota {...mascota} nivel={cara === "registro" ? nivelRegistro : 3} />
      <div className="acceso-inclinacion" ref={inclinacion} onPointerMove={inclinar} onPointerLeave={enderezar}>
      <div className="acceso-tarjeta">
        <section className="card acceso-cara acceso-frente" inert={cara !== "ingresar"} aria-hidden={cara !== "ingresar"}>
          <div className="card-body">
            {frente === "ingresar" && (
              <>
                <Ingresar key={`i-${correo}`} api={api} correoInicial={correo} onIngreso={entrar} onError={ponerTriste}
                          onIrRegistro={girar("registro")} onOlvido={(c) => { setCorreo(c); setFrente("recuperar"); }} enfocar={primerCampo.ingresar} />
                <BotonGoogle clienteId={google} api={api} onIngreso={entrar} onError={ponerTriste} />
              </>
            )}
            {frente === "recuperar" && (
              <Recuperar api={api} correoInicial={correo} onVolver={() => setFrente("ingresar")} enfocar={primerCampo.ingresar} />
            )}
            {frente === "restablecer" && (
              <NuevaClave api={api} token={tokenRestablecer} onIngreso={entrar} onError={ponerTriste} onPedirOtro={() => setFrente("recuperar")} />
            )}
          </div>
        </section>
        <section className="card acceso-cara acceso-dorso" inert={cara !== "registro"} aria-hidden={cara !== "registro"}>
          <div className="card-body">
            <Registro key={`r-${correo}`} api={api} correoInicial={correo} onIngreso={entrar} onError={ponerTriste}
                      onIrIngresar={girar("ingresar")} onPaso={() => setMascota({ modo: "mirar", mirada: 0.5 })} onNivel={setNivelRegistro} enfocar={primerCampo.registro} />
            <BotonGoogle clienteId={google} api={api} onIngreso={entrar} onError={ponerTriste} />
          </div>
        </section>
      </div>
      </div>
    </div>
  );
}
