// =========================================================
// GET /api/productos → categorías y productos activos.
// Devuelve los datos con la misma forma que js/productos.js,
// así la página los usa sin cambiar el resto del código.
// =========================================================
import { obtenerSql } from "./_lib/db.js";
import { ruta } from "./_lib/http.js";

export default ruta({
  async GET(req, res) {
    const sql = obtenerSql();
    const [categorias, productos, [delivery]] = await Promise.all([
      sql`select id, nombre, conservacion from categorias order by orden`,
      sql`select id, nombre, categoria_id as categoria, precio::float as precio, porcion, descripcion,
                 ingredientes, alergenos, etiqueta, stock, ilustracion, foto
          from productos where activo order by categoria_id, nombre`,
      sql`select valor from configuracion where clave = 'delivery_por_distrito'`,
    ]);
    // El catálogo puede guardarse 30 s en la red de Vercel: carga rápido y el stock se actualiza seguido
    res.setHeader("Cache-Control", "public, s-maxage=30, stale-while-revalidate=60");
    res.statusCode = 200;
    res.setHeader("Content-Type", "application/json; charset=utf-8");
    res.end(JSON.stringify({
      categorias,
      productos: productos.map(({ foto, ...p }) => (foto ? { ...p, foto } : p)),
      delivery: delivery?.valor ?? {}, // costo de delivery por distrito
    }));
  },
});

