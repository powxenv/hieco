import type { WalletError } from "@hieco/wallet";
import { useWalletState } from "./context";

export function useWalletError(): WalletError | null {
  return useWalletState().error;
}
