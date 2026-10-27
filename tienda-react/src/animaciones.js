// src/animaciones.js
// La foto del producto "vuela" desde el botón hasta el carrito (Web Animations API).
// No pasa por el estado de React: es un efecto visual que se borra al terminar.

export function volarAlCarrito(boton, imagen) {
  const destino = document.querySelector(".carrito b");
  if (!boton || !destino || matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  const desde = boton.getBoundingClientRect();
  const hasta = destino.getBoundingClientRect();
  const foto = document.createElement("img");
  foto.src = imagen;
  foto.alt = "";
  foto.className = "volando";
  document.body.append(foto);

  const x = hasta.left + hasta.width / 2 - (desde.left + desde.width / 2);
  const y = hasta.top + hasta.height / 2 - (desde.top + desde.height / 2);
  foto.style.left = `${desde.left + desde.width / 2 - 40}px`;
  foto.style.top = `${desde.top + desde.height / 2 - 30}px`;

  foto
    .animate(
      [
        { transform: "translate(0, 0) scale(1)", opacity: 1 },
        { transform: `translate(${x * 0.5}px, ${y - 80}px) scale(.7)`, opacity: 1, offset: 0.5 },
        { transform: `translate(${x}px, ${y}px) scale(.15)`, opacity: 0.3 },
      ],
      { duration: 700, easing: "cubic-bezier(.5, 0, .6, 1)" },
    )
    .finished.finally(() => foto.remove());
}
