import type { Signer } from "@hieco/sdk";
import { useHiecoSession } from "./use-hieco-session";

export function useHiecoSigner(): Signer | undefined {
  return useHiecoSession().signer;
}
