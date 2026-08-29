import { defineConfig } from "vite";

export default defineConfig({
  // GitHub Pages serves this repo from /germanix/, so asset URLs need that
  // prefix there. Set from the environment rather than hardcoded, so local
  // builds and the single-file build keep serving from the root.
  base: process.env["PAGES_BASE"] ?? "/",
  build: {
    target: "es2022",
    reportCompressedSize: true,
    rollupOptions: {
      output: {
        manualChunks: (id: string): string | undefined =>
          id.includes("node_modules/three") ? "three" : undefined,
      },
    },
  },
});
