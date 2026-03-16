import { rm } from "node:fs/promises";

await rm("dist", { force: true, recursive: true });

const result = await Bun.build({
  entrypoints: ["./src/index.ts", "./src/exports/entity.ts", "./src/exports/network.ts"],
  outdir: "./dist",
  target: "browser",
  format: "esm",
  sourcemap: "linked",
  packages: "external",
});

if (!result.success) {
  throw new AggregateError(result.logs, "Build failed");
}
