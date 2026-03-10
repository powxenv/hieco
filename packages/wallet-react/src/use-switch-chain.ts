import { useWallet } from "./use-wallet";

export function useSwitchChain(): (chainId: string) => Promise<void> {
  return useWallet().switchChain;
}
