import type { WalletOption, WalletState } from "./types";

export function getConnectableWallets(
  state: Pick<WalletState, "wallets">,
): readonly WalletOption[] {
  return state.wallets.filter((wallet) => wallet.availability === "installed");
}

export function getUnavailableWallets(
  state: Pick<WalletState, "wallets">,
): readonly WalletOption[] {
  return state.wallets.filter((wallet) => wallet.availability === "unavailable");
}
