# Kuyay · Pastelería de autor

> Hecho con *kuyay*, horneado con calma.

Tienda en línea de una pastelería peruana, construida con **Bootstrap 6** y **JavaScript puro** (módulos ES).
Es el proyecto de la **Semana 10 de Diseño Web** (Unidad 3: Funciones y módulos).

**🌐 Sitio publicado:** https://g2w1n.github.io/Pasteleria/

*Kuyay* significa "amor" o "cariño" en quechua. La marca combina sabores peruanos (lúcuma, cacao, aguaymanto, maracuyá) con una presentación de pastelería de autor.

![Portada de Kuyay](docs/capturas/portada.jpg)

## Páginas

| Página | Archivo | Qué tiene |
|---|---|---|
| Inicio | `index.html` | Portada animada, cinta en movimiento, 4 favoritos, categorías, adelanto de la historia y llamado a diseñar una torta |
| Catálogo | `catalogo.html` | 16 productos, filtros, buscador sin tildes y orden. Los filtros quedan en la URL: `catalogo.html?categoria=tortas` se puede compartir |
| Nosotros | `nosotros.html` | Historia, cifras que suben al aparecer, valores y proceso con línea que se dibuja |
| Pedido especial | `pedido.html` | Torta personalizada en 4 pasos con precio y vista previa en vivo |
| Visítanos | `contacto.html` | Horario con "Abierto ahora" (hora de Lima), contacto y mapa |

En todas las páginas: menú (con la página actual marcada), carrito, modo oscuro y pie de página.

| Componente de Bootstrap 6 | Dónde |
|---|---|
| Navbar (`md:navbar-expand`) + Drawer | Menú de todas las páginas |
| Card, Badge, Nav pills, Form adorn | Catálogo y favoritos |
| Dialog (`<dialog>` nativo) | Detalle del producto |
| Drawer, List group, Toast | Carrito y avisos |
| Formularios, Radio, Check, validación, Alert | Pedido especial |
| Table, Badge | Horario |

![Inicio: favoritos y categorías](docs/capturas/inicio.jpg)

| Catálogo | Pedido especial |
|---|---|
| ![Catálogo con filtros](docs/capturas/catalogo.jpg) | ![Formulario de torta personalizada](docs/capturas/pedido.jpg) |
| **Nosotros** | **Visítanos** |
| ![Nosotros con cifras](docs/capturas/nosotros.jpg) | ![Horario y contacto](docs/capturas/contacto.jpg) |
| **Carrito** | **Detalle del producto** |
| ![Carrito con descuento](docs/capturas/carrito.jpg) | ![Detalle del producto](docs/capturas/detalle.jpg) |
| **Modo oscuro** | **Catálogo en modo oscuro** |
| ![Modo oscuro](docs/capturas/portada-oscuro.jpg) | ![Catálogo oscuro](docs/capturas/catalogo-oscuro.jpg) |

| Celular | Catálogo en celular | Menú en celular |
|---|---|---|
| <img src="docs/capturas/movil.jpg" alt="Inicio en celular" width="240"> | <img src="docs/capturas/movil-catalogo.jpg" alt="Catálogo en celular" width="240"> | <img src="docs/capturas/movil-menu.jpg" alt="Menú en celular" width="240"> |

## Animaciones y transiciones

Todas se desactivan si el sistema pide **reducir movimiento**, y ninguna oculta contenido si falta JavaScript.

| Efecto | Cómo está hecho |
|---|---|
| Transición entre páginas (el contenido se desliza, el menú queda fijo) | View Transitions API entre documentos: `@view-transition { navigation: auto }` en `estilos.css` |
| Tarjetas que se reacomodan al filtrar u ordenar | `document.startViewTransition()` + un `view-transition-name` único por tarjeta (`transicion()` en `animaciones.js`) |
| El producto "vuela" al carrito | Web Animations API: copia del dibujo que viaja en curva hasta el ícono (`volarAlCarrito()`) |
| Entrada escalonada de la portada y las cabeceras | `@keyframes` con `animation-delay` |
| Destellos que titilan y puntos que flotan | Animación CSS dentro del propio `hero-torta.svg` |
| Cinta de texto en movimiento (se pausa con el mouse) | Contenido duplicado que se desplaza al 50 % |
| Secciones que aparecen al hacer scroll | `IntersectionObserver` (`revelarAlScroll()`) |
| Cifras que suben y precios que "cuentan" | `requestAnimationFrame` con suavizado (`animarNumero()`) |
| Barra de progreso de lectura | CSS puro: `animation-timeline: scroll()` |
| Menú que se compacta al bajar, subrayado que crece, botones que se hunden al presionar, filas del carrito y avisos que entran deslizándose | Transiciones CSS y `@starting-style` |

![Producto volando al carrito](docs/capturas/vuelo.jpg)

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
├── index.html            ← Inicio
├── catalogo.html         ← Catálogo
├── nosotros.html         ← Nosotros
├── pedido.html           ← Diseña tu torta
├── contacto.html         ← Visítanos
├── css/
│   └── estilos.css       ← colores, tipografía y estilos de la marca
├── js/
│   ├── tienda.js         ← punto de entrada: inicia lo que cada página necesita
│   ├── componentes.js    ← carrito, avisos y detalle (comunes a todas las páginas)
│   ├── config.js         ← datos del negocio (WhatsApp, horario)
│   ├── tema.js           ← botón de modo claro / oscuro
│   ├── productos.js      ← los 16 productos y sus categorías
│   ├── ilustraciones.js  ← dibujos SVG de los productos
│   ├── catalogo.js       ← filtros, buscador, orden y detalle
│   ├── carrito.js        ← carrito, descuento, Toast y WhatsApp
│   ├── pedido.js         ← formulario de torta personalizada
│   └── animaciones.js    ← transiciones, vuelo al carrito, números y scroll
├── img/
│   ├── favicon.svg
│   ├── apple-touch-icon.png
│   ├── hero-torta.svg    ← ilustración propia de la portada
│   └── og-kuyay.png      ← imagen al compartir en redes (1200 × 630)
└── docs/capturas/        ← imágenes de este README
```

> El menú y el pie de página se repiten en cada HTML (es un sitio estático, sin servidor). El carrito, los avisos y el detalle de producto los inserta `js/componentes.js`, porque solo funcionan con JavaScript.

> Los datos del negocio (dirección, teléfono, correo) son **ficticios**, para fines académicos. El número de WhatsApp se cambia en `js/config.js`.

## Cómo ejecutarlo

Bootstrap 6 usa módulos ES, así que **no funciona abriendo el archivo con doble clic**.

1. Abre la carpeta en VS Code.
2. Clic derecho en `index.html` → **Open with Live Server**.

Requiere un navegador reciente (Chrome o Edge 130+, Firefox 132+, Safari 18+), igual que Bootstrap 6.

## Calidad

- **Accesibilidad:** auditada con [axe-core](https://github.com/dequelabs/axe-core) (el motor de Lighthouse) en las 5 páginas y en 7 estados interactivos (carrito abierto, detalle, aviso, errores y confirmación del pedido, menú móvil), en modo claro y oscuro: **0 problemas**. Para lograrlo se ajustaron tres colores de Bootstrap que no llegaban al contraste mínimo de 4.5:1 (verde de los botones de WhatsApp, verde de textos y gris terciario en modo oscuro). Además: navegación completa con teclado, enlace "Saltar al contenido", textos alternativos y mensajes de error asociados a cada campo.
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
- [x] **Fase 6:** Animaciones, auditoría de accesibilidad, SEO, imagen para redes y publicación
- [x] **Fase 7:** Sitio de 5 páginas, transiciones entre páginas, vuelo al carrito, filtros en la URL y más animaciones
