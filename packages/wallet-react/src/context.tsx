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

export interface WalletProviderProps extends CreateWalletOptions {
  readonly children: ReactNode;
  readonly wallet?: Wallet;
}

export function WalletProvider({ children, wallet, ...options }: WalletProviderProps): ReactNode {
  const createdWalletRef = useRef<Wallet | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  if (!wallet && !createdWalletRef.current) {
    createdWalletRef.current = createWallet(options);
  }

  const activeWallet = wallet ?? createdWalletRef.current;

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
        setIsOpen((current) => !current);
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
