// =========================================================
// GET /api/cupones?codigo=KUYAY10 → { cupon: { codigo, porcentaje } }
// Solo dice si el cupón sirve hoy. Al comprar, /api/pedidos lo vuelve
// a validar y lo descuenta de sus usos.
// =========================================================
import { ErrorApi, obtenerSql } from "./_lib/db.js";
import { responder, ruta } from "./_lib/http.js";
import { cuponVigente } from "./_lib/cupones.js";

export default ruta({
  async GET(req, res) {
    const cupon = await cuponVigente(obtenerSql(), req.query?.codigo);
    if (!cupon) throw new ErrorApi(404, "Ese cupón no existe o ya venció.");
    responder(res, 200, { cupon });
  },
});
