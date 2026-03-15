import { rm } from "node:fs/promises";

await rm("dist", { force: true, recursive: true });

const result = await Bun.build({
  entrypoints: ["./src/index.ts"],
  outdir: "./dist",
  target: "node",
  format: "esm",
  sourcemap: "linked",
  define: {
    "process.env.NODE_ENV": '"production"',
  },
  external: ["react", "react-dom", "@hieco/mirror", "@hieco/realtime"],
});

if (!result.success) {
  throw new AggregateError(result.logs, "Build failed");
}
