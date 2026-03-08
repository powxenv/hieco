import type { WalletDefinition } from "./types.ts";

const EXTENSION_AND_WALLETCONNECT = ["extension", "walletconnect"] as const;
const WALLETCONNECT_TRANSPORT = ["walletconnect"] as const;

export function hashpack(): WalletDefinition {
  return {
    id: "hashpack",
    name: "HashPack",
    icon: "https://www.hashpack.app/favicon.ico",
    installUrl: "https://www.hashpack.app/download",
    desktop: {
      extension: {
        ids: ["hashpack"],
        names: ["HashPack", "Hashpack"],
        extensionUrl: "https://www.hashpack.app/download",
      },
    },
    transports: EXTENSION_AND_WALLETCONNECT,
  };
}

export function kabila(): WalletDefinition {
  return {
    id: "kabila",
    name: "Kabila",
    icon: "https://www.kabila.app/favicon.ico",
    installUrl: "https://www.kabila.app/wallet",
    desktop: {
      extension: {
        ids: ["kabila", "kabila-wallet"],
        names: ["Kabila", "Kabila Wallet"],
        extensionUrl: "https://www.kabila.app/wallet",
      },
    },
    transports: EXTENSION_AND_WALLETCONNECT,
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
