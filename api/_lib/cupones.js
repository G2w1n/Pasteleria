// =========================================================
// Cupones de descuento (los usan /api/cupones y /api/pedidos).
// =========================================================

// Busca un cupón vigente (activo, sin vencer y con usos disponibles)
export async function cuponVigente(sql, codigo) {
  const limpio = String(codigo ?? "").trim().toUpperCase();
  if (!/^[A-Z0-9-]{3,20}$/.test(limpio)) return null;
  const [cupon] = await sql`
    select codigo, porcentaje from cupones
    where codigo = ${limpio} and activo
      and (vence is null or vence >= (now() at time zone 'America/Lima')::date)
      and (usos_max is null or usos < usos_max)`;
  return cupon ?? null;
}
