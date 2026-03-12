import { rm } from "node:fs/promises";

await rm("dist", { force: true, recursive: true });

await Bun.build({
  entrypoints: ["./src/index.ts"],
  outdir: "./dist",
  target: "browser",
  format: "esm",
  sourcemap: "external",
  external: ["react", "react-dom", "@hieco/wallet"],
});
