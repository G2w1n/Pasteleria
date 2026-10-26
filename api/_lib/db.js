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
    if (!process.env.DATABASE_URL) {
      throw new ErrorApi(500, "Falta configurar DATABASE_URL en Vercel.");
    }
    conexion = neon(process.env.DATABASE_URL);
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
