export interface WalletChain {
  readonly id: string;
  readonly network: "mainnet" | "testnet" | "previewnet";
  readonly ledgerId: "mainnet" | "testnet" | "previewnet";
}

export interface WalletDefinition {
  readonly id: string;
  readonly name: string;
  readonly icon: string;
  readonly installUrl?: string;
  readonly desktop?: {
    readonly extension?: {
      readonly ids?: readonly string[];
      readonly names?: readonly string[];
      readonly extensionUrl?: string;
    };
  };
  readonly transports: readonly ("extension" | "walletconnect")[];
}

const extensionAndWalletConnect = ["extension", "walletconnect"] as const;

export function hederaMainnet(): WalletChain {
  return {
    id: "hedera:mainnet",
    network: "mainnet",
    ledgerId: "mainnet",
  };
}

export function hederaTestnet(): WalletChain {
  return {
    id: "hedera:testnet",
    network: "testnet",
    ledgerId: "testnet",
  };
}

export function hederaPreviewnet(): WalletChain {
  return {
    id: "hedera:previewnet",
    network: "previewnet",
    ledgerId: "previewnet",
  };
}

export function hashpack(): WalletDefinition {
  return {
    id: "hashpack",
    name: "HashPack",
    icon: "https://cdn.prod.website-files.com/61ce2e4bcaa2660da2bb419e/61d8218fb5715da56783a1d5_Group%20425.png",
    installUrl: "https://www.hashpack.app/download",
    desktop: {
      extension: {
        ids: ["hashpack"],
        names: ["HashPack", "Hashpack"],
        extensionUrl: "https://www.hashpack.app/download",
      },
    },
    transports: extensionAndWalletConnect,
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
    transports: extensionAndWalletConnect,
  };
}
