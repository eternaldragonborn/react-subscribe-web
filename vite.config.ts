import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig(({ command, mode }) => {
  return {
    plugins: [react()],
    server: {
      proxy: {
        "/api": "http://localhost:80",
      },
      // open: "/",
      host: "0.0.0.0",
    },
    build: {
      outDir: "./server/build",
      manifest: true,
    },
  };
});
