import { rm } from "node:fs/promises";

await rm("dist", { force: true, recursive: true });

const result = await Bun.build({
  entrypoints: ["./src/index.ts"],
  outdir: "./dist",
  target: "browser",
  format: "esm",
  sourcemap: "linked",
  packages: "external",
  splitting: true,
});

if (!result.success) {
  throw new AggregateError(result.logs, "Build failed");
}
