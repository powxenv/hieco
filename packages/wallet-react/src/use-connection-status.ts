import type { WalletStatus } from "@hieco/wallet";
import { useWalletState } from "./context";

export function useConnectionStatus(): WalletStatus {
  return useWalletState().status;
}
