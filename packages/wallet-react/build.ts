import { rm } from "node:fs/promises";

await rm("dist", { force: true, recursive: true });

const result = await Bun.build({
  entrypoints: ["./src/index.ts"],
  outdir: "./dist",
  target: "browser",
  format: "esm",
  sourcemap: "external",
  define: {
    "process.env.NODE_ENV": '"production"',
  },
  external: ["react", "react-dom", "@hieco/wallet"],
});

if (!result.success) {
  throw new AggregateError(result.logs, "Build failed");
}
