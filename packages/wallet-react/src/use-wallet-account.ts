import type { WalletAccount } from "@hieco/wallet";
import { useWalletState } from "./context";

export function useWalletAccount(): WalletAccount | null {
  return useWalletState().account;
}
