import { createContext, useCallback, useMemo, useState, type ReactNode } from "react";
import { MirrorNodeClient, type NetworkType } from "@hiecom/mirror-node";

export type AnyNetwork = NetworkType | string;

const DEFAULT_MIRROR_NODE_URLS: Record<NetworkType, string> = {
  mainnet: "https://mainnet.mirrornode.hedera.com",
  testnet: "https://testnet.mirrornode.hedera.com",
  previewnet: "https://previewnet.mirrornode.hedera.com",
};

export interface NetworkState {
  network: AnyNetwork;
  mirrorNodeUrl: string | undefined;
  switchNetwork: (network: AnyNetwork) => void;
}

export interface MirrorNodeContextValue {
  client: MirrorNodeClient;
  network: AnyNetwork;
  mirrorNodeUrl: string | undefined;
  switchNetwork: (network: AnyNetwork) => void;
}

const MirrorNodeContext = createContext<MirrorNodeContextValue | null>(null);

export interface MirrorNodeProviderProps {
  children: ReactNode;
  defaultNetwork?: AnyNetwork;
  networks?: Record<string, string>;
}

export function MirrorNodeProvider({
  children,
  defaultNetwork = "mainnet",
  networks = {},
}: MirrorNodeProviderProps) {
  const [currentNetwork, setCurrentNetwork] = useState<AnyNetwork>(defaultNetwork);
  const [currentMirrorNodeUrl, setCurrentMirrorNodeUrl] = useState<string | undefined>(
    getNetworkUrl(defaultNetwork, networks),
  );

  const client = useMemo(() => {
    const url = currentMirrorNodeUrl ?? getNetworkUrl(currentNetwork, networks);
    return new MirrorNodeClient({
      network: isDefaultNetwork(currentNetwork) ? currentNetwork : "mainnet",
      mirrorNodeUrl: url,
    });
  }, [currentNetwork, currentMirrorNodeUrl, networks]);

  const switchNetwork = useCallback(
    (newNetwork: AnyNetwork) => {
      const url = getNetworkUrl(newNetwork, networks);
      setCurrentNetwork(newNetwork);
      setCurrentMirrorNodeUrl(url);
    },
    [networks],
  );

  const value = useMemo<MirrorNodeContextValue>(
    () => ({
      client,
      network: currentNetwork,
      mirrorNodeUrl: currentMirrorNodeUrl,
      switchNetwork,
    }),
    [client, currentNetwork, currentMirrorNodeUrl, switchNetwork],
  );

  return <MirrorNodeContext.Provider value={value}>{children}</MirrorNodeContext.Provider>;
}

function isDefaultNetwork(network: AnyNetwork): network is NetworkType {
  return network === "mainnet" || network === "testnet" || network === "previewnet";
}

function getNetworkUrl(network: AnyNetwork, customNetworks: Record<string, string>): string | undefined {
  if (isDefaultNetwork(network)) {
    return customNetworks[network] ?? DEFAULT_MIRROR_NODE_URLS[network];
  }
  return customNetworks[network];
}

export { MirrorNodeContext };
