// =========================================================
// Datos del negocio. Si cambia el teléfono o el horario,
// se edita solo aquí y se actualiza en toda la página.
// =========================================================

export const NEGOCIO = {
  nombre: "Kuyay",
  // Número de EJEMPLO: reemplázalo por el real (código de país sin "+")
  whatsapp: "51987654321",
  zonaHoraria: "America/Lima",
  // Horario por día de la semana: 0 = domingo ... 6 = sábado.
  // Cada día es [hora de apertura, hora de cierre] en formato 24 h.
  horario: {
    0: [9, 14],
    1: [8, 20],
    2: [8, 20],
    3: [8, 20],
    4: [8, 20],
    5: [8, 20],
    6: [8, 21],
  },
  // Hasta qué hora (Lima) se puede pedir para que llegue el mismo día.
  // Son las mismas horas de corte que revisa la API (api/pedidos.js): franja de la
  // tarde hasta las 5 p. m.; los domingos solo hay franja de la mañana, hasta las 11 a. m.
  corteMismoDia: { domingo: 11, otrosDias: 17 },
};
