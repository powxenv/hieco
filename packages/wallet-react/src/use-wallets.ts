import type { WalletOption } from "@hieco/wallet";
import { useWallet } from "./use-wallet";

export function useWallets(): readonly WalletOption[] {
  return useWallet().wallets;
}
