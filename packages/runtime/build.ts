import { rm } from "node:fs/promises";

await rm("dist", { force: true, recursive: true });

const browserResult = await Bun.build({
  entrypoints: ["./src/browser.ts"],
  outdir: "./dist",
  target: "browser",
  format: "esm",
  sourcemap: "linked",
});

if (!browserResult.success) {
  throw new AggregateError(browserResult.logs, "Browser build failed");
}

const nodeResult = await Bun.build({
  entrypoints: ["./src/node.ts"],
  outdir: "./dist",
  target: "node",
  format: "esm",
  sourcemap: "linked",
  packages: "external",
});

if (!nodeResult.success) {
  throw new AggregateError(nodeResult.logs, "Node build failed");
}
