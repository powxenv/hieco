import { devtools } from "@tanstack/devtools-vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import tailwindcss from "@tailwindcss/vite";
import babel from "@rolldown/plugin-babel";
import viteReact, { reactCompilerPreset } from "@vitejs/plugin-react";
import Icons from "unplugin-icons/vite";
import type { Plugin } from "vite";
import { defineConfig } from "vite";
import { cloudflare } from "@cloudflare/vite-plugin";
import { fileURLToPath } from "node:url";

const serverAliases = {
  "@hieco/wallet": fileURLToPath(new URL("./src/lib/wallet.server.ts", import.meta.url)),
  "@hieco/wallet-react": fileURLToPath(
    new URL("./src/lib/wallet-react.server.tsx", import.meta.url),
  ),
} as const;

function walletSsrAliasPlugin(): Plugin {
  return {
    name: "wallet-ssr-alias",
    enforce: "pre",
    applyToEnvironment(environment) {
      return environment.name === "ssr";
    },
    resolveId(source) {
      if (source in serverAliases) {
        return serverAliases[source as keyof typeof serverAliases];
      }
    },
  };
}

const config = defineConfig({
  envPrefix: ["VITE_", "PUBLIC_"],
  resolve: {
    tsconfigPaths: true,
  },
  plugins: [
    walletSsrAliasPlugin(),
    cloudflare({ viteEnvironment: { name: "ssr" } }),
    devtools(),
    tailwindcss(),
    Icons({ compiler: "jsx", jsx: "react" }),
    tanstackStart(),
    viteReact(),
    babel({ presets: [reactCompilerPreset()] }),
  ],
});

export default config;
