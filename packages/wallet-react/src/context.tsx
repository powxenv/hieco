import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import {
  WalletError,
  type CreateWalletOptions,
  type Wallet,
  type WalletState,
  createWalletInitialState,
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

function createInactiveWallet(state: WalletState): Wallet {
  return {
    snapshot: () => state,
    subscribe: () => () => undefined,
    connectQr: async () => {
      throw new WalletError("WALLET_NOT_READY");
    },
    connectExtension: async () => {
      throw new WalletError("WALLET_NOT_READY");
    },
    cancelConnection: () => undefined,
    disconnect: async () => undefined,
    restore: async () => null,
    destroy: async () => undefined,
  };
}

export function WalletProvider(props: WalletProviderProps): ReactNode {
  const { children } = props;
  const ownsWallet = !("wallet" in props);
  const createOptionsRef = useRef<WalletProviderCreateRuntimeProps | null>(
    ownsWallet ? props : null,
  );
  const [wallet, setWallet] = useState<Wallet>(() => {
    if (!ownsWallet) {
      return props.wallet;
    }

    return createInactiveWallet(createWalletInitialState(props));
  });

  if (!wallet) {
    throw new Error("WalletProvider could not create a wallet runtime.");
  }

  useEffect(() => {
    if (ownsWallet) {
      return;
    }

    setWallet(props.wallet);
  }, [ownsWallet, props]);

  useEffect(() => {
    if (!ownsWallet) {
      return;
    }

    if (import.meta.env.SSR) {
      return;
    }

    let active = true;
    let createdWallet: Wallet | null = null;

    void import("@hieco/wallet").then(({ createWallet }) => {
      if (!active || !createOptionsRef.current) {
        return;
      }

      if (typeof createWallet !== "function") {
        return;
      }

      createdWallet = createWallet(createOptionsRef.current);
      setWallet(createdWallet);
    });

    return () => {
      active = false;

      if (!createdWallet) {
        return;
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
