import type { Signer } from "@hiero-ledger/sdk";
import { useWalletState } from "./context";

export function useWalletSigner(): Signer | undefined {
  return useWalletState().signer;
}
