import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

const rootDirectory = fileURLToPath(new URL(".", import.meta.url));

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: "dist",
    cssCodeSplit: true,
    emptyOutDir: true,
    sourcemap: true,
    target: "esnext",
    lib: {
      entry: {
        index: resolve(rootDirectory, "src/index.ts"),
      },
      formats: ["es", "cjs"],
    },
    rollupOptions: {
      external: [/^react($|\/)/, /^react-dom($|\/)/, "@hieco/wallet", "@nanostores/react"],
    },
  },
});
