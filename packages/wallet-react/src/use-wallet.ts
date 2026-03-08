import type {
  ConnectOptions,
  WalletAccount,
  WalletChain,
  WalletConnection,
  WalletError,
  WalletOption,
  WalletPrompt,
  WalletStatus,
} from "@hieco/wallet";
import type { Signer } from "@hiero-ledger/sdk";
import { useWalletContext, useWalletState } from "./context";

export interface UseWalletResult {
  readonly status: WalletStatus;
  readonly wallets: readonly WalletOption[];
  readonly wallet: WalletOption | null;
  readonly account: WalletAccount | null;
  readonly accounts: readonly WalletAccount[];
  readonly chain: WalletChain;
  readonly chains: readonly WalletChain[];
  readonly signer: Signer | undefined;
  readonly error: WalletError | null;
  readonly prompt: WalletPrompt | null;
  readonly connect: (options?: ConnectOptions) => Promise<WalletConnection>;
  readonly disconnect: () => Promise<void>;
  readonly restore: () => Promise<WalletConnection | null>;
  readonly switchChain: (chainId: string) => Promise<void>;
  readonly openModal: () => void;
  readonly closeModal: () => void;
  readonly toggleModal: () => void;
  readonly isModalOpen: boolean;
}

export function useWallet(): UseWalletResult {
  const { wallet, isOpen, openModal, closeModal, toggleModal } = useWalletContext();
  const state = useWalletState();

  return {
    ...state,
    connect: wallet.connect,
    disconnect: wallet.disconnect,
    restore: wallet.restore,
    switchChain: wallet.switchChain,
    openModal,
    closeModal,
    toggleModal,
    isModalOpen: isOpen,
  };
}
