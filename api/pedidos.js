// =========================================================
// Pedidos del carrito.
//   POST /api/pedidos  → crea un pedido (con o sin cuenta; acepta un cupón)
//   GET  /api/pedidos  → los pedidos del cliente que inició sesión
//   GET  /api/pedidos?codigo=KY-000123&telefono=987654321 → seguimiento sin cuenta
//        (también sirve para tortas personalizadas: TP-00012)
//
// El servidor recalcula TODO: precios (de la base de datos),
// descuento y delivery. Lo que mande el navegador no se cree.
// El stock lo descuenta la base de datos; si no alcanza, la venta
// entera se cancela.
// =========================================================
import { ErrorApi, obtenerSql } from "./_lib/db.js";
import { leerCuerpo, responder, ruta } from "./_lib/http.js";
import { exigirUsuario, usuarioActual } from "./_lib/sesion.js";
import { cuponVigente } from "./_lib/cupones.js";

const CELULAR = /^9\d{8}$/;
const PAGOS = ["yape", "plin", "efectivo", "tarjeta"];

async function leerConfiguracion(sql) {
  const filas = await sql`select clave, valor from configuracion
                          where clave in ('minimo_descuento', 'porcentaje_descuento', 'delivery_por_distrito')`;
  return Object.fromEntries(filas.map((f) => [f.clave, f.valor]));
}

// Valida el carrito y devuelve las líneas con el precio real
async function validarItems(sql, items) {
  if (!Array.isArray(items) || items.length === 0) throw new ErrorApi(400, "El carrito está vacío.");
  if (items.length > 30) throw new ErrorApi(400, "Demasiados productos en un solo pedido.");
  const cantidades = new Map();
  for (const { id, cantidad } of items) {
    if (typeof id !== "string" || !Number.isInteger(cantidad) || cantidad < 1 || cantidad > 99) {
      throw new ErrorApi(400, "Hay un producto con una cantidad no válida.");
    }
    cantidades.set(id, (cantidades.get(id) ?? 0) + cantidad);
  }
  const ids = [...cantidades.keys()];
  const productos = await sql`select id, nombre, precio::float as precio, stock from productos
                              where activo and id = any(${ids})`;
  if (productos.length !== ids.length) throw new ErrorApi(400, "Uno de los productos ya no está disponible.");
  const sinStock = productos.find((p) => p.stock < cantidades.get(p.id));
  if (sinStock) {
    throw new ErrorApi(409, sinStock.stock === 0
      ? `${sinStock.nombre} se agotó. Quítalo del carrito para continuar.`
      : `Solo quedan ${sinStock.stock} de ${sinStock.nombre}. Ajusta la cantidad.`);
  }
  return productos.map((p) => ({ ...p, cantidad: cantidades.get(p.id) }));
}

async function crear(req, res) {
  const datos = await leerCuerpo(req);
  const sql = obtenerSql();
  const usuario = await usuarioActual(req);

  const nombre = (datos.nombre ?? "").trim();
  const telefono = (datos.telefono ?? "").trim();
  const delivery = datos.tipo_entrega === "delivery";
  if (nombre.length < 3) throw new ErrorApi(400, "Escribe tu nombre (mínimo 3 letras).");
  if (!CELULAR.test(telefono)) throw new ErrorApi(400, "El celular debe tener 9 dígitos y empezar con 9.");
  if (!PAGOS.includes(datos.metodo_pago)) throw new ErrorApi(400, "Elige un método de pago.");

  const [lineas, config] = await Promise.all([validarItems(sql, datos.items), leerConfiguracion(sql)]);

  // Mismas reglas que muestra la página
  const subtotal = lineas.reduce((total, l) => total + l.precio * l.cantidad, 0);
  const minimo = Number(config.minimo_descuento ?? 100);
  const porcentaje = Number(config.porcentaje_descuento ?? 10);
  const descuentoAutomatico = subtotal > minimo ? Math.round(subtotal * porcentaje) / 100 : 0;
  // Cupón: se usa solo si descuenta más que el 10 % automático (no se suman)
  let cupon = null;
  if (datos.cupon) {
    cupon = await cuponVigente(sql, datos.cupon);
    if (!cupon) throw new ErrorApi(400, "El cupón no existe o ya venció. Quítalo para continuar.");
  }
  const descuentoCupon = cupon ? Math.round(subtotal * cupon.porcentaje) / 100 : 0;
  const usarCupon = descuentoCupon > descuentoAutomatico;
  const descuento = Math.max(descuentoAutomatico, descuentoCupon);
  let costoDelivery = 0;
  if (delivery) {
    costoDelivery = config.delivery_por_distrito?.[datos.distrito];
    if (costoDelivery === undefined) throw new ErrorApi(400, "Todavía no hacemos delivery a ese distrito.");
    if (!(datos.direccion ?? "").trim()) throw new ErrorApi(400, "Escribe la dirección de entrega.");
  }

  const items = JSON.stringify(lineas.map((l) => ({ producto_id: l.id, cantidad: l.cantidad, precio: l.precio })));
  // Una sola transacción: quién hizo el pedido (para el historial), el pedido y sus productos.
  // Si un producto no tiene stock, la base de datos rechaza TODO.
  const [, , [pedido]] = await sql.transaction([
    sql`select set_config('kuyay.usuario_id', ${usuario?.id ?? ""}, true)`,
    // El cupón gasta un uso (si no aplica, esta consulta no cambia nada)
    sql`update cupones set usos = usos + 1 where codigo = ${usarCupon ? cupon.codigo : ""}`,
    sql`with nuevo as (
          insert into pedidos (usuario_id, nombre_contacto, telefono, canal, tipo_entrega, distrito, direccion,
                               metodo_pago, descuento, costo_delivery, notas, cupon_codigo)
          values (${usuario?.id ?? null}, ${nombre}, ${telefono}, 'web',
                  ${delivery ? "delivery" : "recojo"}, ${delivery ? datos.distrito : null},
                  ${delivery ? datos.direccion.trim() : null}, ${datos.metodo_pago},
                  ${descuento}, ${costoDelivery}, ${(datos.notas ?? "").trim() || null},
                  ${usarCupon ? cupon.codigo : null})
          returning id, codigo
        ), detalle as (
          insert into pedido_detalle (pedido_id, producto_id, cantidad, precio_unitario)
          select nuevo.id, i.producto_id, i.cantidad, i.precio
          from nuevo, jsonb_to_recordset(${items}::jsonb) as i(producto_id text, cantidad int, precio numeric)
          returning 1
        )
        select id, codigo from nuevo`,
  ]);

  responder(res, 201, {
    pedido: {
      id: pedido.id,
      codigo: pedido.codigo,
      subtotal,
      descuento,
      costo_delivery: costoDelivery,
      cupon: usarCupon ? cupon.codigo : null,
      total: Math.round((subtotal - descuento + costoDelivery) * 100) / 100,
    },
  });
}

// Seguimiento sin cuenta: hace falta el código Y el celular del pedido,
// así nadie puede ver pedidos ajenos probando códigos.
async function seguimiento(req, res) {
  const codigo = String(req.query.codigo ?? "").trim().toUpperCase();
  const telefono = String(req.query.telefono ?? "").replace(/\D/g, "");
  if (!/^(KY-\d{6}|TP-\d{5})$/.test(codigo)) throw new ErrorApi(400, "Escribe el código como aparece en tu pedido, por ejemplo KY-000123.");
  if (!CELULAR.test(telefono)) throw new ErrorApi(400, "Escribe el celular con el que hiciste el pedido.");
  const sql = obtenerSql();
  const noEncontrado = new ErrorApi(404, "No encontramos un pedido con ese código y celular.");

  if (codigo.startsWith("TP-")) {
    const [torta] = await sql`
      select codigo, estado, tipo_entrega, fecha_entrega::text, franja, precio_estimado::float as total, creado_en,
             tamano, bizcocho, relleno, cobertura
      from pedidos_especiales where codigo = ${codigo} and telefono = ${telefono}`;
    if (!torta) throw noEncontrado;
    return responder(res, 200, { pedido: { ...torta, especial: true, productos: [], historial: [] } });
  }

  const [pedido] = await sql`
    select p.codigo, p.estado, p.tipo_entrega, p.distrito, p.total::float, p.creado_en,
           coalesce((select json_agg(json_build_object('nombre', pr.nombre, 'cantidad', d.cantidad) order by pr.nombre)
                     from pedido_detalle d join productos pr on pr.id = d.producto_id where d.pedido_id = p.id), '[]') as productos,
           coalesce((select json_agg(json_build_object('estado', h.estado, 'fecha', h.creado_en) order by h.id)
                     from historial_estados h where h.pedido_id = p.id), '[]') as historial
    from pedidos p where p.codigo = ${codigo} and p.telefono = ${telefono}`;
  if (!pedido) throw noEncontrado;
  responder(res, 200, { pedido });
}

async function misPedidos(req, res) {
  if (req.query?.codigo) return seguimiento(req, res);
  const usuario = await exigirUsuario(req);
  const sql = obtenerSql();
  const pedidos = await sql`
    select p.id, p.codigo, p.estado, p.tipo_entrega, p.distrito, p.metodo_pago,
           p.subtotal::float, p.descuento::float, p.costo_delivery::float, p.total::float, p.creado_en,
           coalesce((select json_agg(json_build_object('nombre', pr.nombre, 'cantidad', d.cantidad, 'importe', d.importe::float) order by pr.nombre)
                     from pedido_detalle d join productos pr on pr.id = d.producto_id where d.pedido_id = p.id), '[]') as productos,
           coalesce((select json_agg(json_build_object('estado', h.estado, 'fecha', h.creado_en) order by h.id)
                     from historial_estados h where h.pedido_id = p.id), '[]') as historial
    from pedidos p
    where p.usuario_id = ${usuario.id}
    order by p.creado_en desc
    limit 50`;
  responder(res, 200, { pedidos });
}

export default ruta({ POST: crear, GET: misPedidos });
