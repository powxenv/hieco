import { HieroClient } from "./client.ts";
import type { HieroClientConfig } from "./types.ts";
export { configureHiero, getHieroClient, hiero, resetHiero } from "./default.ts";

export function createHieroClient(config: HieroClientConfig = {}): HieroClient {
  return new HieroClient(config);
}

export { HieroClient } from "./client.ts";
export * from "./types.ts";
export * from "./errors/index.ts";
export * from "./events/index.ts";
export * from "./middleware/index.ts";
export * from "./actions/index.ts";
export * from "./builders/index.ts";
export * from "./subscriptions/index.ts";
export * from "./environment.ts";
export * from "./config.ts";
