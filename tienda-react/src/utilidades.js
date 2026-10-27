// src/utilidades.js · funciones pequeñas que usan varios componentes

export const soles = (monto) => `S/ ${monto.toFixed(2)}`;

// "Lúcuma" y "lucuma" se consideran iguales al buscar
export const sinTildes = (texto) => texto.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();

export const NEGOCIO = {
  nombre: "Kuyay",
  whatsapp: "51987654321",
  direccion: "Av. Grau 312, Barranco, Lima",
};

export const MINIMO_DESCUENTO = 100; // S/ desde el que se aplica el descuento
export const PORCENTAJE_DESCUENTO = 10;

// Redondeo a céntimos: 184 * 0.9 da 165.60000000000002 en JavaScript
export const redondear = (n) => Math.round(n * 100) / 100;

// Enlaces a la tienda principal, que está una carpeta más arriba ("../").
// Con "npm run dev" la raíz es la app React, así que apuntamos a la página publicada.
export const sitio = (ruta) => (import.meta.env.DEV ? "https://pasteleria-three-steel.vercel.app" : "..") + ruta;
