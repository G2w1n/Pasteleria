// =========================================================
// Envío de correos con Resend (https://resend.com), sin librerías:
// una sola petición a su API. Necesita RESEND_API_KEY en Vercel.
// CORREO_REMITENTE es opcional (por defecto, el remitente de prueba de Resend).
// =========================================================
import { ErrorApi } from "./db.js";

export const correoConfigurado = () => Boolean(process.env.RESEND_API_KEY) || Boolean(globalThis.__enviarCorreoDePrueba);

export async function enviarCorreo({ para, asunto, html, texto }) {
  // En las pruebas locales el correo se guarda en vez de enviarse
  if (globalThis.__enviarCorreoDePrueba) return globalThis.__enviarCorreoDePrueba({ para, asunto, html, texto });
  if (!process.env.RESEND_API_KEY) throw new ErrorApi(503, "El envío de correos aún no está configurado.");
  const respuesta = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from: process.env.CORREO_REMITENTE || "Kuyay <onboarding@resend.dev>",
      to: [para],
      subject: asunto,
      html,
      text: texto,
    }),
  });
  if (!respuesta.ok) {
    console.error("Resend:", respuesta.status, await respuesta.text().catch(() => ""));
    throw new ErrorApi(502, "No pudimos enviar el correo. Intenta en unos minutos.");
  }
}
