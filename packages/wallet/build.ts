import { rm } from "node:fs/promises";

await rm("dist", { force: true, recursive: true });

const result = await Bun.build({
  entrypoints: [
    "./src/index.ts",
    "./src/exports/chains.ts",
    "./src/exports/selectors.ts",
    "./src/exports/state.ts",
    "./src/exports/wallets.ts",
  ],
  outdir: "./dist",
  target: "browser",
  format: "esm",
  sourcemap: "linked",
  splitting: true,
  packages: "external",
});

if (!result.success) {
  throw new AggregateError(result.logs, "Build failed");
}
