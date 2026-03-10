import { useWallet } from "./use-wallet";

export function useDisconnect(): () => Promise<void> {
  return useWallet().disconnect;
}
