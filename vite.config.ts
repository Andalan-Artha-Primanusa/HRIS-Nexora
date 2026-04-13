import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from "path";

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes("node_modules")) {
            return undefined;
          }

          if (id.includes("react") || id.includes("scheduler")) {
            return "vendor-react";
          }

          if (id.includes("react-router")) {
            return "vendor-router";
          }

          if (id.includes("recharts") || id.includes("d3-")) {
            return "vendor-charts";
          }

          if (id.includes("axios")) {
            return "vendor-network";
          }

          if (id.includes("zustand")) {
            return "vendor-state";
          }

          if (id.includes("lucide-react") || id.includes("clsx")) {
            return "vendor-ui";
          }

          return "vendor-misc";
        },
      },
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    port: 5173,
  },
});