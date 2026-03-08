import type { ConnectOptions, WalletConnection } from "@hieco/wallet";
import { useWalletContext } from "./context";

export function useConnect(): (options?: ConnectOptions) => Promise<WalletConnection> {
  return useWalletContext().wallet.connect;
}
