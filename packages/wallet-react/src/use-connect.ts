import type { ConnectOptions, WalletConnection } from "@hieco/wallet";
import { useWallet } from "./use-wallet";

export function useConnect(): (options?: ConnectOptions) => Promise<WalletConnection> {
  return useWallet().connect;
}
