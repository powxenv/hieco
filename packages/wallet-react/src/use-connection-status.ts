import type { WalletStatus } from "@hieco/wallet";
import { useWallet } from "./use-wallet";

export function useConnectionStatus(): WalletStatus {
  return useWallet().status;
}
