// src/components/acceso/CampoClave.jsx
// Contraseña con botón "ver" animado y aviso de Bloq Mayús activado.
import { useState } from "react";
import Campo from "./Campo.jsx";

export default function CampoClave({ etiqueta, valor, onCambiar, estado, mensaje, autoComplete, onFoco, onVer }) {
  const [visible, setVisible] = useState(false);
  const [mayusculas, setMayusculas] = useState(false);
  // getModifierState dice si Bloq Mayús está activo en cada tecla
  const revisarMayus = (e) => setMayusculas(e.getModifierState?.("CapsLock") ?? false);
  const alternar = () => {
    setVisible((v) => !v);
    onVer?.(!visible);
  };

  return (
    <>
      <Campo etiqueta={etiqueta} estado={estado} mensaje={mensaje}
             accion={
               <button type="button" className={`ver-clave ${visible ? "visible" : ""}`} onClick={alternar}
                       aria-pressed={visible} aria-label={visible ? "Ocultar contraseña" : "Mostrar contraseña"}>
                 <i className={`bi ${visible ? "bi-eye-slash" : "bi-eye"}`} aria-hidden="true" />
               </button>
             }>
        {(atributos) => (
          <input {...atributos} type={visible ? "text" : "password"} autoComplete={autoComplete} required value={valor}
                 onChange={(e) => onCambiar(e.target.value)} onKeyDown={revisarMayus} onKeyUp={revisarMayus}
                 onFocus={() => onFoco?.(true)} onBlur={() => { setMayusculas(false); onFoco?.(false); }} />
        )}
      </Campo>
      {mayusculas && (
        <p className="aviso-mayus" role="status"><i className="bi bi-capslock-fill" aria-hidden="true" /> Bloq Mayús está activado</p>
      )}
    </>
  );
}
