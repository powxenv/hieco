import { useMemo } from "react";
import { useAppKitAccount, useAppKitProvider } from "@reown/appkit/react";
import { hederaNamespace, type HederaProvider } from "@hashgraph/hedera-wallet-connect";
import type { Signer } from "@hieco/sdk";

export interface UseHiecoAppKitSignerOptions {
  readonly namespace?: typeof hederaNamespace;
}

export function useHiecoAppKitSigner(
  options: UseHiecoAppKitSignerOptions = {},
): Signer | undefined {
  const namespace = options.namespace ?? hederaNamespace;
  const { isConnected } = useAppKitAccount({ namespace });
  const { walletProvider } = useAppKitProvider<HederaProvider>(namespace);

  return useMemo(() => {
    if (!isConnected) {
      return undefined;
    }

    const topic = walletProvider?.session?.topic;
    const nativeProvider = walletProvider?.nativeProvider;

    if (!topic || !nativeProvider) {
      return undefined;
    }

    return nativeProvider.getSigner(topic);
  }, [isConnected, walletProvider]);
}
