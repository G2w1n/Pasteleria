// =========================================================
// GET /api/productos → categorías, productos activos (con sus estrellas)
// el costo de delivery y si el Modo Navidad está activo (lo decide el administrador). Es público y se guarda unos segundos en la red de
// Vercel; los números del día ("Hoy en Kuyay") están en /api/admin?recurso=envivo.
// Devuelve los datos con la misma forma que js/productos.js,
// así la página los usa sin cambiar el resto del código.
// =========================================================
import { obtenerSql } from "./_lib/db.js";
import { ruta } from "./_lib/http.js";

export default ruta({
  async GET(req, res) {
    const sql = obtenerSql();
    const [categorias, productos, [delivery], [navidad]] = await Promise.all([
      sql`select id, nombre, conservacion from categorias order by orden`,
      sql`select p.id, p.nombre, p.categoria_id as categoria, p.precio::float as precio, p.porcion, p.descripcion,
                 p.ingredientes, p.alergenos, p.etiqueta, p.stock, p.ilustracion, p.foto,
                 r.promedio, coalesce(r.total, 0) as total_resenas
          from productos p
          left join (select producto_id, round(avg(estrellas), 1)::float as promedio, count(*)::int as total
                     from resenas where visible group by producto_id) r on r.producto_id = p.id
          where p.activo order by p.categoria_id, p.nombre`,
      sql`select valor from configuracion where clave = 'delivery_por_distrito'`,
      sql`select valor from configuracion where clave = 'modo_navidad'`,
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
      delivery: delivery?.valor ?? {}, // costo de delivery por distrito
      navidad: navidad?.valor === true,
    }));
  },
});

