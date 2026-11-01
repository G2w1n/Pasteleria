// =========================================================
// Cuenta regresiva: "Pide en las próximas 2 h 14 min y llega hoy".
// Usa la hora de Lima y las horas de corte de config.js (las mismas
// que revisa la API al confirmar). Se actualiza cada 30 segundos en
// todos los elementos con data-cuenta-regresiva.
// =========================================================
import { NEGOCIO } from "./config.js";

const DIAS = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };

function ahoraEnLima(fecha) {
  const partes = Object.fromEntries(
    new Intl.DateTimeFormat("en-US", { timeZone: NEGOCIO.zonaHoraria, weekday: "short", hour: "numeric", minute: "numeric", hourCycle: "h23" })
      .formatToParts(fecha).map((p) => [p.type, p.value]),
  );
  return { dia: DIAS[partes.weekday], minutos: Number(partes.hour) * 60 + Number(partes.minute) };
}

// Devuelve el texto (con <strong>) y si quedan pocos minutos
export function textoCuentaRegresiva(fecha = new Date()) {
  const { dia, minutos } = ahoraEnLima(fecha);
  const corte = (dia === 0 ? NEGOCIO.corteMismoDia.domingo : NEGOCIO.corteMismoDia.otrosDias) * 60;
  if (minutos >= corte) return { html: "Pide ahora y llega <strong>mañana</strong> desde las 9:00 a. m.", urgente: false };
  const faltan = corte - minutos;
  const horas = Math.floor(faltan / 60);
  const resto = faltan % 60;
  const tiempo = horas ? `${horas} h${resto ? ` ${resto} min` : ""}` : `${resto} min`;
  return { html: `Pide en las próximas <strong>${tiempo}</strong> y llega hoy`, urgente: faltan <= 60 };
}

export function iniciarCuentaRegresiva() {
  const elementos = document.querySelectorAll("[data-cuenta-regresiva]");
  if (!elementos.length) return;
  const pintar = () => {
    const { html, urgente } = textoCuentaRegresiva();
    for (const el of elementos) {
      el.querySelector(".cuenta-texto").innerHTML = html;
      el.classList.toggle("urgente", urgente);
      el.hidden = false;
    }
  };
  pintar();
  setInterval(pintar, 30000);
}
