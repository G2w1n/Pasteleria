// src/App.jsx
// Página de la práctica (npm run dev): el index con el catálogo y el contador del carrito.
// Los mismos componentes (Catalogo, ProductoCard) se usan dentro de la tienda principal.
import { useCallback, useState } from "react";
import Encabezado from "./components/Encabezado.jsx";
import Catalogo from "./components/Catalogo.jsx";
import Carrito from "./components/Carrito.jsx";
import ProductoDetalle from "./components/ProductoDetalle.jsx";
import { productos, categorias } from "./data/productos.js";
import { useLocalStorage } from "./hooks/useLocalStorage.js";
import { soles } from "./utilidades.js";
import "./App.css";

export default function App() {
  // El carrito vive en el PADRE: el encabezado lo lee y el catálogo lo modifica.
  // Extensión opcional: se guarda en localStorage con useEffect (dentro de useLocalStorage).
  const [carrito, setCarrito] = useLocalStorage("carrito", []); // [{ id, cantidad }]
  const [carritoAbierto, setCarritoAbierto] = useState(false);
  const [detalle, setDetalle] = useState(null);

  // Estado derivado
  const items = carrito
    .map(({ id, cantidad }) => ({ producto: productos.find((p) => p.id === id), cantidad }))
    .filter((it) => it.producto);
  const cantidad = items.reduce((suma, it) => suma + it.cantidad, 0);
  const total = items.reduce((suma, it) => suma + it.producto.precio * it.cantidad, 0);
  const cantidadEnCarrito = (id) => items.find((it) => it.producto.id === id)?.cantidad ?? 0;

  const agregar = (producto, unidades = 1) =>
    setCarrito((anterior) => {
      const actual = anterior.find((it) => it.id === producto.id)?.cantidad ?? 0;
      const nueva = Math.min(actual + unidades, producto.stock); // no más que el stock
      return actual
        ? anterior.map((it) => (it.id === producto.id ? { ...it, cantidad: nueva } : it))
        : [...anterior, { id: producto.id, cantidad: nueva }];
    });
  const cambiar = (id, delta) =>
    setCarrito((anterior) => anterior.map((it) => (it.id === id ? { ...it, cantidad: it.cantidad + delta } : it)).filter((it) => it.cantidad > 0));

  const cerrarCarrito = useCallback(() => setCarritoAbierto(false), []);
  const cerrarDetalle = useCallback(() => setDetalle(null), []);

  return (
    <>
      <Encabezado cantidad={cantidad} onAbrirCarrito={() => setCarritoAbierto(true)} />
      <main id="contenido">
        <section className="cabecera-pagina" id="inicio">
          <div className="container">
            <p className="ceja">Pastelería de autor · Barranco, Lima</p>
            <h1 className="titulo-pagina">Postres con sabor a Perú, hechos con kuyay</h1>
            <p className="fs-lg fg-2 texto-pagina">Práctica de la Semana 11: catálogo con React 19 + Vite y Bootstrap 6.</p>
            <a href="#catalogo" className="btn btn-solid theme-primary btn-lg mt-3">Ver catálogo</a>
          </div>
        </section>
        <section className="seccion pt-0" id="catalogo">
          <div className="container">
            <h2 className="titulo-seccion">Catálogo</h2>
            <Catalogo productos={productos} categorias={categorias} cantidadEnCarrito={cantidadEnCarrito}
                      onAgregar={agregar} onVerDetalle={setDetalle} />
          </div>
        </section>
      </main>
      <footer className="pie" id="contacto">
        <div className="container">
          <p className="mb-1">Kuyay · Av. Grau 312, Barranco, Lima</p>
          <p className="mb-0">Total en el carrito: {soles(total)}</p>
        </div>
      </footer>

      <Carrito abierto={carritoAbierto} items={items} total={total} onCerrar={cerrarCarrito} onCambiar={cambiar} onVaciar={() => setCarrito([])} />
      <ProductoDetalle key={detalle?.id ?? "ninguno"} producto={detalle} onCerrar={cerrarDetalle} onAgregar={agregar} />
    </>
  );
}
