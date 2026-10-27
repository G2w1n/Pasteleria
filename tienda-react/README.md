# Kuyay · Tienda React (Semana 11)

Catálogo de Kuyay hecho con **React 19 + Vite**: imágenes, filtros, buscador, orden y carrito.
Publicado en **https://pasteleria-three-steel.vercel.app/react/**

## Cómo ejecutarlo

Requisito: Node.js 20.19+ o 22.12+ (`node -v`).

```bash
cd tienda-react
npm install
npm run dev        # http://localhost:5173
```

Para publicar los cambios: `npm run build`. Esto actualiza la carpeta `../react/`, que es la que sirve Vercel. Luego haz commit y push.

## Lista de cotejo

| Criterio | Dónde está |
|---|---|
| **Proyecto corre** | `npm run dev` (Vite) |
| **Imágenes** | `public/img/` (16 productos + `sin-imagen.svg`), con `onError` en `ProductoCard.jsx` |
| **Props** | `ProductoCard` recibe `producto`, `onAgregar`, `onVerDetalle`; `Encabezado` recibe `cantidad` |
| **Estado** | `Catalogo.jsx`: `useState` para categoría, búsqueda, orden y "solo disponibles"; la lista visible es estado derivado |
| **Orden** | Precio menor/mayor y nombre A → Z (`toSorted`) |
| **Carrito** | Vive en `App.jsx` (estado elevado), el contador del encabezado salta con `key={cantidad}` |

**Extensiones opcionales (todas hechas):** Vaciar carrito · carrito guardado con `useEffect` + `localStorage` (hook `useLocalStorage`) · "Agotado" con el botón deshabilitado.

## Además de lo que pide la práctica

- **Datos en vivo desde Neon:** `hooks/useProductos.js` pide `/api/productos` (Vercel + Neon). Si no responde, usa `src/data/productos.js`. Mientras carga, se ven tarjetas "esqueleto".
- **Carrito completo** en un panel lateral (`<dialog>`): cantidades + / −, respeta el stock, 10 % de descuento sobre S/ 100 con barra de avance, y pedido por WhatsApp.
- **Detalle del producto** en una ventana: ingredientes, alérgenos y cantidad.
- **Buscador sin tildes** ("lucuma" encuentra "lúcuma"), contador por categoría y botón "Quitar filtros".
- **Modo oscuro** guardado en el navegador.
- **Animaciones:** tarjetas que aparecen escalonadas, zoom en la foto, la foto vuela al carrito, aviso flotante, collage que flota. Respeta `prefers-reduced-motion`.
- **Accesibilidad:** auditada con axe-core (0 problemas en claro, oscuro y celular), navegable con teclado.

## Estructura

```
tienda-react/
├── index.html            ← lang="es", título y fuentes
├── vite.config.js        ← base relativa y proxy de /api a Vercel
├── public/img/           ← imágenes del catálogo
└── src/
    ├── main.jsx
    ├── index.css         ← vacío (paso 2)
    ├── App.jsx           ← estado del carrito, tema y ventanas
    ├── App.css           ← estilos, transiciones y animaciones
    ├── utilidades.js     ← soles(), sinTildes(), datos del negocio
    ├── animaciones.js    ← la foto vuela al carrito
    ├── data/productos.js ← catálogo local
    ├── hooks/            ← useLocalStorage, useProductos, useDialogo
    └── components/       ← Encabezado, Portada, Catalogo, ProductoCard,
                             ProductoDetalle, Carrito, Aviso, Pie
```
