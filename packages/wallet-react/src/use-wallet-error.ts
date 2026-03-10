import type { WalletError } from "@hieco/wallet";
import { useWallet } from "./use-wallet";

export function useWalletError(): WalletError | null {
  return useWallet().error;
}
