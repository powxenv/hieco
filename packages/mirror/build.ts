import { rm } from "node:fs/promises";

await rm("dist", { force: true, recursive: true });

const result = await Bun.build({
  entrypoints: ["./src/index.ts"],
  outdir: "./dist",
  target: "browser",
  format: "esm",
  splitting: true,
  sourcemap: "linked",
  packages: "external",
});

if (!result.success) {
  throw new AggregateError(result.logs, "Build failed");
}
