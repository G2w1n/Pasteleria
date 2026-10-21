# Kuyay · Pastelería de autor

> Hecho con *kuyay*, horneado con calma.

Tienda en línea de una pastelería peruana, construida con **Bootstrap 6** y **JavaScript puro** (módulos ES).
Es el proyecto de la **Semana 10 de Diseño Web** (Unidad 3: Funciones y módulos).

**🌐 Sitio publicado:** https://g2w1n.github.io/Pasteleria/

*Kuyay* significa "amor" o "cariño" en quechua. La marca combina sabores peruanos (lúcuma, cacao, aguaymanto, maracuyá) con una presentación de pastelería de autor.

![Portada de Kuyay](docs/capturas/portada.jpg)

## Funcionalidades

| Sección | Qué hace | Componentes de Bootstrap 6 |
|---|---|---|
| Menú | Fijo arriba; en celular se abre como panel lateral. Resalta la sección actual | Navbar (`md:navbar-expand`), Drawer, ScrollSpy |
| Portada | Ilustración propia, beneficios y llamados a la acción | Grilla, Botones |
| Catálogo | 16 productos en 4 categorías, filtros, buscador sin tildes y orden por precio o nombre | Card, Badge, Nav pills, Form adorn |
| Detalle | Ventana con ingredientes, stock y selector de cantidad | Dialog (`<dialog>` nativo) |
| Carrito | Se guarda en el navegador; descuento de 10 % sobre S/ 100; pedido por WhatsApp | Drawer, List group, Toast |
| Pedido especial | Torta personalizada en 4 pasos con precio y vista previa en vivo | Formularios, Radio, Check, validación, Alert |
| Visítanos | Horario con "Abierto ahora" calculado con la hora de Lima, mapa y contacto | Table, Badge |
| Modo oscuro | Respeta el ajuste del sistema y recuerda la elección | `data-bs-theme` |

| Catálogo | Detalle del producto |
|---|---|
| ![Catálogo con filtros](docs/capturas/catalogo.jpg) | ![Detalle del producto](docs/capturas/detalle.jpg) |
| **Carrito** | **Pedido especial** |
| ![Carrito con descuento](docs/capturas/carrito.jpg) | ![Formulario de torta personalizada](docs/capturas/pedido.jpg) |

| Modo oscuro | Celular | Catálogo en celular |
|---|---|---|
| ![Modo oscuro](docs/capturas/portada-oscuro.jpg) | <img src="docs/capturas/movil.jpg" alt="Portada en celular" width="260"> | <img src="docs/capturas/movil-catalogo.jpg" alt="Catálogo en celular" width="260"> |

## Conceptos de la Semana 10 (funciones y módulos)

| Concepto | Dónde | Qué hace |
|---|---|---|
| Módulos ES (`import` / `export`) | todos los archivos de `js/` | Cada archivo tiene una sola responsabilidad; sus variables no son globales |
| Función flecha | `soles()` en `catalogo.js` | Da formato de moneda: `soles(89)` → `"S/ 89.00"` |
| Parámetro **rest** | `sumar(...numeros)` en `carrito.js` | Suma cualquier cantidad de montos: el subtotal del carrito y el precio de la torta personalizada (`calcularPrecio`) |
| Parámetro **por defecto** | `agregar(producto, cantidad = 1)`, `aplicarDescuento(total, porcentaje = 10)`, `filtrarProductos(lista, { categoria = "todos", … } = {})` | Si no se indica el valor, se usa uno razonable |
| **Recursividad** | `contarUnidades(lista)` en `carrito.js` | Caso base: lista vacía → 0. Si no: unidades del primero + `contarUnidades(resto)` |
| **Closure** | `crearCarrito()` en `carrito.js` | La lista `items` es privada; solo cambia con `agregar`, `quitar`, `vaciar`… |
| Desestructuración | `const [primero, ...resto] = lista` | Separa el primer elemento del resto en la recursión |
| Eventos personalizados | `kuyay:agregar` | El catálogo avisa y el carrito escucha, sin depender uno del otro |
| Delegación de eventos | `#grillaProductos`, `#carritoLista` | Un solo *listener* atiende todas las tarjetas y filas |

### Reto de la clase

| Pedido del reto | Cómo se resolvió |
|---|---|
| 4 productos de la categoría **Salados** | Empanada de carne, empanada de ají de gallina, pan con chicharrón y tequeños (`js/productos.js`) |
| `aplicarDescuento(total, porcentaje = 10)` cuando el subtotal supere S/ 100 | `js/carrito.js`, con barra de progreso que indica cuánto falta |
| Cambiar la paleta editando solo `--bs-primary-*` | `css/estilos.css`: mora andina como `primary` y lúcuma como `accent` |
| Reemplazar el aviso por un **Toast** | Toast de Bootstrap 6 al agregar productos, con botón "Ver carrito" |

## Identidad visual

| Color | Uso | Hex |
|---|---|---|
| Mora andina | Color principal (`theme-primary`) | `#8e2c4e` |
| Lúcuma | Acento (`theme-accent`) | `#e0a03a` |
| Cacao | Texto | `#3a2420` |
| Crema | Fondo | `#fbf6ef` |

- **Títulos:** Fraunces (serif con carácter artesanal)
- **Texto:** Nunito Sans (legible en pantallas pequeñas)

Los colores se cambian **sin tocar Bootstrap**. En `css/estilos.css`:

- Las **variables** (`--bs-primary-*`, `--bs-accent-*`) van **fuera** de toda capa, porque Bootstrap 6 define las suyas sin capa y una regla sin capa siempre gana a una que está en capa.
- Los **estilos propios** van en `@layer custom`, la capa que Bootstrap 6 reserva para nosotros: así las clases utilitarias (`p-5`, `fg-primary`…) siguen funcionando.

## Estructura

```
├── index.html            ← estructura + clases Bootstrap
├── css/
│   └── estilos.css       ← colores, tipografía y estilos de la marca
├── js/
│   ├── tienda.js         ← punto de entrada: conecta todo
│   ├── config.js         ← datos del negocio (WhatsApp, horario)
│   ├── tema.js           ← botón de modo claro / oscuro
│   ├── productos.js      ← los 16 productos y sus categorías
│   ├── ilustraciones.js  ← dibujos SVG de los productos
│   ├── catalogo.js       ← filtros, buscador, orden y detalle
│   ├── carrito.js        ← carrito, descuento, Toast y WhatsApp
│   ├── pedido.js         ← formulario de torta personalizada
│   └── animaciones.js    ← aparición suave al hacer scroll
├── img/
│   ├── favicon.svg
│   ├── apple-touch-icon.png
│   ├── hero-torta.svg    ← ilustración propia de la portada
│   └── og-kuyay.png      ← imagen al compartir en redes (1200 × 630)
└── docs/capturas/        ← imágenes de este README
```

> Los datos del negocio (dirección, teléfono, correo) son **ficticios**, para fines académicos. El número de WhatsApp se cambia en `js/config.js`.

## Cómo ejecutarlo

Bootstrap 6 usa módulos ES, así que **no funciona abriendo el archivo con doble clic**.

1. Abre la carpeta en VS Code.
2. Clic derecho en `index.html` → **Open with Live Server**.

Requiere un navegador reciente (Chrome o Edge 130+, Firefox 132+, Safari 18+), igual que Bootstrap 6.

## Calidad

- **Accesibilidad:** auditada con [axe-core](https://github.com/dequelabs/axe-core) (el motor de Lighthouse) en 6 estados de la página (inicio, errores del formulario, carrito, detalle, aviso y menú móvil), en modo claro y oscuro: **0 problemas**. Además: navegación completa con teclado, enlace "Saltar al contenido", textos alternativos y mensajes de error asociados a cada campo.
- **Movimiento reducido:** si el sistema lo pide, no hay animaciones.
- **Sin JavaScript:** se muestra un aviso con el WhatsApp y el contenido sigue visible.
- **Rendimiento:** sin imágenes pesadas (ilustraciones SVG), mapa con `loading="lazy"`, fuentes con `display=swap`, Bootstrap y los íconos por CDN con verificación SRI.
- **SEO:** `meta description`, URL canónica, Open Graph con imagen, y datos estructurados `Bakery` (horario y dirección) para Google.

## Publicar en GitHub Pages

1. En el repositorio: **Settings → Pages**.
2. En *Build and deployment*, elige **Deploy from a branch**, rama `main`, carpeta `/ (root)` y guarda.
3. En uno o dos minutos el sitio queda en https://g2w1n.github.io/Pasteleria/

El archivo `.nojekyll` le indica a GitHub que publique los archivos tal cual.

## Fotos de los productos

Cada producto se muestra con una **ilustración SVG** generada por `js/ilustraciones.js`
(8 formas que cambian de color según el producto). Para usar una foto real:

1. Guarda la foto en `img/productos/` (de preferencia en `.webp`, 800 × 600 px).
2. En `js/productos.js`, agrega a ese producto la línea `foto: "img/productos/nombre.webp",`.

## Tecnologías

- [Bootstrap 6.0.0-alpha.1](https://getbootstrap.com/docs/6.0/) por CDN, con verificación SRI
- [Bootstrap Icons 1.13.1](https://icons.getbootstrap.com/)
- HTML5, CSS3 (variables, `@layer`, `light-dark()`, `:has()`, container queries de Bootstrap) y JavaScript (módulos ES, `IntersectionObserver`, `Intl`)
- Fuentes: [Fraunces](https://fonts.google.com/specimen/Fraunces) y [Nunito Sans](https://fonts.google.com/specimen/Nunito+Sans)

## Avance

- [x] **Fase 1:** Base y marca: Bootstrap 6 por CDN, paleta, tipografía, favicon y SEO
- [x] **Fase 2:** Estructura: navbar, drawer, hero, "Nosotros", "Visítanos", footer y modo oscuro
- [x] **Fase 3:** Catálogo: 16 productos, filtros, buscador, ordenamiento y detalle
- [x] **Fase 4:** Carrito: closure, recursividad, `localStorage`, descuento, Toast y WhatsApp
- [x] **Fase 5:** Pedido especial: formulario en 4 pasos con validación y precio en vivo
- [x] **Fase 6:** Animaciones, ScrollSpy, auditoría de accesibilidad, SEO, imagen para redes y publicación
