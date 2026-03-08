import { useWalletContext } from "./context";

export function useDisconnect(): () => Promise<void> {
  return useWalletContext().wallet.disconnect;
}
