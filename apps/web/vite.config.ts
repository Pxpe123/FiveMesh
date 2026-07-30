import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, ".", "");

  return {
    plugins: [react()],
    base: env.VITE_BASE_PATH ?? "/",
    build: {
      outDir: "dist",
      emptyOutDir: true,
      chunkSizeWarningLimit: 650,
      rollupOptions: {
        output: {
          manualChunks: {
            three: ["three"],
          },
        },
      },
    },
    preview: {
      host: "0.0.0.0",
      port: 4173,
      allowedHosts: [".trycloudflare.com", "localhost"],
    },
    server: {
      port: 5173,
      proxy: {
        "/api": "http://localhost:3000",
      },
    },
  };
});
