import type { HieroClientConfig } from "./types.ts";
import { HieroClient } from "./client.ts";

let defaultConfig: HieroClientConfig | undefined;
let defaultClient: HieroClient | undefined;

export function configureHiero(config: HieroClientConfig): void {
  defaultConfig = config;
  defaultClient = undefined;
}

export function getHieroClient(): HieroClient {
  if (defaultClient) return defaultClient;
  defaultClient = new HieroClient(defaultConfig ?? {});
  return defaultClient;
}

export function hiero(): HieroClient {
  return getHieroClient();
}

export function resetHiero(): void {
  defaultConfig = undefined;
  defaultClient = undefined;
}
