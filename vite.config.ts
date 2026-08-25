import { defineConfig } from "vite";

export default defineConfig({
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
