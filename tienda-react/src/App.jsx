// src/App.jsx
import { useCallback, useEffect, useState } from "react";
import Encabezado from "./components/Encabezado.jsx";
import Portada from "./components/Portada.jsx";
import Catalogo from "./components/Catalogo.jsx";
import Carrito from "./components/Carrito.jsx";
import ProductoDetalle from "./components/ProductoDetalle.jsx";
import Aviso from "./components/Aviso.jsx";
import Pie from "./components/Pie.jsx";
import { useLocalStorage } from "./hooks/useLocalStorage.js";
import { useProductos } from "./hooks/useProductos.js";
import { MINIMO_DESCUENTO, PORCENTAJE_DESCUENTO, redondear } from "./utilidades.js";
import { volarAlCarrito } from "./animaciones.js";
import "./App.css";

const temaDelSistema = () => (matchMedia("(prefers-color-scheme: dark)").matches ? "oscuro" : "claro");

export default function App() {
  const { productos, origen, cargando } = useProductos();

  // El carrito vive en el PADRE: el encabezado lo lee y el catálogo lo modifica.
  // Solo se guarda { id, cantidad }: precio y stock se leen siempre del catálogo actual.
  const [carrito, setCarrito] = useLocalStorage("kuyay-react-carrito", []);
  const [tema, setTema] = useLocalStorage("kuyay-react-tema", temaDelSistema());
  const [carritoAbierto, setCarritoAbierto] = useState(false);
  const [detalle, setDetalle] = useState(null);
  const [aviso, setAviso] = useState(null);

  // El tema se aplica en <html> para que también pinte el fondo de la página
  useEffect(() => {
    document.documentElement.dataset.tema = tema;
  }, [tema]);

  // Estado DERIVADO: los productos del carrito con sus datos actuales
  const items = carrito
    .map(({ id, cantidad }) => ({ producto: productos.find((p) => p.id === id), cantidad }))
    .filter((it) => it.producto && it.producto.stock > 0)
    .map((it) => ({ ...it, cantidad: Math.min(it.cantidad, it.producto.stock) }));
  const unidades = items.reduce((suma, it) => suma + it.cantidad, 0);
  const subtotal = redondear(items.reduce((suma, it) => suma + it.producto.precio * it.cantidad, 0));
  const descuento = subtotal > MINIMO_DESCUENTO ? redondear((subtotal * PORCENTAJE_DESCUENTO) / 100) : 0;
  const totales = { subtotal, descuento, total: redondear(subtotal - descuento) };
  const cantidadEnCarrito = (id) => items.find((it) => it.producto.id === id)?.cantidad ?? 0;

  const avisar = (texto, tipo = "exito") => setAviso({ texto, tipo, id: Date.now() });

  const agregar = (producto, cantidad = 1, boton = null) => {
    const actual = cantidadEnCarrito(producto.id);
    const agregadas = Math.min(actual + cantidad, producto.stock) - actual;
    if (agregadas <= 0) return avisar(`Ya tienes todas las unidades de ${producto.nombre}.`, "alerta");

    setCarrito((anterior) =>
      anterior.some((it) => it.id === producto.id)
        ? anterior.map((it) => (it.id === producto.id ? { ...it, cantidad: actual + agregadas } : it))
        : [...anterior, { id: producto.id, cantidad: agregadas }],
    );
    volarAlCarrito(boton, producto.imagen);
    avisar(agregadas < cantidad
      ? `Solo quedaban ${agregadas} de ${producto.nombre}: los agregamos.`
      : `Agregaste ${agregadas > 1 ? `${agregadas} × ` : ""}${producto.nombre}`);
  };

  const cambiarCantidad = (id, delta) =>
    setCarrito((anterior) =>
      anterior
        .map((it) => (it.id === id ? { ...it, cantidad: it.cantidad + delta } : it))
        .filter((it) => it.cantidad > 0),
    );
  const quitar = (id) => setCarrito((anterior) => anterior.filter((it) => it.id !== id));
  const vaciar = () => setCarrito([]);

  // useCallback: la misma función en cada render, para que los efectos que la usan no se repitan
  const cerrarCarrito = useCallback(() => setCarritoAbierto(false), []);
  const cerrarDetalle = useCallback(() => setDetalle(null), []);
  const cerrarAviso = useCallback(() => setAviso(null), []);

  return (
    <>
      <a href="#catalogo" className="saltar">Saltar al catálogo</a>
      <Encabezado
        cantidad={unidades}
        tema={tema}
        onCambiarTema={() => setTema(tema === "oscuro" ? "claro" : "oscuro")}
        onAbrirCarrito={() => setCarritoAbierto(true)}
      />
      <main>
        <Portada destacados={productos.filter((p) => p.etiqueta === "popular")} />
        <Catalogo
          productos={productos}
          cargando={cargando}
          origen={origen}
          cantidadEnCarrito={cantidadEnCarrito}
          onAgregar={agregar}
          onVerDetalle={setDetalle}
        />
      </main>
      <Pie total={totales.total} unidades={unidades} origen={origen} />

      <Carrito
        abierto={carritoAbierto}
        items={items}
        totales={totales}
        onCerrar={cerrarCarrito}
        onCambiar={cambiarCantidad}
        onQuitar={quitar}
        onVaciar={vaciar}
      />
      {/* key: al abrir otro producto, el detalle empieza de cero (cantidad = 1) */}
      <ProductoDetalle
        key={detalle?.id ?? "ninguno"}
        producto={detalle}
        enCarrito={detalle ? cantidadEnCarrito(detalle.id) : 0}
        onCerrar={cerrarDetalle}
        onAgregar={agregar}
      />
      <Aviso aviso={aviso} onCerrar={cerrarAviso} onVerCarrito={() => { setAviso(null); setCarritoAbierto(true); }} />
    </>
  );
}
