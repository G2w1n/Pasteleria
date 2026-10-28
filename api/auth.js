// =========================================================
// Cuentas de usuario.
//   POST /api/auth?accion=registro  { nombre, correo, telefono?, clave }
//   POST /api/auth?accion=login     { correo, clave }
//   POST /api/auth?accion=salir
//   POST /api/auth?accion=google    { credential } → entra con Google (si GOOGLE_CLIENT_ID está en Vercel)
//   POST /api/auth?accion=recuperar { correo } → envía un enlace para crear una contraseña nueva
//   POST /api/auth?accion=restablecer { token, clave } → guarda la contraseña nueva y entra
//   GET  /api/auth                  → usuario de la sesión (o null) y el ID de Google para el botón
//   GET  /api/auth?correo=ana@x.pe  → { disponible } (aviso en vivo al crear cuenta)
// Las contraseñas se guardan con bcrypt: ni la base de datos conoce la real.
// =========================================================
import bcrypt from "bcryptjs";
import { createRemoteJWKSet, jwtVerify } from "jose";
import { ErrorApi, obtenerSql } from "./_lib/db.js";
import { leerCuerpo, responder, ruta } from "./_lib/http.js";
import { cerrarSesion, firmarEnlace, iniciarSesion, usuarioActual, verificarEnlace } from "./_lib/sesion.js";
import { correoConfigurado, enviarCorreo } from "./_lib/correo.js";
import { createHash } from "node:crypto";

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

// ---------- Entrar con Google ----------
// El navegador recibe de Google un token firmado (JWT). Aquí se verifica la firma con las
// claves públicas de Google y que sea para NUESTRA app; recién entonces se confía en el correo.
const CLIENTE_GOOGLE = () => process.env.GOOGLE_CLIENT_ID || null;
let clavesGoogle = null;
const llavesGoogle = () =>
  globalThis.__llavesGoogleDePrueba ?? (clavesGoogle ??= createRemoteJWKSet(new URL("https://www.googleapis.com/oauth2/v3/certs")));

async function google(req, res) {
  if (!CLIENTE_GOOGLE()) throw new ErrorApi(400, "El ingreso con Google no está configurado.");
  const { credential = "" } = await leerCuerpo(req);
  let datos;
  try {
    ({ payload: datos } = await jwtVerify(credential, llavesGoogle(), {
      issuer: ["https://accounts.google.com", "accounts.google.com"],
      audience: CLIENTE_GOOGLE(),
    }));
  } catch {
    throw new ErrorApi(401, "No pudimos comprobar tu cuenta de Google. Intenta de nuevo.");
  }
  if (!datos.email || !datos.email_verified) throw new ErrorApi(401, "Tu correo de Google no está verificado.");

  const sql = obtenerSql();
  let [usuario] = await sql`select id, nombre, correo, telefono, rol, activo from usuarios where lower(correo) = lower(${datos.email})`;
  let nuevo = false;
  if (usuario && !usuario.activo) throw new ErrorApi(403, "Tu cuenta está desactivada.");
  if (!usuario) {
    // Cuenta nueva: no tiene contraseña propia (solo puede entrar con Google)
    const nombre = (datos.name ?? "").trim().length >= 3 ? datos.name.trim() : datos.email.split("@")[0].padEnd(3, "_");
    [usuario] = await sql`
      insert into usuarios (nombre, correo, clave_hash) values (${nombre}, ${datos.email}, 'google-sin-clave')
      returning id, nombre, correo, telefono, rol`;
    nuevo = true;
  }
  await iniciarSesion(res, usuario);
  responder(res, nuevo ? 201 : 200, { usuario: publico(usuario), nuevo });
}

// ---------- ¿Olvidaste tu contraseña? ----------
// Sin tablas nuevas: el enlace es un token firmado que vence en 30 minutos y lleva
// una "huella" de la contraseña actual, así sirve UNA sola vez.
// El enlace apunta al sitio que atendió la petición (producción o vista previa de Vercel),
// pero SOLO si es uno de los nuestros: nunca a una dirección que mande el navegador.
const SITIO_PRINCIPAL = "https://pasteleria-three-steel.vercel.app";
function sitioDe(req) {
  const host = String(req.headers["x-forwarded-host"] ?? req.headers.host ?? "").toLowerCase();
  if (host === "pasteleria-three-steel.vercel.app" || /^pasteleria-[a-z0-9-]+-jefferson-mvs-projects\.vercel\.app$/.test(host)) {
    return `https://${host}`;
  }
  if (/^(localhost|127\.0\.0\.1)(:\d+)?$/.test(host)) return `http://${host}`; // pruebas locales
  return SITIO_PRINCIPAL;
}
const huella = (claveHash) => createHash("sha256").update(claveHash).digest("hex").slice(0, 16);
const RESPUESTA_RECUPERAR = { ok: true, mensaje: "Si el correo tiene una cuenta, te enviamos un enlace. Revisa también la carpeta de spam." };

async function recuperar(req, res) {
  if (!correoConfigurado()) throw new ErrorApi(503, "La recuperación por correo aún no está activada. Escríbenos por WhatsApp y te ayudamos.");
  const { correo = "" } = await leerCuerpo(req);
  if (!CORREO.test(correo.trim())) throw new ErrorApi(400, "Revisa el formato del correo.");
  const [usuario] = await obtenerSql()`select id, nombre, correo, clave_hash from usuarios where lower(correo) = lower(${correo.trim()}) and activo`;
  // Mismo mensaje exista o no la cuenta
  if (!usuario) return responder(res, 200, RESPUESTA_RECUPERAR);

  const token = await firmarEnlace({ sub: usuario.id, proposito: "restablecer", huella: huella(usuario.clave_hash) });
  const enlace = `${sitioDe(req)}/cuenta.html?restablecer=${encodeURIComponent(token)}`;
  const nombre = usuario.nombre.split(" ")[0];
  await enviarCorreo({
    para: usuario.correo,
    asunto: "Crea tu nueva contraseña · Kuyay",
    texto: `Hola, ${nombre}:\n\nPara crear una contraseña nueva entra aquí (vence en 30 minutos):\n${enlace}\n\nSi no lo pediste, ignora este correo.\n\nKuyay · Pastelería de autor`,
    html: `<div style="font-family:Arial,sans-serif;max-width:480px;margin:auto;color:#3a2420">
      <h1 style="color:#8e2c4e">Hola, ${nombre.replace(/[<>&"]/g, "")} 🧁</h1>
      <p>Recibimos un pedido para cambiar la contraseña de tu cuenta en Kuyay.</p>
      <p><a href="${enlace}" style="display:inline-block;background:#8e2c4e;color:#fff;padding:12px 20px;border-radius:10px;text-decoration:none;font-weight:bold">Crear nueva contraseña</a></p>
      <p style="color:#6e5a55;font-size:14px">El enlace vence en 30 minutos y sirve una sola vez. Si no lo pediste, ignora este correo.</p>
    </div>`,
  });
  responder(res, 200, RESPUESTA_RECUPERAR);
}

async function restablecer(req, res) {
  const { token = "", clave = "" } = await leerCuerpo(req);
  if (clave.length < 8) throw new ErrorApi(400, "La contraseña debe tener al menos 8 caracteres.");
  const datos = await verificarEnlace(token, "restablecer");
  const vencido = new ErrorApi(400, "El enlace venció o ya se usó. Pide uno nuevo.");
  if (!datos) throw vencido;
  const sql = obtenerSql();
  const [usuario] = await sql`select id, clave_hash from usuarios where id = ${datos.sub} and activo`;
  if (!usuario || huella(usuario.clave_hash) !== datos.huella) throw vencido;
  const hash = await bcrypt.hash(clave, 10);
  const [actualizado] = await sql`
    update usuarios set clave_hash = ${hash} where id = ${usuario.id}
    returning id, nombre, correo, telefono, rol`;
  await iniciarSesion(res, actualizado);
  responder(res, 200, { usuario: publico(actualizado) });
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
    responder(res, 200, { usuario: usuario ? publico(usuario) : null, google: CLIENTE_GOOGLE() });
  },
  async POST(req, res) {
    const accion = req.query?.accion;
    if (accion === "registro") return registro(req, res);
    if (accion === "login") return login(req, res);
    if (accion === "google") return google(req, res);
    if (accion === "recuperar") return recuperar(req, res);
    if (accion === "restablecer") return restablecer(req, res);
    if (accion === "salir") {
      cerrarSesion(res);
      return responder(res, 200, { ok: true });
    }
    throw new ErrorApi(400, "Acción no válida.");
  },
});
