import type { WalletDefinition } from "./types";

const WALLETCONNECT_TRANSPORT = ["walletconnect"] as const;

export function hashpack(): WalletDefinition {
  return {
    id: "hashpack",
    name: "HashPack",
    icon: "https://www.hashpack.app/favicon.ico",
    installUrl: "https://www.hashpack.app/download",
    transports: WALLETCONNECT_TRANSPORT,
  };
}

export function kabila(): WalletDefinition {
  return {
    id: "kabila",
    name: "Kabila",
    icon: "https://www.kabila.app/favicon.ico",
    installUrl: "https://www.kabila.app/wallet",
    transports: WALLETCONNECT_TRANSPORT,
  };
}

export function genericWalletConnectWallet(): WalletDefinition {
  return {
    id: "hedera-wallet",
    name: "Other Hedera wallet",
    icon: "https://hedera.com/favicon.ico",
    transports: WALLETCONNECT_TRANSPORT,
  };
}

export function getDefaultWallets(): readonly WalletDefinition[] {
  return [hashpack(), kabila(), genericWalletConnectWallet()];
}
