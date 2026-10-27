import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// La tienda React se publica dentro del sitio principal, en la carpeta react/.
// base "./" usa rutas relativas: funciona en Vercel (/react/) y en GitHub Pages (/Pasteleria/react/).
// Con "npm run dev" se sirve en la raíz de localhost:5173.
export default defineConfig(({ command }) => ({
  plugins: [react()],
  base: command === "build" ? "./" : "/",
  build: {
    outDir: "../react", // carpeta que publica Vercel junto al sitio principal
    emptyOutDir: true,
  },
  server: {
    // En desarrollo, /api se pide a la página publicada en Vercel:
    // así "npm run dev" también muestra los productos en vivo desde Neon.
    proxy: {
      "/api": { target: "https://pasteleria-three-steel.vercel.app", changeOrigin: true },
    },
  },
}));
