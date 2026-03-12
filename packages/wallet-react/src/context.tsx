import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import {
  createWallet,
  type CreateWalletOptions,
  type Wallet,
  type WalletState,
} from "@hieco/wallet";

const WalletContext = createContext<Wallet | null>(null);

export interface WalletProviderCreateRuntimeProps extends CreateWalletOptions {
  readonly children: ReactNode;
}

export interface WalletProviderWithRuntimeProps {
  readonly children: ReactNode;
  readonly wallet: Wallet;
}

export type WalletProviderProps = WalletProviderWithRuntimeProps | WalletProviderCreateRuntimeProps;

export function WalletProvider(props: WalletProviderProps): ReactNode {
  const { children } = props;
  const createdWalletRef = useRef<Wallet | null>(null);
  const ownsWallet = !("wallet" in props);

  if (ownsWallet && !createdWalletRef.current) {
    createdWalletRef.current = createWallet(props);
  }

  const wallet = ownsWallet ? createdWalletRef.current : props.wallet;

  if (!wallet) {
    throw new Error("WalletProvider could not create a wallet runtime.");
  }

  useEffect(() => {
    if (!ownsWallet) {
      return;
    }

    const createdWallet = createdWalletRef.current;

    return () => {
      if (!createdWallet) {
        return;
      }

      if (createdWalletRef.current === createdWallet) {
        createdWalletRef.current = null;
      }

      void createdWallet.destroy();
    };
  }, [ownsWallet]);

  return <WalletContext.Provider value={wallet}>{children}</WalletContext.Provider>;
}

export function useWalletClient(): Wallet {
  const wallet = useContext(WalletContext);

  if (!wallet) {
    throw new Error("Wallet hooks must be used within WalletProvider.");
  }

  return wallet;
}

export function useWalletSnapshot(): WalletState {
  const wallet = useWalletClient();
  return useSyncExternalStore(wallet.subscribe, wallet.snapshot, wallet.snapshot);
}
