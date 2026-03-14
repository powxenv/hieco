import { useEffect, useRef, useState } from "react";
import {
  type WalletChain,
  getConnectableWallets,
  getUnavailableWallets,
  type WalletOption,
  type WalletSession,
} from "@hieco/wallet";
import { useWalletClient, useWalletSnapshot } from "./context";

export interface UseWalletQrState {
  readonly enabled: boolean;
  readonly uri: string | null;
  readonly pending: boolean;
  readonly expired: boolean;
}

export interface UseWalletResult {
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
  readonly connectExtension: (walletId: string) => Promise<void>;
  readonly disconnect: () => Promise<void>;
  readonly clearError: () => void;
}

function toControllerError(error: unknown, fallback: string): Error {
  return error instanceof Error ? error : new Error(fallback);
}

function isWalletErrorCode(error: Error | null, code: string): boolean {
  if (typeof error !== "object" || error === null || !("code" in error)) {
    return false;
  }

  return error.code === code;
}

export function useWallet(): UseWalletResult {
  const wallet = useWalletClient();
  const state = useWalletSnapshot();
  const [error, setError] = useState<Error | null>(null);
  const muteConnectionErrorsRef = useRef(false);
  const connectionRequestIdRef = useRef(0);

  useEffect(() => {
    if (state.session) {
      setError(null);
    }
  }, [state.session]);

  const startConnection = (
    action: () => Promise<WalletSession>,
    fallback: string,
  ): Promise<void> => {
    const requestId = connectionRequestIdRef.current + 1;
    connectionRequestIdRef.current = requestId;
    muteConnectionErrorsRef.current = false;
    setError(null);

    try {
      const pendingSession = action();
      void pendingSession.catch((nextError: unknown) => {
        if (muteConnectionErrorsRef.current || connectionRequestIdRef.current !== requestId) {
          return;
        }

        setError(toControllerError(nextError, fallback));
      });
    } catch (nextError) {
      if (connectionRequestIdRef.current !== requestId) {
        return Promise.resolve();
      }

      const controllerError = toControllerError(nextError, fallback);
      setError(controllerError);
    }

    return Promise.resolve();
  };

  const ready = state.walletConnectEnabled;
  const connectableWallets = getConnectableWallets(state);
  const unavailableWallets = getUnavailableWallets(state);
  const qr = {
    enabled: ready && state.session === null,
    uri: state.connection?.uri ?? null,
    pending: state.session === null && state.connection !== null && state.connection.uri === null,
    expired: isWalletErrorCode(error, "SESSION_EXPIRED"),
  };

  return {
    chain: state.chain,
    session: state.session,
    ready,
    connectableWallets,
    unavailableWallets,
    qr,
    error,
    open: () => {
      if (state.session || state.connection) {
        setError(null);
        return Promise.resolve();
      }

      return startConnection(wallet.connectQr, "Unable to start wallet connection.");
    },
    reload: () => {
      if (state.session) {
        setError(null);
        return Promise.resolve();
      }

      muteConnectionErrorsRef.current = true;
      connectionRequestIdRef.current += 1;
      wallet.cancelConnection();

      return startConnection(wallet.connectQr, "Unable to restart wallet connection.");
    },
    close: () => {
      muteConnectionErrorsRef.current = true;
      connectionRequestIdRef.current += 1;
      setError(null);
    },
    connectExtension: (walletId: string) => {
      if (state.session) {
        setError(null);
        return Promise.resolve();
      }

      return startConnection(() => wallet.connectExtension(walletId), "Unable to connect wallet.");
    },
    disconnect: async () => {
      setError(null);

      try {
        await wallet.disconnect();
      } catch (nextError) {
        const controllerError = toControllerError(nextError, "Unable to disconnect wallet.");
        setError(controllerError);
        throw controllerError;
      }
    },
    clearError: () => {
      setError(null);
    },
  };
}
