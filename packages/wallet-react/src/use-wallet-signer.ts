import type { Signer } from "@hiero-ledger/sdk";
import { useWallet } from "./use-wallet";

export function useWalletSigner(): Signer | undefined {
  return useWallet().signer;
}
