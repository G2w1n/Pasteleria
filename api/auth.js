// =========================================================
// Cuentas de usuario.
//   POST /api/auth?accion=registro  { nombre, correo, telefono?, clave }
//   POST /api/auth?accion=login     { correo, clave }
//   POST /api/auth?accion=salir
//   GET  /api/auth                  → usuario de la sesión (o null)
//   GET  /api/auth?correo=ana@x.pe  → { disponible } (aviso en vivo al crear cuenta)
// Las contraseñas se guardan con bcrypt: ni la base de datos conoce la real.
// =========================================================
import bcrypt from "bcryptjs";
import { ErrorApi, obtenerSql } from "./_lib/db.js";
import { leerCuerpo, responder, ruta } from "./_lib/http.js";
import { cerrarSesion, iniciarSesion, usuarioActual } from "./_lib/sesion.js";

const CORREO = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
const CELULAR = /^9\d{8}$/;
const publico = ({ id, nombre, correo, telefono, rol }) => ({ id, nombre, correo, telefono, rol });

async function registro(req, res) {
  const { nombre = "", correo = "", telefono = "", clave = "" } = await leerCuerpo(req);
  if (nombre.trim().length < 3) throw new ErrorApi(400, "Escribe tu nombre (mínimo 3 letras).");
  if (!CORREO.test(correo.trim())) throw new ErrorApi(400, "Revisa el formato del correo.");
  if (telefono && !CELULAR.test(telefono)) throw new ErrorApi(400, "El celular debe tener 9 dígitos y empezar con 9.");
  if (clave.length < 8) throw new ErrorApi(400, "La contraseña debe tener al menos 8 caracteres.");

  const sql = obtenerSql();
  const hash = await bcrypt.hash(clave, 10);
  // Todo registro nuevo es "cliente": los roles los asigna un administrador
  const [usuario] = await sql`
    insert into usuarios (nombre, correo, telefono, clave_hash)
    values (${nombre.trim()}, ${correo.trim()}, ${telefono || null}, ${hash})
    returning id, nombre, correo, telefono, rol`;
  await iniciarSesion(res, usuario);
  responder(res, 201, { usuario: publico(usuario) });
}

async function login(req, res) {
  const { correo = "", clave = "" } = await leerCuerpo(req);
  const sql = obtenerSql();
  const [usuario] = await sql`
    select id, nombre, correo, telefono, rol, clave_hash, activo
    from usuarios where lower(correo) = lower(${correo.trim()})`;
  let valida = false;
  try {
    valida = Boolean(usuario?.activo) && (await bcrypt.compare(clave, usuario.clave_hash));
  } catch {
    valida = false; // hash inválido (por ejemplo, los clientes de demostración)
  }
  // Mismo mensaje si el correo no existe o la clave es incorrecta: no revelamos qué correos tienen cuenta
  if (!valida) throw new ErrorApi(401, "Correo o contraseña incorrectos.");
  await iniciarSesion(res, usuario);
  responder(res, 200, { usuario: publico(usuario) });
}

export default ruta({
  async GET(req, res) {
    if (req.query?.correo !== undefined) {
      const correo = String(req.query.correo).trim();
      if (!CORREO.test(correo)) throw new ErrorApi(400, "Revisa el formato del correo.");
      const [fila] = await obtenerSql()`select 1 from usuarios where lower(correo) = lower(${correo})`;
      return responder(res, 200, { disponible: !fila });
    }
    const usuario = await usuarioActual(req);
    responder(res, 200, { usuario: usuario ? publico(usuario) : null });
  },
  async POST(req, res) {
    const accion = req.query?.accion;
    if (accion === "registro") return registro(req, res);
    if (accion === "login") return login(req, res);
    if (accion === "salir") {
      cerrarSesion(res);
      return responder(res, 200, { ok: true });
    }
    throw new ErrorApi(400, "Acción no válida.");
  },
});
