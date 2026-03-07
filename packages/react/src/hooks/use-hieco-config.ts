import type { HiecoProviderConfig } from "../provider";
import { useHiecoController } from "./use-hieco-controller";

export function useHiecoConfig(): HiecoProviderConfig {
  return useHiecoController().config;
}
