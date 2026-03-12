import { chmod, rm } from "node:fs/promises";

await rm("dist", { force: true, recursive: true });

const result = await Bun.build({
  entrypoints: ["./src/index.ts"],
  outdir: "./dist",
  target: "node",
  format: "esm",
  sourcemap: "linked",
});

if (!result.success) {
  throw new AggregateError(result.logs, "Build failed");
}

const outputPath = "./dist/index.js";
const output = await Bun.file(outputPath).text();

await Bun.write(outputPath, `#!/usr/bin/env node\n${output}`);
await chmod(outputPath, 0o755);
