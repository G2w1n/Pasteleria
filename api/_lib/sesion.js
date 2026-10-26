// =========================================================
// Sesiones con JWT en una cookie HttpOnly.
// La página nunca ve el token (JavaScript no puede leerlo),
// así que un script malicioso no puede robar la sesión.
// =========================================================
import { SignJWT, jwtVerify } from "jose";
import { ErrorApi, obtenerSql } from "./db.js";

const COOKIE = "kuyay_sesion";
const DURACION_DIAS = 7;

function clave() {
  const secreto = process.env.JWT_SECRET;
  if (!secreto || secreto.length < 32) {
    throw new ErrorApi(500, "Falta configurar JWT_SECRET en Vercel (mínimo 32 caracteres).");
  }
  return new TextEncoder().encode(secreto);
}

export async function iniciarSesion(res, usuario) {
  const token = await new SignJWT({ rol: usuario.rol })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(usuario.id)
    .setIssuedAt()
    .setExpirationTime(`${DURACION_DIAS}d`)
    .sign(clave());
  const segura = process.env.VERCEL ? "; Secure" : ""; // en Vercel siempre es https
  res.setHeader("Set-Cookie", `${COOKIE}=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${DURACION_DIAS * 86400}${segura}`);
}

export function cerrarSesion(res) {
  res.setHeader("Set-Cookie", `${COOKIE}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0`);
}

function leerCookie(req) {
  const cabecera = req.headers.cookie ?? "";
  const par = cabecera.split(/;\s*/).find((c) => c.startsWith(`${COOKIE}=`));
  return par ? decodeURIComponent(par.slice(COOKIE.length + 1)) : null;
}

// Devuelve el usuario de la sesión (leído de la base de datos, para
// respetar cambios de rol o cuentas desactivadas), o null si no hay sesión.
export async function usuarioActual(req) {
  const token = leerCookie(req);
  if (!token) return null;
  let datos;
  try {
    ({ payload: datos } = await jwtVerify(token, clave()));
  } catch (error) {
    if (error instanceof ErrorApi) throw error;
    return null; // token vencido o alterado
  }
  const sql = obtenerSql();
  const [usuario] = await sql`
    select id, nombre, correo, telefono, rol from usuarios where id = ${datos.sub} and activo`;
  return usuario ?? null;
}

// Exige una sesión (y, si se indica, uno de los roles permitidos)
export async function exigirUsuario(req, roles = null) {
  const usuario = await usuarioActual(req);
  if (!usuario) throw new ErrorApi(401, "Inicia sesión para continuar.");
  if (roles && !roles.includes(usuario.rol)) throw new ErrorApi(403, "No tienes permiso para hacer esto.");
  return usuario;
}
