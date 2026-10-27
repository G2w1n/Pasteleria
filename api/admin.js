// =========================================================
// Panel de la tienda (admin.html). Un solo archivo para no pasar
// el límite de funciones del plan gratuito de Vercel.
//
//   GET  /api/admin?recurso=resumen     → reportes (solo administrador)
//   GET  /api/admin?recurso=pedidos     → pedidos activos y tortas (administrador y empleado)
//   GET  /api/admin?recurso=productos   → productos y stock (administrador y empleado)
//   GET  /api/admin?recurso=usuarios    → usuarios (solo administrador)
//   GET  /api/admin?recurso=resenas     → reseñas (solo administrador)
//   POST /api/admin?recurso=…           → cambios (ver cada función)
//
// Cada cambio guarda quién lo hizo (historial de estados y de stock).
// =========================================================
import { ErrorApi, obtenerSql } from "./_lib/db.js";
import { leerCuerpo, responder, ruta } from "./_lib/http.js";
import { exigirUsuario } from "./_lib/sesion.js";

const ADMIN = ["administrador"];
const PERSONAL = ["administrador", "empleado"];
const ESTADOS = ["recibido", "en_preparacion", "listo", "en_camino", "entregado", "cancelado"];
const ROLES = ["cliente", "empleado", "administrador"];
const MOTIVOS = ["produccion", "ajuste", "merma"];

// ---------- Lectura ----------
const LECTURA = {
  async resumen(sql) {
    const [[resumen], diarias, productos, categorias, distritos, horas, stockBajo, clientes] = await Promise.all([
      sql`select ventas_hoy::float, pedidos_hoy::int, ventas_semana::float, ventas_mes::float,
                 ticket_promedio_mes::float, pedidos_pendientes::int from reporte_resumen`,
      sql`select fecha::text, pedidos::int, total::float from reporte_ventas_diarias
          where fecha > (now() at time zone 'America/Lima')::date - 30 order by fecha`,
      sql`select id, nombre, unidades::int, ingresos::float from reporte_productos limit 8`,
      sql`select nombre, unidades::int, ingresos::float from reporte_categorias`,
      sql`select distrito, pedidos::int, total::float from reporte_distritos limit 8`,
      sql`select hora::int, sum(pedidos)::int as pedidos from reporte_horas group by hora order by hora`,
      sql`select id, nombre, stock, stock_minimo from reporte_stock_bajo`,
      sql`select nombre, pedidos::int, total_gastado::float from reporte_clientes limit 5`,
    ]);
    return { resumen, diarias, productos, categorias, distritos, horas, stockBajo, clientes };
  },

  async pedidos(sql, req) {
    const todos = req.query.todos === "1"; // también entregados y cancelados (últimos 3 días)
    const [pedidos, especiales] = await Promise.all([
      sql`select p.id, p.codigo, p.estado, p.canal, p.tipo_entrega, p.distrito, p.direccion, p.metodo_pago,
                 p.nombre_contacto, p.telefono, p.notas, p.total::float, p.creado_en,
                 coalesce((select json_agg(json_build_object('nombre', pr.nombre, 'cantidad', d.cantidad) order by pr.nombre)
                           from pedido_detalle d join productos pr on pr.id = d.producto_id where d.pedido_id = p.id), '[]') as productos
          from pedidos p
          where p.estado not in ('entregado', 'cancelado')
             or (${todos} and p.creado_en > now() - interval '3 days')
          order by p.creado_en desc
          limit 100`,
      sql`select id, codigo, estado, nombre_contacto, telefono, ocasion, tamano, bizcocho, relleno, cobertura, extras,
                 mensaje, es_regalo, alergias, fecha_entrega::text, franja, tipo_entrega, distrito, precio_estimado::float as precio
          from pedidos_especiales
          where estado not in ('entregado', 'cancelado') or (${todos} and fecha_entrega >= current_date - 3)
          order by fecha_entrega, franja
          limit 50`,
    ]);
    return { pedidos, especiales };
  },

  async productos(sql) {
    const productos = await sql`
      select p.id, p.nombre, c.nombre as categoria, p.precio::float, p.stock, p.stock_minimo, p.activo, p.etiqueta
      from productos p join categorias c on c.id = p.categoria_id
      order by c.orden, p.nombre`;
    return { productos };
  },

  async usuarios(sql) {
    const usuarios = await sql`
      select u.id, u.nombre, u.correo, u.telefono, u.rol, u.activo, u.creado_en,
             (select count(*)::int from pedidos p where p.usuario_id = u.id) as pedidos
      from usuarios u
      where u.clave_hash <> 'demo-sin-acceso'
      order by u.creado_en desc
      limit 200`;
    return { usuarios };
  },

  async resenas(sql) {
    const resenas = await sql`
      select r.id, r.estrellas, r.comentario, r.visible, r.creado_en, p.nombre as producto, u.nombre as cliente
      from resenas r join productos p on p.id = r.producto_id join usuarios u on u.id = r.usuario_id
      order by r.creado_en desc
      limit 200`;
    return { resenas };
  },
};
const PERMISOS_LECTURA = { resumen: ADMIN, pedidos: PERSONAL, productos: PERSONAL, usuarios: ADMIN, resenas: ADMIN };

// ---------- Cambios ----------
const CAMBIOS = {
  // { id, estado, especial? } · el historial guarda quién lo cambió; cancelar devuelve el stock
  async pedidos(sql, usuario, d) {
    if (!ESTADOS.includes(d.estado)) throw new ErrorApi(400, "Estado no válido.");
    if (d.especial) {
      const [fila] = await sql`update pedidos_especiales set estado = ${d.estado}::estado_pedido, actualizado_en = now()
                               where id = ${d.id} returning codigo`;
      if (!fila) throw new ErrorApi(404, "No existe esa torta personalizada.");
      return { codigo: fila.codigo };
    }
    const [, [fila]] = await sql.transaction([
      sql`select set_config('kuyay.usuario_id', ${usuario.id}, true)`,
      sql`update pedidos set estado = ${d.estado}::estado_pedido where id = ${d.id} and estado <> 'cancelado' returning codigo`,
    ]);
    if (!fila) throw new ErrorApi(409, "Ese pedido no existe o ya fue cancelado.");
    return { codigo: fila.codigo };
  },

  // { id, precio?, activo?, stock_minimo? } (administrador) o { id, movimiento: { cantidad, motivo, nota } } (personal)
  async productos(sql, usuario, d) {
    if (d.movimiento) {
      const cantidad = Number(d.movimiento.cantidad);
      if (!Number.isInteger(cantidad) || cantidad === 0 || Math.abs(cantidad) > 500) throw new ErrorApi(400, "Cantidad no válida.");
      if (!MOTIVOS.includes(d.movimiento.motivo)) throw new ErrorApi(400, "Motivo no válido.");
      try {
        await sql`insert into movimientos_stock (producto_id, cantidad, motivo, usuario_id, nota)
                  values (${d.id}, ${cantidad}, ${d.movimiento.motivo}::motivo_stock, ${usuario.id}, ${d.movimiento.nota || null})`;
      } catch (error) {
        if (`${error.message} ${error.constraint}`.includes("productos_stock_check")) {
          throw new ErrorApi(409, "El stock no puede quedar en negativo.");
        }
        throw error;
      }
    } else {
      if (usuario.rol !== "administrador") throw new ErrorApi(403, "Solo un administrador puede cambiar precios.");
      const precio = d.precio === undefined ? null : Number(d.precio);
      if (precio !== null && !(precio > 0 && precio < 10000)) throw new ErrorApi(400, "Precio no válido.");
      const minimo = d.stock_minimo === undefined ? null : Number(d.stock_minimo);
      if (minimo !== null && !(Number.isInteger(minimo) && minimo >= 0)) throw new ErrorApi(400, "Stock mínimo no válido.");
      await sql`update productos set
                  precio = coalesce(${precio}::numeric, precio),
                  activo = coalesce(${typeof d.activo === "boolean" ? d.activo : null}::boolean, activo),
                  stock_minimo = coalesce(${minimo}::int, stock_minimo)
                where id = ${d.id}`;
    }
    const [producto] = await sql`select id, precio::float, stock, stock_minimo, activo from productos where id = ${d.id}`;
    if (!producto) throw new ErrorApi(404, "No existe ese producto.");
    return { producto };
  },

  // { id, rol?, activo? } · nadie puede quitarse su propio rol ni desactivarse
  async usuarios(sql, usuario, d) {
    if (d.id === usuario.id) throw new ErrorApi(400, "No puedes cambiar tu propia cuenta desde aquí.");
    if (d.rol !== undefined && !ROLES.includes(d.rol)) throw new ErrorApi(400, "Rol no válido.");
    const [fila] = await sql`update usuarios set
                               rol = coalesce(${d.rol ?? null}::rol_usuario, rol),
                               activo = coalesce(${typeof d.activo === "boolean" ? d.activo : null}::boolean, activo)
                             where id = ${d.id} returning id, rol, activo`;
    if (!fila) throw new ErrorApi(404, "No existe ese usuario.");
    return { usuario: fila };
  },

  // { id, visible }
  async resenas(sql, _usuario, d) {
    const [fila] = await sql`update resenas set visible = ${Boolean(d.visible)} where id = ${d.id} returning id, visible`;
    if (!fila) throw new ErrorApi(404, "No existe esa reseña.");
    return { resena: fila };
  },
};
const PERMISOS_CAMBIO = { pedidos: PERSONAL, productos: PERSONAL, usuarios: ADMIN, resenas: ADMIN };

export default ruta({
  async GET(req, res) {
    const recurso = req.query?.recurso;
    if (!LECTURA[recurso]) throw new ErrorApi(400, "Recurso no válido.");
    const usuario = await exigirUsuario(req, PERMISOS_LECTURA[recurso]);
    responder(res, 200, { ...(await LECTURA[recurso](obtenerSql(), req, usuario)), rol: usuario.rol });
  },
  async POST(req, res) {
    const recurso = req.query?.recurso;
    if (!CAMBIOS[recurso]) throw new ErrorApi(400, "Recurso no válido.");
    const usuario = await exigirUsuario(req, PERMISOS_CAMBIO[recurso]);
    const datos = await leerCuerpo(req);
    if (datos.id === undefined || datos.id === null || datos.id === "") throw new ErrorApi(400, "Falta el id.");
    responder(res, 200, await CAMBIOS[recurso](obtenerSql(), usuario, datos));
  },
});
