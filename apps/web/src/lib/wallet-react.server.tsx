import type { ReactNode } from "react";

interface WalletInfo {
  readonly id: string;
  readonly name: string;
  readonly icon: string;
}

interface WalletOption extends WalletInfo {
  readonly availability: "installed" | "unavailable";
  readonly canConnect: boolean;
  readonly installUrl?: string;
}

interface WalletChain {
  readonly id: string;
  readonly network: string;
  readonly ledgerId: string;
}

interface WalletSession {
  readonly accountId: string;
  readonly wallet: WalletInfo;
  readonly chain: WalletChain;
}

interface UseWalletQrState {
  readonly enabled: boolean;
  readonly uri: string | null;
  readonly pending: boolean;
  readonly expired: boolean;
}

interface UseWalletResult {
  readonly chain: WalletChain;
  readonly session: WalletSession | null;
  readonly ready: boolean;
  readonly connectableWallets: readonly WalletOption[];
  readonly unavailableWallets: readonly WalletOption[];
  readonly qr: UseWalletQrState;
  readonly error: Error | null;
  readonly open: () => Promise<void>;
  readonly reload: () => Promise<void>;
  readonly close: () => void;
  readonly connectExtension: (_walletId: string) => Promise<void>;
  readonly disconnect: () => Promise<void>;
  readonly clearError: () => void;
}

const fallbackChain: WalletChain = {
  id: "hedera:testnet",
  network: "testnet",
  ledgerId: "testnet",
};

const fallbackWallet: UseWalletResult = {
  chain: fallbackChain,
  session: null,
  ready: false,
  connectableWallets: [],
  unavailableWallets: [],
  qr: {
    enabled: false,
    uri: null,
    pending: false,
    expired: false,
  },
  error: null,
  open: async () => undefined,
  reload: async () => undefined,
  close: () => undefined,
  connectExtension: async () => undefined,
  disconnect: async () => undefined,
  clearError: () => undefined,
};

export interface WalletProviderProps {
  readonly children: ReactNode;
}

export function WalletProvider({ children }: WalletProviderProps): ReactNode {
  return children;
}

export function useWallet(): UseWalletResult {
  return fallbackWallet;
}
