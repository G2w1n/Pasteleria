# Kuyay · Pastelería de autor

> Hecho con *kuyay*, horneado con calma.

Tienda en línea de una pastelería peruana, construida con **Bootstrap 6** y **JavaScript puro** (módulos ES).
Es el proyecto de la **Semana 10 de Diseño Web** (Unidad 3: Funciones y módulos).

*Kuyay* significa "amor" o "cariño" en quechua. La marca combina sabores peruanos (lúcuma, cacao, aguaymanto, maracuyá) con una presentación de pastelería de autor.

## Identidad visual

| Color | Uso | Hex |
|---|---|---|
| Mora andina | Color principal (`theme-primary`) | `#8e2c4e` |
| Lúcuma | Acento (`theme-accent`) | `#e0a03a` |
| Cacao | Texto | `#3a2420` |
| Crema | Fondo | `#fbf6ef` |

- **Títulos:** Fraunces (serif con carácter artesanal)
- **Texto:** Nunito Sans (legible en pantallas pequeñas)

Los colores se cambian **sin tocar Bootstrap**: `css/estilos.css` redefine las variables `--bs-primary-*` y `--bs-accent-*` dentro de la capa `@layer custom`, que Bootstrap 6 reserva para los estilos propios.

## Estructura

```
├── index.html      ← estructura + clases Bootstrap
├── css/
│   └── estilos.css ← colores y tipografía de la marca
├── js/
│   ├── tienda.js   ← punto de entrada: conecta todo
│   ├── config.js   ← datos del negocio (WhatsApp, horario)
│   └── tema.js     ← botón de modo claro / oscuro
└── img/
    ├── favicon.svg
    └── hero-torta.svg ← ilustración propia de la portada
```

> Los datos del negocio (dirección, teléfono, correo) son **ficticios**, para fines académicos. El número de WhatsApp se cambia en `js/config.js`.

## Cómo ejecutarlo

Bootstrap 6 usa módulos ES, así que **no funciona abriendo el archivo con doble clic**.

1. Abre la carpeta en VS Code.
2. Clic derecho en `index.html` → **Open with Live Server**.

## Avance

- [x] **Fase 1:** Base y marca: Bootstrap 6 por CDN, paleta, tipografía, favicon y SEO
- [x] **Fase 2:** Estructura: navbar, drawer, hero, "Nosotros", "Visítanos" (con estado *Abierto ahora* según la hora de Lima), footer y modo oscuro
- [ ] **Fase 3:** Catálogo: productos, filtros, buscador, ordenamiento y detalle
- [ ] **Fase 4:** Carrito: closure, recursividad, `localStorage`, descuento, Toast y WhatsApp
- [ ] **Fase 5:** Pedido especial: formulario con validación y precio en vivo
- [ ] **Fase 6:** Pulido y publicación en GitHub Pages

## Tecnologías

- [Bootstrap 6.0.0-alpha.1](https://getbootstrap.com/docs/6.0/) por CDN, con verificación SRI
- [Bootstrap Icons 1.13.1](https://icons.getbootstrap.com/)
- HTML5, CSS3 (variables, `@layer`, `light-dark()`) y JavaScript (módulos ES)
