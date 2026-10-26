// =========================================================
// Utilidades para responder a la página.
// =========================================================
import { ErrorApi } from "./db.js";

export function responder(res, estado, datos) {
  res.statusCode = estado;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.setHeader("Cache-Control", "no-store");
  res.end(JSON.stringify(datos));
}

// Lee el cuerpo JSON de la petición (Vercel ya lo trae en req.body;
// el servidor de pruebas local lo deja como texto)
export async function leerCuerpo(req) {
  if (req.body && typeof req.body === "object") return req.body;
  if (typeof req.body === "string") return req.body ? JSON.parse(req.body) : {};
  let texto = "";
  for await (const parte of req) texto += parte;
  try {
    return texto ? JSON.parse(texto) : {};
  } catch {
    throw new ErrorApi(400, "El cuerpo de la petición no es JSON válido.");
  }
}

// Envuelve cada ruta: métodos permitidos y errores en un formato común.
// Los errores de la base de datos se traducen a mensajes entendibles.
export function ruta(manejadores) {
  return async (req, res) => {
    const manejar = manejadores[req.method];
    if (!manejar) {
      res.setHeader("Allow", Object.keys(manejadores).join(", "));
      return responder(res, 405, { error: "Método no permitido." });
    }
    try {
      await manejar(req, res);
    } catch (error) {
      if (error instanceof ErrorApi) return responder(res, error.estado, { error: error.message });
      const traducido = traducirErrorBd(error);
      if (traducido) return responder(res, traducido.estado, { error: traducido.mensaje });
      console.error(error);
      responder(res, 500, { error: "Ocurrió un error en el servidor. Intenta de nuevo." });
    }
  };
}

// Mensajes para las reglas que valida la base de datos (01-esquema.sql)
function traducirErrorBd(error) {
  const texto = `${error?.message ?? ""} ${error?.constraint ?? ""}`;
  if (texto.includes("productos_stock_check")) return { estado: 409, mensaje: "Uno de los productos ya no tiene stock suficiente. Revisa tu carrito." };
  if (texto.includes("usuarios_correo_unico")) return { estado: 409, mensaje: "Ya existe una cuenta con ese correo." };
  if (texto.includes("telefono_check")) return { estado: 400, mensaje: "El celular debe tener 9 dígitos y empezar con 9." };
  if (texto.includes("delivery_con_direccion")) return { estado: 400, mensaje: "Para delivery necesitamos el distrito y la dirección." };
  if (texto.includes("especiales_domingo_manana")) return { estado: 400, mensaje: "Los domingos solo entregamos en la mañana." };
  return null;
}
