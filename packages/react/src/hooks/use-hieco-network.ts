import type { HiecoProviderConfig } from "../provider";
import { useHiecoContext } from "./use-hieco-context";

export function useHiecoNetwork(): {
  readonly network: NonNullable<HiecoProviderConfig["network"]> | undefined;
  readonly mirrorUrl: string | undefined;
} {
  const { config } = useHiecoContext();

  return {
    network: config.network,
    mirrorUrl: config.mirrorUrl,
  };
}
