// =========================================================
// POST /api/pedidos-especiales → guarda una torta personalizada.
// El precio se recalcula aquí con las mismas opciones que la página
// (js/opciones-torta.js): no se acepta el precio que mande el navegador.
// =========================================================
import { ErrorApi, obtenerSql } from "./_lib/db.js";
import { leerCuerpo, responder, ruta } from "./_lib/http.js";
import { usuarioActual } from "./_lib/sesion.js";
import { precioTorta } from "../js/opciones-torta.js";

const CELULAR = /^9\d{8}$/;
const ISO = /^\d{4}-\d{2}-\d{2}$/;

// Fecha de hoy en Lima, más n días, como "AAAA-MM-DD"
function diaEnLima(dias = 0) {
  const hoy = new Intl.DateTimeFormat("en-CA", { timeZone: "America/Lima" }).format(new Date());
  const fecha = new Date(`${hoy}T12:00:00Z`);
  fecha.setUTCDate(fecha.getUTCDate() + dias);
  return fecha.toISOString().slice(0, 10);
}

export default ruta({
  async POST(req, res) {
    const d = await leerCuerpo(req);
    const usuario = await usuarioActual(req);

    if ((d.nombre ?? "").trim().length < 3) throw new ErrorApi(400, "Escribe tu nombre (mínimo 3 letras).");
    if (!CELULAR.test(d.telefono ?? "")) throw new ErrorApi(400, "El celular debe tener 9 dígitos y empezar con 9.");
    if (!ISO.test(d.fecha ?? "")) throw new ErrorApi(400, "Elige la fecha de entrega.");
    if (d.fecha < diaEnLima(2) || d.fecha > diaEnLima(60)) {
      throw new ErrorApi(400, "La fecha debe ser con 2 a 60 días de anticipación.");
    }
    if (!["manana", "tarde"].includes(d.franja)) throw new ErrorApi(400, "Elige el horario de entrega.");
    const delivery = d.entrega === "delivery";
    const extras = Array.isArray(d.extras) ? d.extras : [];

    let precio;
    try {
      precio = precioTorta({ tamano: d.tamano, bizcocho: d.bizcocho, relleno: d.relleno, cobertura: d.cobertura, extras, regalo: Boolean(d.regalo) });
    } catch {
      throw new ErrorApi(400, "Alguna opción de la torta no es válida.");
    }

    const sql = obtenerSql();
    const [torta] = await sql`
      insert into pedidos_especiales (usuario_id, nombre_contacto, telefono, correo, ocasion, tamano, bizcocho, relleno,
                                      cobertura, extras, mensaje, es_regalo, dedicatoria, alergias, fecha_entrega,
                                      franja, tipo_entrega, distrito, direccion, precio_estimado)
      values (${usuario?.id ?? null}, ${d.nombre.trim()}, ${d.telefono}, ${d.correo || null}, ${d.ocasion || null},
              ${d.tamano}, ${d.bizcocho}, ${d.relleno}, ${d.cobertura}, ${extras},
              ${(d.mensaje ?? "").slice(0, 40) || null}, ${Boolean(d.regalo)}, ${(d.dedicatoria ?? "").slice(0, 140) || null},
              ${d.alergias || null}, ${d.fecha}, ${d.franja}, ${delivery ? "delivery" : "recojo"},
              ${delivery ? d.distrito : null}, ${delivery ? d.direccion : null}, ${precio})
      returning id, codigo, precio_estimado::float as precio`;
    responder(res, 201, { torta });
  },
});
