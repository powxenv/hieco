import { rm } from "node:fs/promises";

await rm("dist", { force: true, recursive: true });

const result = await Bun.build({
  entrypoints: ["./src/index.ts", "./src/appkit/index.ts"],
  outdir: "./dist",
  target: "browser",
  format: "esm",
  sourcemap: "linked",
  external: [
    "react",
    "react-dom",
    "@hieco/sdk",
    "@tanstack/react-query",
    "@reown/appkit/react",
    "@hashgraph/hedera-wallet-connect",
  ],
});

if (!result.success) {
  throw new AggregateError(result.logs, "Build failed");
}
