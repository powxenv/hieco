import type { Signer } from "@hiero-ledger/sdk";
import type { ReadableAtom } from "nanostores";

export type WalletTransportId = "extension" | "walletconnect";

export type WalletStatus =
  | "idle"
  | "connecting"
  | "connected"
  | "restoring"
  | "disconnecting"
  | "error";

export type WalletNetwork = "mainnet" | "testnet" | "previewnet" | "devnet" | "custom";

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
  readonly transports: readonly WalletTransportId[];
}

export interface WalletExtension {
  readonly id: string;
  readonly name?: string;
  readonly icon?: string;
  readonly url?: string;
  readonly availableInIframe: boolean;
}

export interface WalletOption extends WalletDefinition {
  readonly extension: WalletExtension | null;
}

export interface WalletAccount {
  readonly accountId: string;
  readonly caip10: string;
  readonly chainId: string;
  readonly ledgerId: string;
}

export interface WalletConnection {
  readonly wallet: WalletOption;
  readonly account: WalletAccount;
  readonly accounts: readonly WalletAccount[];
  readonly chain: WalletChain;
  readonly signer: Signer;
  readonly transport: WalletTransportId;
  readonly extensionId?: string;
  readonly topic: string;
}

export interface ConnectOptions {
  readonly wallet?: string;
  readonly chain?: string;
  readonly transport?: WalletTransportId;
}

export interface WalletStorage {
  readonly getItem: (key: string) => string | null | Promise<string | null>;
  readonly setItem: (key: string, value: string) => void | Promise<void>;
  readonly removeItem: (key: string) => void | Promise<void>;
}

export interface CreateWalletOptions {
  readonly projectId?: string;
  readonly app: WalletAppMetadata;
  readonly chains?: readonly WalletChain[];
  readonly wallets?: readonly WalletDefinition[];
  readonly autoConnect?: boolean;
  readonly storage?: WalletStorage;
  readonly storageKey?: string;
}

export interface WalletPrompt {
  readonly kind: "qr";
  readonly uri: string;
  readonly wallet: WalletOption;
}

export interface WalletState {
  readonly status: WalletStatus;
  readonly wallets: readonly WalletOption[];
  readonly wallet: WalletOption | null;
  readonly account: WalletAccount | null;
  readonly accounts: readonly WalletAccount[];
  readonly chain: WalletChain;
  readonly chains: readonly WalletChain[];
  readonly signer: Signer | undefined;
  readonly transport: WalletTransportId | null;
  readonly error: import("./errors.ts").WalletError | null;
  readonly prompt: WalletPrompt | null;
}

export interface Wallet {
  readonly $state: ReadableAtom<WalletState>;
  readonly snapshot: () => WalletState;
  readonly onChange: (listener: () => void) => () => void;
  readonly prepareQr: (options?: ConnectOptions) => Promise<void>;
  readonly connect: (options?: ConnectOptions) => Promise<WalletConnection>;
  readonly disconnect: () => Promise<void>;
  readonly restore: () => Promise<WalletConnection | null>;
  readonly switchChain: (chainId: string) => Promise<void>;
  readonly signer: () => Signer | undefined;
  readonly destroy: () => Promise<void>;
}
