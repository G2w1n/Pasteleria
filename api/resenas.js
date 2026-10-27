// =========================================================
// Reseñas de productos.
//   GET  /api/resenas?producto=torta-lucuma → promedio, total, reparto y reseñas
//   POST /api/resenas { producto, estrellas, comentario } → crea o actualiza la
//        reseña del cliente (una por producto; hay que iniciar sesión)
// =========================================================
import { ErrorApi, obtenerSql } from "./_lib/db.js";
import { leerCuerpo, responder, ruta } from "./_lib/http.js";
import { exigirUsuario, usuarioActual } from "./_lib/sesion.js";

// "Andrea Torres" → "Andrea T." (no se publica el apellido completo)
const nombrePublico = (nombre) => {
  const [primero, segundo] = nombre.trim().split(/\s+/);
  return segundo ? `${primero} ${segundo[0]}.` : primero;
};

async function listar(req, res) {
  const producto = String(req.query?.producto ?? "");
  const sql = obtenerSql();
  const usuario = await usuarioActual(req);
  const filas = await sql`
    select r.id, r.estrellas, r.comentario, r.creado_en, u.nombre, r.usuario_id = ${usuario?.id ?? null}::uuid as propia
    from resenas r join usuarios u on u.id = r.usuario_id
    where r.producto_id = ${producto} and r.visible
    order by r.creado_en desc
    limit 50`;
  const total = filas.length;
  const reparto = [5, 4, 3, 2, 1].map((n) => ({ estrellas: n, cantidad: filas.filter((f) => f.estrellas === n).length }));
  responder(res, 200, {
    promedio: total ? Math.round((filas.reduce((s, f) => s + f.estrellas, 0) / total) * 10) / 10 : 0,
    total,
    reparto,
    resenas: filas.map((f) => ({ id: f.id, nombre: nombrePublico(f.nombre), estrellas: f.estrellas, comentario: f.comentario, fecha: f.creado_en, propia: Boolean(f.propia) })),
  });
}

async function guardar(req, res) {
  const usuario = await exigirUsuario(req);
  const { producto, estrellas, comentario = "" } = await leerCuerpo(req);
  if (!Number.isInteger(estrellas) || estrellas < 1 || estrellas > 5) throw new ErrorApi(400, "Elige de 1 a 5 estrellas.");
  const texto = String(comentario).trim();
  if (texto.length > 300) throw new ErrorApi(400, "El comentario puede tener hasta 300 caracteres.");
  const sql = obtenerSql();
  const [existe] = await sql`select 1 from productos where id = ${String(producto)} and activo`;
  if (!existe) throw new ErrorApi(404, "Ese producto no existe.");
  await sql`
    insert into resenas (producto_id, usuario_id, estrellas, comentario)
    values (${producto}, ${usuario.id}, ${estrellas}, ${texto || null})
    on conflict (producto_id, usuario_id)
    do update set estrellas = excluded.estrellas, comentario = excluded.comentario, creado_en = now()`;
  responder(res, 201, { ok: true });
}

export default ruta({ GET: listar, POST: guardar });
