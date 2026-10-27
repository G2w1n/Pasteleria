// src/hooks/useProductos.js
// Pide el catálogo a la API (Vercel + Neon). Si no responde, usa los datos locales.
// Los componentes no saben de dónde vienen los datos: solo reciben la lista.
import { useEffect, useState } from "react";
import { productos as locales, imagen } from "../data/productos.js";

const ESPERA_MAXIMA = 5000; // ms

export function useProductos() {
  const [estado, setEstado] = useState({ productos: locales, origen: "local", cargando: true });

  useEffect(() => {
    let vigente = true; // false cuando el componente se desmonta
    const control = new AbortController();
    const reloj = setTimeout(() => control.abort(), ESPERA_MAXIMA);

    fetch("/api/productos", { signal: control.signal })
      .then((respuesta) => (respuesta.ok ? respuesta.json() : Promise.reject(respuesta.status)))
      .then(({ productos, categorias }) => {
        if (!vigente) return;
        if (!Array.isArray(productos) || productos.length === 0) throw new Error("Catálogo vacío");
        const nombreCategoria = Object.fromEntries(categorias.map((c) => [c.id, c.nombre]));
        setEstado({
          origen: "neon",
          cargando: false,
          productos: productos.map((p) => ({
            id: p.id,
            nombre: p.nombre,
            categoria: nombreCategoria[p.categoria] ?? p.categoria,
            precio: p.precio,
            unidad: p.porcion,
            imagen: p.foto ?? imagen(p.id),
            stock: p.stock,
            etiqueta: p.etiqueta,
            descripcion: p.descripcion,
            ingredientes: p.ingredientes ?? [],
            alergenos: p.alergenos ?? [],
          })),
        });
      })
      .catch(() => {
        // Sin conexión o tardó demasiado: seguimos con los datos locales.
        // (En modo estricto React desmonta y vuelve a montar: esa petición cancelada se ignora.)
        if (vigente) setEstado((e) => ({ ...e, cargando: false }));
      })
      .finally(() => clearTimeout(reloj));

    return () => {
      vigente = false;
      clearTimeout(reloj);
      control.abort();
    };
  }, []);

  return estado;
}
