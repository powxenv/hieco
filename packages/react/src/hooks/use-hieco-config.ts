import type { HiecoProviderConfig } from "../provider";
import { useHiecoContext } from "./use-hieco-context";

export function useHiecoConfig(): HiecoProviderConfig {
  return useHiecoContext().config;
}
