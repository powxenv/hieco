import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import stylex from "@stylexjs/unplugin";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

const rootDirectory = fileURLToPath(new URL(".", import.meta.url));

export default defineConfig({
  plugins: [
    stylex.vite({
      runtimeInjection: true,
      useCSSLayers: true,
    }),
    react(),
  ],
  build: {
    outDir: "dist",
    emptyOutDir: true,
    sourcemap: true,
    target: "esnext",
    lib: {
      entry: {
        index: resolve(rootDirectory, "src/index.ts"),
        "ui/index": resolve(rootDirectory, "src/ui/index.ts"),
      },
    },
    rollupOptions: {
      external: [
        /^react($|\/)/,
        /^react-dom($|\/)/,
        "@hieco/wallet",
        "@nanostores/react",
        /^@stylexjs\/stylex($|\/)/,
      ],
    },
  },
});
