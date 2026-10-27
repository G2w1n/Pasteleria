// =========================================================
// GET /api/productos → categorías, productos activos (con sus estrellas)
// y un resumen "en vivo" del día para la portada.
// Devuelve los datos con la misma forma que js/productos.js,
// así la página los usa sin cambiar el resto del código.
// =========================================================
import { obtenerSql } from "./_lib/db.js";
import { ruta } from "./_lib/http.js";

export default ruta({
  async GET(req, res) {
    const sql = obtenerSql();
    const [categorias, productos, [delivery], [resumen]] = await Promise.all([
      sql`select id, nombre, conservacion from categorias order by orden`,
      sql`select p.id, p.nombre, p.categoria_id as categoria, p.precio::float as precio, p.porcion, p.descripcion,
                 p.ingredientes, p.alergenos, p.etiqueta, p.stock, p.ilustracion, p.foto,
                 r.promedio, coalesce(r.total, 0) as total_resenas
          from productos p
          left join (select producto_id, round(avg(estrellas), 1)::float as promedio, count(*)::int as total
                     from resenas where visible group by producto_id) r on r.producto_id = p.id
          where p.activo order by p.categoria_id, p.nombre`,
      sql`select valor from configuracion where clave = 'delivery_por_distrito'`,
      // Resumen del día (hora de Lima): lo muestra la portada
      sql`select
            (select count(*)::int from pedidos where estado <> 'cancelado'
               and (creado_en at time zone 'America/Lima')::date = (now() at time zone 'America/Lima')::date) as pedidos_hoy,
            (select count(*)::int from pedidos where estado = 'entregado') as entregados,
            (select count(*)::int from usuarios where rol = 'cliente' and activo) as clientes,
            (select round(avg(estrellas), 1)::float from resenas where visible) as calificacion,
            (select count(*)::int from resenas where visible) as resenas`,
    ]);
    // El catálogo puede guardarse 30 s en la red de Vercel: carga rápido y el stock se actualiza seguido
    res.setHeader("Cache-Control", "public, s-maxage=30, stale-while-revalidate=60");
    res.statusCode = 200;
    res.setHeader("Content-Type", "application/json; charset=utf-8");
    res.end(JSON.stringify({
      categorias,
      productos: productos.map(({ foto, promedio, total_resenas, ...p }) => ({
        ...p,
        ...(foto ? { foto } : {}),
        calificacion: { promedio: promedio ?? 0, total: total_resenas },
      })),
      resumen,
      delivery: delivery?.valor ?? {}, // costo de delivery por distrito
    }));
  },
});

