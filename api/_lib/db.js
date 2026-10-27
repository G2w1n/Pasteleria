// =========================================================
// Conexión a Neon (PostgreSQL).
// La cadena de conexión vive SOLO en Vercel (variable de entorno
// DATABASE_URL). Nunca se escribe en el código ni se sube a GitHub.
// Los archivos de api/_lib no son rutas: Vercel ignora las carpetas con "_".
// =========================================================
import { neon } from "@neondatabase/serverless";

let conexion = null;

// Devuelve la función `sql` para hacer consultas con plantillas:
//   const filas = await sql`select * from productos where id = ${id}`;
// Los valores ${...} viajan como parámetros: no hay inyección SQL.
export function obtenerSql() {
  // En las pruebas locales se usa un PostgreSQL de prueba en lugar de Neon
  if (globalThis.__sqlDePrueba) return globalThis.__sqlDePrueba;
  if (!conexion) {
    // DATABASE_URL es la que creamos a mano; las otras las crea la integración de Neon en Vercel
    const url = process.env.DATABASE_URL ?? process.env.POSTGRES_URL ?? process.env.NEON_DATABASE_URL;
    if (!url) {
      throw new ErrorApi(500, "Falta configurar DATABASE_URL en Vercel.");
    }
    conexion = neon(url);
  }
  return conexion;
}

// Error con código HTTP y un mensaje que se puede mostrar al usuario
export class ErrorApi extends Error {
  constructor(estado, mensaje) {
    super(mensaje);
    this.estado = estado;
  }
}
