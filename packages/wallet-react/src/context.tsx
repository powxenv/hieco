import { useStore } from "@nanostores/react";
import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import {
  createWallet,
  type CreateWalletOptions,
  type Wallet,
  type WalletState,
} from "@hieco/wallet";

export interface WalletModalState {
  readonly isOpen: boolean;
  readonly openModal: () => void;
  readonly closeModal: () => void;
  readonly toggleModal: () => void;
}

export interface WalletContextValue extends WalletModalState {
  readonly wallet: Wallet;
}

const WalletContext = createContext<WalletContextValue | null>(null);

export interface WalletProviderCreateRuntimeProps extends CreateWalletOptions {
  readonly children: ReactNode;
}

export interface WalletProviderWithRuntimeProps {
  readonly children: ReactNode;
  readonly wallet: Wallet;
}

export type WalletProviderProps = WalletProviderWithRuntimeProps | WalletProviderCreateRuntimeProps;

function createsWalletRuntime(
  props: WalletProviderProps,
): props is WalletProviderCreateRuntimeProps {
  return !("wallet" in props);
}

function findQrWallet(wallet: WalletState["wallets"][number][]): string | null {
  return (
    wallet.find((item) => item.id === "hedera-wallet" && item.transports.includes("walletconnect"))
      ?.id ??
    wallet.find((item) => item.transports.includes("walletconnect"))?.id ??
    null
  );
}

export function WalletProvider(props: WalletProviderProps): ReactNode {
  const { children } = props;
  const createdWalletRef = useRef<Wallet | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  if (createsWalletRuntime(props) && !createdWalletRef.current) {
    createdWalletRef.current = createWallet(props);
  }

  const activeWallet = createsWalletRuntime(props) ? createdWalletRef.current : props.wallet;

  if (!activeWallet) {
    throw new Error("WalletProvider could not create a wallet runtime.");
  }

  useEffect(() => {
    return () => {
      if (!createdWalletRef.current) {
        return;
      }

      void createdWalletRef.current.destroy();
    };
  }, []);

  useEffect(() => {
    const ensureQr = (): void => {
      const state = activeWallet.snapshot();
      const walletId = findQrWallet([...state.wallets]);

      if (
        !walletId ||
        state.account ||
        state.status === "restoring" ||
        state.status === "disconnecting" ||
        state.prompt ||
        (state.status === "connecting" && state.transport === "extension")
      ) {
        return;
      }

      void activeWallet
        .prepareQr({
          wallet: walletId,
          chain: state.chain.id,
        })
        .catch(() => undefined);
    };

    ensureQr();
    return activeWallet.onChange(ensureQr);
  }, [activeWallet]);

  const value = useMemo<WalletContextValue>(
    () => ({
      wallet: activeWallet,
      isOpen,
      openModal: () => {
        setIsOpen(true);
      },
      closeModal: () => {
        setIsOpen(false);
      },
      toggleModal: () => {
        setIsOpen((currentOpen) => !currentOpen);
      },
    }),
    [activeWallet, isOpen],
  );

  return <WalletContext.Provider value={value}>{children}</WalletContext.Provider>;
}

export function useWalletContext(): WalletContextValue {
  const value = useContext(WalletContext);
  if (!value) {
    throw new Error("Wallet hooks must be used within WalletProvider.");
  }
  return value;
}

export function useWalletState(): WalletState {
  return useStore(useWalletContext().wallet.$state);
}
