import type { HiecoClient } from "@hieco/sdk";
import { useHiecoContext } from "./use-hieco-context";

export function useHiecoClient(): HiecoClient {
  return useHiecoContext().client;
}
