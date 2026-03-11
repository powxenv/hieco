// @ts-check
import { defineConfig } from "astro/config";
import tailwindcss from "@tailwindcss/vite";
import Icons from "unplugin-icons/vite";
import react from "@astrojs/react";
import cloudflare from "@astrojs/cloudflare";

export default defineConfig({
  vite: {
    plugins: [
      tailwindcss(),
      Icons({
        compiler: "astro",
      }),
    ],
  },

  integrations: [react()],
  adapter: cloudflare(),
});
