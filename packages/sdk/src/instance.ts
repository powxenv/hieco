import type { ClientConfig } from "./types/params.ts";
import { HieroClient } from "./client.ts";

export function hiero(config: ClientConfig = {}): HieroClient {
  return new HieroClient(config);
}
