import { defineConfig, splitVendorChunkPlugin } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig(({ command, mode }) => {
  return {
    plugins: [react(), splitVendorChunkPlugin()],
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
