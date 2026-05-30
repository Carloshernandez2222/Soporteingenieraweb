import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { fileURLToPath, URL } from "node:url";

const apiTarget = process.env.VITE_PROXY_TARGET || "http://127.0.0.1:8013";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  server: {
    host: "0.0.0.0",
    proxy: {
      "/api": { target: apiTarget, changeOrigin: true },
      "/registrar": { target: apiTarget, changeOrigin: true },
      "/casos": { target: apiTarget, changeOrigin: true },
      "/health": { target: apiTarget, changeOrigin: true },
      "/docs": { target: apiTarget, changeOrigin: true },
      "/openapi.json": { target: apiTarget, changeOrigin: true },
    },
  },
  build: {
    outDir: "dist",
    emptyOutDir: true,
  },
});
