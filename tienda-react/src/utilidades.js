// src/utilidades.js · funciones pequeñas que usan varios componentes
import { flushSync } from "react-dom";

export const soles = (monto) => `S/ ${monto.toFixed(2)}`;

// "Lúcuma" y "lucuma" se consideran iguales al buscar
export const sinTildes = (texto) => texto.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().trim();

export const NEGOCIO = {
  nombre: "Kuyay",
  whatsapp: "51987654321",
  direccion: "Av. Grau 312, Barranco, Lima",
};

export const MINIMO_DESCUENTO = 100; // S/ desde el que se aplica el descuento
export const PORCENTAJE_DESCUENTO = 10;

// Redondeo a céntimos: 184 * 0.9 da 165.60000000000002 en JavaScript
export const redondear = (n) => Math.round(n * 100) / 100;

export const prefiereQuieto = () => matchMedia("(prefers-reduced-motion: reduce)").matches;

// Cambia el estado dentro de una View Transition del navegador: las tarjetas se
// deslizan a su nueva posición. flushSync hace que React pinte dentro de la transición.
// "tipo" activa las reglas CSS html:active-view-transition-type(...) de la tienda.
export function conTransicion(tipo, cambiar) {
  if (!document.startViewTransition || prefiereQuieto()) return cambiar();
  const actualizar = () => flushSync(cambiar);
  try {
    document.startViewTransition({ update: actualizar, types: [tipo] });
  } catch {
    document.startViewTransition(actualizar); // navegadores sin tipos de transición
  }
}
