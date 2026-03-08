import { useWalletContext } from "./context";

export function useSwitchChain(): (chainId: string) => Promise<void> {
  return useWalletContext().wallet.switchChain;
}
