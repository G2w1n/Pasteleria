# Kuyay · React (Semana 11)

Los componentes React de la tienda, con la **estructura de la práctica**.
Se usan de dos formas:

1. **Dentro de la tienda principal** (Bootstrap 6 + Neon): el catálogo, el buscador,
   las reseñas, el seguimiento, "Hoy en Kuyay" y el panel los dibuja React.
   Son "islas": React solo donde hay interacción; el resto sigue siendo Bootstrap.
2. **Como la práctica completa** con `npm run dev` (index + catálogo + contador del carrito).

## Cómo ejecutarlo

Requisito: Node.js 20.19+ o 22.12+ (`node -v`).

```bash
cd tienda-react
npm install
npm run dev        # práctica en http://localhost:5173
npm run build      # compila las islas en ../js/react/ (lo que usa la tienda)
```

> Después de cambiar un componente, corre `npm run build` y haz commit: así Vercel publica el cambio.

## Estructura (la de la práctica)

```
tienda-react/
├── index.html            ← lang="es", título, Bootstrap 6
├── package.json
├── vite.config.js        ← islas + proxy de /api a Vercel
├── public/
│   └── img/              ← imágenes del catálogo (16 productos + sin-imagen.svg)
└── src/
    ├── main.jsx          ← monta App (página de práctica)
    ├── index.css         ← vacío
    ├── App.jsx           ← el carrito vive aquí (estado elevado)
    ├── App.css           ← estilos, transiciones y animaciones de los componentes
    ├── data/
    │   └── productos.js  ← los productos (luego vienen de Neon)
    ├── components/
    │   ├── ProductoCard.jsx  ← tarjeta (props)
    │   ├── Catalogo.jsx      ← filtros, buscador y orden (estado)
    │   ├── Encabezado.jsx    ← contador del carrito
    │   ├── Carrito.jsx       ← drawer del carrito (práctica)
    │   ├── ProductoDetalle.jsx
    │   ├── Buscador.jsx      ← buscador del menú (combobox)
    │   ├── Resenas.jsx       ← reseñas con estrellas
    │   ├── Seguimiento.jsx   ← sigue tu pedido sin cuenta
    │   ├── EnVivo.jsx        ← "Hoy en Kuyay" en el Inicio
    │   └── panel/            ← PanelAdmin, Resumen, Pedidos, Productos, Usuarios, ResenasAdmin, GraficoBarras
    ├── hooks/            ← useLocalStorage, useDialogo
    ├── utilidades.js
    └── islas/            ← puntos de montaje dentro de la tienda Bootstrap
        ├── catalogo.jsx  ← catalogo.html
        ├── buscador.jsx  ← menú de todas las páginas
        ├── resenas.jsx   ← detalle del producto
        ├── seguimiento.jsx ← cuenta.html
        ├── envivo.jsx    ← index.html
        └── panel.jsx     ← admin.html
```

## Lista de cotejo

| Criterio | Dónde está |
|---|---|
| **Proyecto corre** | `npm run dev` (Vite) |
| **Imágenes** | `public/img/` y `img/productos/` de la tienda, con `onError` → `sin-imagen.svg` |
| **Props** | `ProductoCard` recibe `producto`, `onAgregar`, `onVerDetalle`, `onFavorito`; `Encabezado` recibe `cantidad` |
| **Estado** | `Catalogo.jsx`: `useState` de filtros; la lista visible es estado derivado (`filter` + `toSorted`) |
| **Orden** | Destacados, precio menor/mayor, nombre A–Z y mejor valorados |
| **Carrito** | Vive en `App.jsx`; el contador salta con `key={cantidad}` |

**Extensiones opcionales:** Vaciar carrito · carrito guardado con `useEffect` + `localStorage` · "Agotado" con el botón deshabilitado.

## Lo que agrega el catálogo React a la tienda

- Filtros por **categoría** (pastilla que se desliza), **precio** (Range), **alérgenos** (Chips) y **solo disponibles** (Switch).
- **Chips de filtros activos** que se quitan con un clic, y "Limpiar todo".
- **Favoritos** ❤ guardados en el navegador, con su propia pestaña.
- **Vista grilla o lista** y **Cargar más** con barra de progreso.
- **Vistos recientemente**, y los filtros quedan en la URL para compartirlos.
- **Esqueleto** (Placeholder) mientras carga, y transiciones al filtrar (View Transitions).
- Se conecta con la tienda: el **carrito**, el **detalle** y el **checkout con Neon** son los mismos de Bootstrap.
