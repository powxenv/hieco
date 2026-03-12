import { rm } from "node:fs/promises";

await rm("dist", { force: true, recursive: true });

const result = await Bun.build({
  entrypoints: ["./src/index.ts"],
  outdir: "./dist",
  target: "browser",
  format: "esm",
  sourcemap: "linked",
  external: ["react", "react-dom", "@hieco/mirror", "@hieco/utils", "@tanstack/react-query"],
});

if (!result.success) {
  throw new AggregateError(result.logs, "Build failed");
}
