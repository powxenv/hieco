import type { WalletOption } from "@hieco/wallet";
import { useWalletState } from "./context";

export function useWallets(): readonly WalletOption[] {
  return useWalletState().wallets;
}
