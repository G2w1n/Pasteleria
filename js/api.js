// =========================================================
// Conexión de la página con la API (carpeta /api en Vercel).
// Si la API no está disponible (Live Server, GitHub Pages o un
// corte), la tienda sigue funcionando con los datos locales de
// js/productos.js y los pedidos por WhatsApp.
// =========================================================
import { CATEGORIAS, productos } from "./productos.js";

let disponible = false;
let sesion; // undefined = aún no se consultó; null = sin sesión
let costosDelivery = {};

export const apiDisponible = () => disponible;
export const costoDeliveryDe = (distrito) => costosDelivery[distrito];
export const distritosConDelivery = () => Object.keys(costosDelivery).sort((a, b) => a.localeCompare(b, "es"));

// Petición a la API. Lanza un Error con el mensaje del servidor si algo falla.
export async function api(ruta, { metodo = "GET", datos, espera = 8000 } = {}) {
  let respuesta;
  try {
    respuesta = await fetch(`/api/${ruta}`, {
      method: metodo,
      headers: datos ? { "Content-Type": "application/json" } : {},
      body: datos ? JSON.stringify(datos) : undefined,
      credentials: "same-origin",
      signal: AbortSignal.timeout(espera),
    });
  } catch {
    throw new Error("No pudimos conectar con la tienda. Revisa tu internet e intenta de nuevo.");
  }
  const cuerpo = await respuesta.json().catch(() => ({}));
  if (!respuesta.ok) {
    const error = new Error(cuerpo.error ?? "Ocurrió un error. Intenta de nuevo.");
    error.estado = respuesta.status;
    throw error;
  }
  return cuerpo;
}

// Reemplaza el catálogo local por el de la base de datos (Neon).
// Se modifica el MISMO arreglo que importan los demás módulos, así
// el catálogo, el carrito y el detalle usan los datos nuevos sin cambios.
export async function cargarCatalogo() {
  // GitHub Pages solo sirve archivos: ni siquiera intentamos llamar a la API
  if (location.hostname.endsWith("github.io") || location.protocol === "file:") return false;
  try {
    const datos = await api("productos", { espera: 4000 });
    if (!Array.isArray(datos.productos) || datos.productos.length === 0) return false;
    CATEGORIAS.splice(0, CATEGORIAS.length, ...datos.categorias);
    productos.splice(0, productos.length, ...datos.productos);
    costosDelivery = datos.delivery ?? {};
    disponible = true;
  } catch {
    disponible = false; // seguimos con js/productos.js
  }
  document.documentElement.classList.toggle("con-api", disponible);
  return disponible;
}

// Usuario de la sesión (se consulta una sola vez por página)
export async function obtenerSesion({ recargar = false } = {}) {
  if (!disponible) return null;
  if (sesion === undefined || recargar) {
    try {
      sesion = (await api("auth", { espera: 4000 })).usuario;
    } catch {
      sesion = null;
    }
  }
  return sesion;
}

export function olvidarSesion() {
  sesion = null;
}
