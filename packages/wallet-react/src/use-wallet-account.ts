import type { WalletAccount } from "@hieco/wallet";
import { useWallet } from "./use-wallet";

export function useWalletAccount(): WalletAccount | null {
  return useWallet().account;
}
