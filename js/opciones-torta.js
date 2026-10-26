// =========================================================
// Opciones y precios de la torta personalizada.
// Lo usan la página (js/pedido.js) y la API (api/pedidos-especiales.js).
// Es JavaScript puro, sin Bootstrap ni DOM, para funcionar en ambos lados.
// "color" se usa para pintar la torta viva del pedido.
// =========================================================

export const TAMANOS = [
  { id: "mini", nombre: "Mini", detalle: "6 porciones", precio: 65 },
  { id: "mediana", nombre: "Mediana", detalle: "12 porciones", precio: 110 },
  { id: "grande", nombre: "Grande", detalle: "20 porciones", precio: 170 },
  { id: "fiesta", nombre: "Fiesta", detalle: "30 porciones · 2 pisos", precio: 240 },
];
export const BIZCOCHOS = [
  { id: "vainilla", nombre: "Vainilla", precio: 0, color: "#f6e4c3" },
  { id: "chocolate", nombre: "Cacao 70 %", precio: 10, color: "#5a352c" },
  { id: "lucuma", nombre: "Lúcuma", precio: 8, color: "#f0c27a" },
  { id: "red-velvet", nombre: "Red velvet de betarraga", precio: 12, color: "#9b2335" },
];
export const RELLENOS = [
  { id: "manjar", nombre: "Manjar blanco", precio: 0, color: "#c98a4b" },
  { id: "fudge", nombre: "Fudge de chocolate", precio: 0, color: "#3a2420" },
  { id: "crema-lucuma", nombre: "Crema de lúcuma", precio: 8, color: "#e9a23b" },
  { id: "maracuya", nombre: "Mousse de maracuyá", precio: 6, color: "#f2b705" },
  { id: "frutos-rojos", nombre: "Frutos rojos", precio: 10, color: "#b3264f" },
];
export const COBERTURAS = [
  { id: "chantilly", nombre: "Chantilly", precio: 0, color: "#fffaf2" },
  { id: "buttercream", nombre: "Buttercream de mora", precio: 8, color: "#d98fb0" },
  { id: "ganache", nombre: "Ganache de cacao", precio: 10, color: "#4a2a22" },
  { id: "fondant", nombre: "Fondant decorado", precio: 25, color: "#f8e6ec" },
];
export const EXTRAS = [
  { id: "topper", nombre: "Topper personalizado", precio: 18 },
  { id: "flores", nombre: "Flores comestibles", precio: 15 },
  { id: "aguaymanto", nombre: "Aguaymantos frescos", precio: 10 },
  { id: "foto", nombre: "Foto comestible", precio: 25 },
  { id: "velas", nombre: "Velas y número", precio: 6 },
];

export const PRECIO_REGALO = 8; // tarjeta con dedicatoria y caja de regalo

const precioDe = (lista, id) => {
  const opcion = lista.find((op) => op.id === id);
  if (!opcion) throw new Error(`Opción no válida: ${id}`);
  return opcion.precio;
};

// Precio de una torta (lanza un error si alguna opción no existe)
export function precioTorta({ tamano, bizcocho, relleno, cobertura, extras = [], regalo = false }) {
  return (
    precioDe(TAMANOS, tamano) +
    precioDe(BIZCOCHOS, bizcocho) +
    precioDe(RELLENOS, relleno) +
    precioDe(COBERTURAS, cobertura) +
    extras.reduce((total, id) => total + precioDe(EXTRAS, id), 0) +
    (regalo ? PRECIO_REGALO : 0)
  );
}
