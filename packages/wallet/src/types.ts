import type { Signer } from "@hiero-ledger/sdk";

export type WalletNetwork = "mainnet" | "testnet" | "previewnet" | "devnet" | "custom";
export type WalletSessionKind = "qr" | "extension";
export type WalletAvailability = "installed" | "unavailable";

export interface WalletAppMetadata {
  readonly name: string;
  readonly description: string;
  readonly url: string;
  readonly icons: readonly string[];
  readonly redirect?: WalletAppRedirect;
}

export interface WalletAppRedirect {
  readonly native?: string;
  readonly universal?: string;
}

export interface WalletChain {
  readonly id: string;
  readonly network: WalletNetwork;
  readonly ledgerId: string;
  readonly rpcUrl?: string;
  readonly mirrorUrl?: string;
}

export interface WalletDefinition {
  readonly id: string;
  readonly name: string;
  readonly icon: string;
  readonly installUrl?: string;
  readonly mobile?: {
    readonly native?: string;
    readonly universal?: string;
  };
  readonly desktop?: {
    readonly extension?: {
      readonly ids?: readonly string[];
      readonly names?: readonly string[];
      readonly extensionUrl?: string;
    };
  };
  readonly transports: readonly ("extension" | "walletconnect")[];
}

export interface WalletExtension {
  readonly id: string;
  readonly name?: string;
  readonly icon?: string;
  readonly url?: string;
  readonly availableInIframe: boolean;
}

export interface WalletInfo {
  readonly id: string;
  readonly name: string;
  readonly icon: string;
}

export interface WalletOption extends WalletInfo {
  readonly availability: WalletAvailability;
  readonly canConnect: boolean;
  readonly installUrl?: string;
}

export interface WalletSession {
  readonly kind: WalletSessionKind;
  readonly wallet: WalletInfo;
  readonly accountId: string;
  readonly caip10: string;
  readonly chain: WalletChain;
  readonly signer: WalletMessageSigner;
}

export interface WalletMessageSigner extends Signer {
  readonly signMessage: (message: string) => Promise<string>;
}

export interface WalletConnection {
  readonly uri: string | null;
  readonly extensionId: string | null;
}

export interface WalletStorage {
  readonly getItem: (key: string) => string | null | Promise<string | null>;
  readonly setItem: (key: string, value: string) => void | Promise<void>;
  readonly removeItem: (key: string) => void | Promise<void>;
}

export interface CreateWalletOptions {
  readonly projectId?: string;
  readonly app: WalletAppMetadata;
  readonly chain?: WalletChain;
  readonly wallets?: readonly WalletDefinition[];
  readonly restoreOnStart?: boolean;
  readonly storage?: WalletStorage;
  readonly storageKey?: string;
}

export interface WalletState {
  readonly chain: WalletChain;
  readonly walletConnectEnabled: boolean;
  readonly wallets: readonly WalletOption[];
  readonly session: WalletSession | null;
  readonly connection: WalletConnection | null;
}

export interface Wallet {
  readonly snapshot: () => WalletState;
  readonly subscribe: (listener: () => void) => () => void;
  readonly connectQr: () => Promise<WalletSession>;
  readonly connectExtension: (walletId: string) => Promise<WalletSession>;
  readonly cancelConnection: () => void;
  readonly disconnect: () => Promise<void>;
  readonly restore: () => Promise<WalletSession | null>;
  readonly destroy: () => Promise<void>;
}
