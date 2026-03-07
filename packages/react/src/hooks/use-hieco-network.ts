import type { HiecoProviderConfig } from "../provider";
import { useHiecoController } from "./use-hieco-controller";

export function useHiecoNetwork(): {
  readonly network: NonNullable<HiecoProviderConfig["network"]> | undefined;
  readonly mirrorUrl: string | undefined;
} {
  const { config } = useHiecoController();

  return {
    network: config.network,
    mirrorUrl: config.mirrorUrl,
  };
}
