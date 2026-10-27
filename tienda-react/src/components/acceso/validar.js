// src/components/acceso/validar.js · reglas que se revisan mientras escribes
export const CORREO = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
export const CELULAR = /^9\d{8}$/;

// Devuelve { estado, mensaje } para el componente Campo
export const validarNombre = (v, tocado) =>
  !tocado && !v ? { estado: "neutro" }
  : v.trim().length >= 3 ? { estado: "ok", mensaje: "" }
  : { estado: "error", mensaje: "Escribe tu nombre (mínimo 3 letras)." };

export const validarCorreo = (v, tocado) =>
  !tocado && !v ? { estado: "neutro" }
  : CORREO.test(v.trim()) ? { estado: "ok", mensaje: "" }
  : { estado: "error", mensaje: v ? "Falta algo: debe verse como nombre@correo.com" : "Escribe tu correo." };

export const validarCelular = (v) =>
  !v ? { estado: "neutro", mensaje: "Opcional: así te avisamos de tu pedido." }
  : CELULAR.test(v) ? { estado: "ok", mensaje: "" }
  : { estado: "error", mensaje: `Debe tener 9 dígitos y empezar con 9 (${v.length}/9).` };
