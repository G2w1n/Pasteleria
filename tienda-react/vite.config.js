import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Dos formas de usar este proyecto:
//  · npm run dev   → la práctica completa (index.html + App.jsx) en localhost:5173
//  · npm run build → compila las "islas" de React que usa la tienda principal
//                    (catalogo.html, cuenta.html, admin.html…) en ../js/react/
export default defineConfig(({ command }) => ({
  plugins: [react()],
  // React usa process.env.NODE_ENV para elegir su versión de producción
  define: command === "build" ? { "process.env.NODE_ENV": JSON.stringify("production") } : {},
  build: {
    outDir: "../js/react",
    emptyOutDir: true,
    copyPublicDir: false, // las imágenes de la tienda están en ../img/productos
    minify: true,
    // Los mismos navegadores que exige Bootstrap 6: así light-dark() y :has() quedan tal cual
    target: ["chrome130", "edge130", "firefox132", "safari18"],
    cssTarget: ["chrome130", "edge130", "firefox132", "safari18"],
    cssCodeSplit: false,
    lib: {
      entry: {
        catalogo: "src/islas/catalogo.jsx",
        buscador: "src/islas/buscador.jsx",
        seguimiento: "src/islas/seguimiento.jsx",
        resenas: "src/islas/resenas.jsx",
        panel: "src/islas/panel.jsx",
      },
      formats: ["es"],
      fileName: (_formato, nombre) => `${nombre}.js`,
      cssFileName: "kuyay-react",
    },
    rollupOptions: {
      output: { chunkFileNames: "compartido-[hash].js", minify: true },
    },
  },
  server: {
    // index.html usa los estilos de la tienda principal (../css/estilos.css)
    fs: { allow: [".."] },
    // En desarrollo, /api se pide a la página publicada en Vercel:
    // así "npm run dev" también muestra los productos en vivo desde Neon.
    proxy: {
      "/api": { target: "https://pasteleria-three-steel.vercel.app", changeOrigin: true },
    },
  },
}));
