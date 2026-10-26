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
| Inicio | `index.html` | Portada con la torta que se arma sola, cinta en movimiento, 4 favoritos, categorías, adelanto de la historia, **reseñas de clientes** y llamado a diseñar una torta |
| Catálogo | `catalogo.html` | 16 productos, filtros, buscador sin tildes y orden. Los filtros quedan en la URL: `catalogo.html?categoria=tortas` se puede compartir |
| Nosotros | `nosotros.html` | Historia, cifras que suben al aparecer, valores y proceso con línea que se dibuja |
| Pedido especial | `pedido.html` | Torta personalizada en 4 pasos con precio y vista previa en vivo |
| Visítanos | `contacto.html` | Horario con "Abierto ahora" (hora de Lima), contacto, mapa y **preguntas frecuentes** |
| Mi cuenta | `cuenta.html` | Ingresar / crear cuenta y **seguimiento de mis pedidos** (requiere la API en Vercel) |
| Error 404 | `404.html` | "Esta torta no existe… todavía": GitHub Pages la muestra en cualquier dirección que no exista |

En todas las páginas: menú (con la página actual marcada), carrito, modo oscuro y pie de página.

| Componente de Bootstrap 6 | Dónde |
|---|---|
| Navbar (`md:navbar-expand`) + Drawer | Menú de todas las páginas |
| Card, Badge, Nav pills, Form adorn | Catálogo y favoritos |
| Dialog (`<dialog>` nativo) | Detalle del producto |
| Drawer, List group, Toast | Carrito y avisos |
| Formularios, Radio, Check, validación, Alert | Pedido especial |
| Table, Badge | Horario |
| Carousel (con pausa y avance automático) | Reseñas de clientes |
| Accordion (`<details>` nativo, una pregunta abierta a la vez) | Preguntas frecuentes |
| **Nav underline + Tab** (pestañas) | Detalle del producto: *Descripción · Ingredientes · Alérgenos* |
| **Popover** | "¿Cómo conservarlo?" en el detalle, con un texto distinto por categoría |
| **Tooltip** | Ingredientes peruanos explicados (lúcuma, aguaymanto, sal de Maras…), botones flotantes |
| **Datepicker** (calendario incluido en Bootstrap 6) | Fecha de entrega: bloquea los días con menos de 2 o más de 60 días de anticipación |
| **Stepper** | Pasos del pedido: el actual late y los completos se convierten en ✓ |
| **Switch** | "¿Es un regalo?": suma S/ 8 y muestra la dedicatoria |
| **Form floating** + **Strength** (medidor de contraseña) + Spinner | Confirmar pedido y Mi cuenta |
| **Stepper** + Badge | Seguimiento de cada pedido en "Mis pedidos" |

![Inicio: favoritos y categorías](docs/capturas/inicio.jpg)

| Catálogo | Pedido especial |
|---|---|
| ![Catálogo con filtros](docs/capturas/catalogo.jpg) | ![Formulario de torta personalizada](docs/capturas/pedido.jpg) |
| **Nosotros** | **Visítanos** |
| ![Nosotros con cifras](docs/capturas/nosotros.jpg) | ![Horario y contacto](docs/capturas/contacto.jpg) |
| **Carrito** | **Detalle del producto** |
| ![Carrito con descuento](docs/capturas/carrito.jpg) | ![Detalle del producto](docs/capturas/detalle.jpg) |
| **Reseñas** | **Preguntas frecuentes** |
| ![Carrusel de reseñas](docs/capturas/resenas.jpg) | ![Preguntas frecuentes](docs/capturas/faq.jpg) |
| **Página 404** | **Modo oscuro** |
| ![Página 404](docs/capturas/404.jpg) | ![Modo oscuro](docs/capturas/portada-oscuro.jpg) |
| **Confirmar pedido** (se guarda en Neon) | **Pedido recibido** |
| ![Confirmar pedido](docs/capturas/checkout.jpg) | ![Pedido recibido con su código](docs/capturas/checkout-listo.jpg) |
| **Mi cuenta: seguimiento de pedidos** | **Crear cuenta** |
| ![Mis pedidos](docs/capturas/cuenta.jpg) | ![Crear cuenta](docs/capturas/cuenta-registro.jpg) |
| **Catálogo en modo oscuro** | |
| ![Catálogo oscuro](docs/capturas/catalogo-oscuro.jpg) | |

| Celular | Catálogo en celular | Menú en celular |
|---|---|---|
| <img src="docs/capturas/movil.jpg" alt="Inicio en celular" width="240"> | <img src="docs/capturas/movil-catalogo.jpg" alt="Catálogo en celular" width="240"> | <img src="docs/capturas/movil-menu.jpg" alt="Menú en celular" width="240"> |

## Animaciones y transiciones

Todas se desactivan si el sistema pide **reducir movimiento**, y ninguna oculta contenido si falta JavaScript.

| Efecto | Cómo está hecho |
|---|---|
| **La torta de la portada se arma sola:** cae la bandeja, luego los tres pisos (con un leve aplastamiento al aterrizar) y al final saltan las frutas | Animaciones CSS dentro de `hero-torta.svg`, con retrasos escalonados |
| **"sabor a Perú" subrayado a mano** | Trazo SVG que se dibuja con `stroke-dashoffset` |
| **Parallax:** la torta y el texto de la portada se mueven a distinta velocidad al hacer scroll | CSS puro: `animation-timeline: scroll()` |
| **Modo oscuro en círculo:** el nuevo tema se expande desde el botón | View Transition con `clip-path: circle()` sobre `::view-transition-new(root)` (`tema.js`) |
| **El detalle crece desde la tarjeta** | View Transition: la tarjeta y la ventana comparten un `view-transition-name` (`abrirDetalle()`) |
| **Tarjetas 3D** que se inclinan con el mouse, con reflejo de luz | Variables CSS `--rx`, `--ry` actualizadas con `pointermove` (solo en computadora) |
| **Confeti** al superar S/ 100 en el carrito y al confirmar un pedido | Web Animations API, piezas con los colores de la marca (`confeti()`) |
| **"Agregar" → "✓ Agregado"** por un momento | Cambio de clase y animación del ícono |
| **Torta viva en el pedido:** crece con el tamaño, en "Fiesta" cae un segundo piso, los extras aparecen sobre ella (velas con llama que parpadea, flores, topper, aguaymantos, foto) y el mensaje se escribe en el frente | SVG dibujado una sola vez; cada cambio actualiza variables CSS y clases, y CSS anima la transición (`torta-viva.js`) |
| **Palabras que rotan:** "sabor a Perú → lúcuma → cacao → maracuyá" | Animación 3D en CSS; el ancho de la línea se ajusta suavemente (`palabrasRotativas()`) |
| **Chocolate que gotea** sobre el pie de página | SVG con gotas que se estiran y caen |
| **Pastilla deslizante** en los filtros del catálogo | Un elemento que se mueve hasta el filtro activo con `transform` |
| **Volver arriba** con el borde que se llena según el scroll, y **WhatsApp flotante** que late, con burbuja "¿Te ayudamos?" | `stroke-dashoffset` y animaciones CSS (`botonesFlotantes()`) |
| **Carrito que se sacude** al recibir un producto, y filas que salen una por una al vaciarlo | Animación CSS y Web Animations API |
| **Línea de tiempo** en Nosotros que se dibuja al hacer scroll | CSS puro: `animation-timeline: view()` |
| **Sorpresa:** escribe "kuyay" en cualquier página (o haz 5 clics en la torta de la portada) | Lluvia de cupcakes (`lluviaDeCupcakes()`) |
| Transición entre páginas (el contenido se desliza, el menú queda fijo) | View Transitions API entre documentos: `@view-transition { navigation: auto }` en `estilos.css` |
| Tarjetas que se reacomodan al filtrar u ordenar | `document.startViewTransition()` + un `view-transition-name` único por tarjeta (`transicionConTipo()` en `animaciones.js`) |
| El producto "vuela" al carrito | Web Animations API: copia del dibujo que viaja en curva hasta el ícono (`volarAlCarrito()`) |
| Entrada escalonada de la portada y las cabeceras | `@keyframes` con `animation-delay` |
| Destellos que titilan y puntos que flotan | Animación CSS dentro del propio `hero-torta.svg` |
| Cinta de texto en movimiento (se pausa con el mouse) | Contenido duplicado que se desplaza al 50 % |
| Secciones que aparecen al hacer scroll | `IntersectionObserver` (`revelarAlScroll()`) |
| Cifras que suben y precios que "cuentan" | `requestAnimationFrame` con suavizado (`animarNumero()`) |
| Barra de progreso de lectura | CSS puro: `animation-timeline: scroll()` |
| Menú que se compacta al bajar, subrayado que crece, botones que se hunden al presionar, filas del carrito y avisos que entran deslizándose | Transiciones CSS y `@starting-style` |

![La torta armándose piso por piso](docs/capturas/torta-armandose.jpg)

| Modo oscuro en círculo | Detalle que crece desde la tarjeta |
|---|---|
| ![Cambio de tema en círculo](docs/capturas/tema-circulo.jpg) | ![Detalle creciendo](docs/capturas/detalle-creciendo.jpg) |
| **Torta viva del pedido (Stepper, Switch)** | **Calendario (Datepicker)** |
| ![Torta viva con dos pisos, velas y topper](docs/capturas/pedido-vivo.jpg) | ![Calendario de Bootstrap 6](docs/capturas/calendario.jpg) |
| **Pestañas y Popover en el detalle** | **Chocolate que gotea** |
| ![Popover de conservación](docs/capturas/detalle-popover.jpg) | ![Pie de página con chocolate](docs/capturas/pie-chocolate.jpg) |
| **Producto volando al carrito** | **Confeti y "✓ Agregado"** |
| ![Producto volando al carrito](docs/capturas/vuelo.jpg) | ![Confeti al alcanzar el descuento](docs/capturas/confeti.jpg) |

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
├── cuenta.html           ← Mi cuenta (ingresar, registro y mis pedidos)
├── 404.html              ← página de error personalizada
├── api/                  ← funciones de Vercel (el "servidor")
│   ├── _lib/             ← conexión a Neon, sesiones y respuestas
│   ├── productos.js      ← GET catálogo y costos de delivery
│   ├── auth.js           ← registro, ingreso y salida
│   ├── pedidos.js        ← crear pedido / mis pedidos
│   └── pedidos-especiales.js ← guardar una torta personalizada
├── sql/                  ← tablas, datos y reportes para Neon
├── package.json          ← dependencias de la API
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
│   ├── opciones-torta.js ← tamaños, sabores y precios (los usa también la API)
│   ├── api.js            ← conexión con la API; si no responde, usa productos.js
│   ├── cuenta.js         ← página "Mi cuenta"
│   ├── torta-viva.js     ← vista previa animada de la torta del pedido
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

- **Accesibilidad:** auditada con [axe-core](https://github.com/dequelabs/axe-core) (el motor de Lighthouse) en las 7 páginas y en 20 estados interactivos (incluye confirmar pedido, pedido recibido, registro con error y "Mis pedidos") (carrito abierto, detalle, pestañas con tooltip, popover, calendario abierto, regalo activado, aviso, burbuja de WhatsApp, errores y confirmación del pedido, pregunta frecuente abierta, reseñas en pausa, menú móvil), en modo claro y oscuro: **0 problemas**. El carrusel de reseñas tiene botón de pausa (WCAG 2.2.2) y se puede recorrer con el teclado. Para lograrlo se ajustaron tres colores de Bootstrap que no llegaban al contraste mínimo de 4.5:1 (verde de los botones de WhatsApp, verde de textos y gris terciario en modo oscuro). Además: navegación completa con teclado, enlace "Saltar al contenido", textos alternativos y mensajes de error asociados a cada campo.
- **Movimiento reducido:** si el sistema lo pide, no hay animaciones.
- **Sin JavaScript:** se muestra un aviso con el WhatsApp y el contenido sigue visible.
- **Rendimiento:** sin imágenes pesadas (ilustraciones SVG), mapa con `loading="lazy"`, fuentes con `display=swap`, Bootstrap y los íconos por CDN con verificación SRI.
- **SEO:** `meta description`, URL canónica, Open Graph con imagen, y datos estructurados `Bakery` (horario y dirección) para Google.

## Publicar en GitHub Pages

1. En el repositorio: **Settings → Pages**.
2. En *Build and deployment*, elige **Deploy from a branch**, rama `main`, carpeta `/ (root)` y guarda.
3. En uno o dos minutos el sitio queda en https://g2w1n.github.io/Pasteleria/

El archivo `.nojekyll` le indica a GitHub que publique los archivos tal cual.

## Base de datos (Neon · PostgreSQL)

Los archivos están en la carpeta `sql/` y se ejecutan **en orden** en el *SQL Editor* de Neon:

| Archivo | Qué hace |
|---|---|
| `01-esquema.sql` | Crea las tablas, las reglas automáticas y las vistas de reportes. **Borra todo lo anterior** si se vuelve a ejecutar |
| `02-datos.sql` | Carga las 4 categorías, los 16 productos de la web, la configuración del negocio y el cupón `KUYAY10` |
| `03-datos-demo.sql` | *(Opcional)* 6 clientes y ~300 ventas de los últimos 90 días para que los reportes muestren datos |

**Tablas:** `usuarios` (con rol: cliente, empleado o administrador), `direcciones`, `categorias`, `productos`, `cupones`, `pedidos`, `pedido_detalle`, `historial_estados`, `pedidos_especiales`, `movimientos_stock`, `resenas` y `configuracion`.

**Reglas que cumple la propia base de datos:**
- Vender descuenta el stock y **no permite vender más de lo que hay** (la venta se cancela completa).
- Cancelar un pedido **devuelve los productos al stock**.
- Cada cambio de estado queda en el historial, con quién lo hizo.
- El correo es único (sin importar mayúsculas), el celular debe tener 9 dígitos y empezar con 9, un delivery exige dirección, y las tortas personalizadas de domingo solo se entregan en la mañana.
- Las contraseñas **nunca** se guardan: solo su hash (bcrypt), que calcula la API.

**Vistas de reportes:** `reporte_resumen`, `reporte_ventas_diarias`, `reporte_ventas_mensuales`, `reporte_productos`, `reporte_categorias`, `reporte_distritos`, `reporte_horas`, `reporte_clientes` y `reporte_stock_bajo`.

> La cadena de conexión de Neon vive **solo** en las variables de entorno de Vercel (`DATABASE_URL`). Nunca se escribe en el código ni se sube a GitHub.

## API en Vercel (conecta la página con Neon)

La carpeta `api/` tiene funciones que Vercel ejecuta como servidor. La página las llama con `fetch` desde `js/api.js`.

| Ruta | Qué hace |
|---|---|
| `GET /api/productos` | Catálogo y **stock real** desde la base de datos, y el costo de delivery por distrito |
| `POST /api/auth?accion=registro` · `login` · `salir` | Cuentas de cliente. La sesión es una cookie `HttpOnly` (JavaScript no puede leerla) |
| `GET /api/auth` | Usuario que inició sesión |
| `POST /api/pedidos` | Guarda el pedido del carrito, descuenta el stock y devuelve su código (`KY-000123`) |
| `GET /api/pedidos` | "Mis pedidos" con su estado |
| `POST /api/pedidos-especiales` | Guarda la torta personalizada y devuelve su código (`TP-00012`) |

**Qué cambia en la página cuando la API responde:**
- El catálogo muestra los productos y el stock de Neon (si se agota algo, se ve "Agotado").
- En el carrito aparece **Confirmar pedido**: nombre, celular, recojo o delivery por distrito, método de pago (Yape, Plin, efectivo o tarjeta) y total con delivery. El pedido queda guardado con un código y se puede avisar por WhatsApp.
- Aparece el botón de **Mi cuenta** (saluda con tu nombre) y la página `cuenta.html`.
- La torta personalizada se guarda y recibe un código.

**Seguridad:** el servidor recalcula precios, descuento y delivery (no confía en lo que mande el navegador), las contraseñas se guardan con bcrypt y la sesión es un JWT firmado en una cookie `HttpOnly`.

**Si la API no responde** (Live Server o GitHub Pages), la página funciona igual que antes: catálogo de `js/productos.js` y pedidos por WhatsApp.

### Configurar Vercel

1. En Vercel: **Settings → Environment Variables** y crea:
   - `DATABASE_URL`: la cadena de conexión de Neon (*Connection string*).
   - `JWT_SECRET`: un texto secreto largo (mínimo 32 caracteres) para firmar las sesiones.
2. **Redeploy** para que tome las variables.
3. Abre `https://tu-proyecto.vercel.app/api/productos`: si ves los productos en JSON, la conexión funciona.

### Crear el primer administrador

1. Crea tu cuenta en `cuenta.html`.
2. En el SQL Editor de Neon ejecuta (con tu correo):
   ```sql
   update usuarios set rol = 'administrador' where lower(correo) = lower('tu@correo.com');
   ```

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
- Base de datos [Neon](https://neon.tech) (PostgreSQL) y funciones de [Vercel](https://vercel.com) en Node.js, con `@neondatabase/serverless`, `bcryptjs` y `jose`

## Avance

- [x] **Fase 1:** Base y marca: Bootstrap 6 por CDN, paleta, tipografía, favicon y SEO
- [x] **Fase 2:** Estructura: navbar, drawer, hero, "Nosotros", "Visítanos", footer y modo oscuro
- [x] **Fase 3:** Catálogo: 16 productos, filtros, buscador, ordenamiento y detalle
- [x] **Fase 4:** Carrito: closure, recursividad, `localStorage`, descuento, Toast y WhatsApp
- [x] **Fase 5:** Pedido especial: formulario en 4 pasos con validación y precio en vivo
- [x] **Fase 6:** Animaciones, auditoría de accesibilidad, SEO, imagen para redes y publicación
- [x] **Fase 7:** Sitio de 5 páginas, transiciones entre páginas, vuelo al carrito, filtros en la URL y más animaciones
- [x] **Fase 8:** Torta que se arma sola, modo oscuro en círculo, detalle que crece, tarjetas 3D, confeti, parallax, reseñas, preguntas frecuentes y página 404
- [x] **Fase 9:** Switch, pestañas, Popover, Tooltip, Datepicker y Stepper de Bootstrap 6; torta viva, palabras que rotan, chocolate que gotea, filtros deslizantes, botones flotantes, línea de tiempo y sorpresa
- [x] **Fase 10:** Base de datos en Neon y API en Vercel: catálogo con stock real, confirmar pedido, cuentas de cliente, "Mis pedidos" con seguimiento y tortas guardadas con código
