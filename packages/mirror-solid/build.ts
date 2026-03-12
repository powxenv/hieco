import { rm } from "node:fs/promises";

await rm("dist", { force: true, recursive: true });

const result = await Bun.build({
  entrypoints: ["./src/index.ts"],
  outdir: "./dist",
  target: "node",
  format: "esm",
  sourcemap: "linked",
  external: ["solid-js", "@tanstack/solid-query", "@hieco/mirror", "@hieco/utils"],
});

if (!result.success) {
  throw new AggregateError(result.logs, "Build failed");
}
