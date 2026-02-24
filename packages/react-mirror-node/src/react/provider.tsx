import { createContext, useCallback, useMemo, useState, type ReactNode } from "react";
import { MirrorNodeClient, type NetworkType } from "@hiecom/mirror-node";

const DEFAULT_MIRROR_NODE_URLS: Record<NetworkType, string> = {
  mainnet: "https://mainnet.mirrornode.hedera.com",
  testnet: "https://testnet.mirrornode.hedera.com",
  previewnet: "https://previewnet.mirrornode.hedera.com",
};

export type AnyNetwork = NetworkType | string;

export function createNetworkConfig<const T extends string>(config: {
  defaultNetwork: T;
  networks: Record<T, string>;
}) {
  return config;
}

export type AnyNetworkConfig = {
  defaultNetwork: string;
  networks: Record<string, string>;
};

export interface NetworkState<T extends string = AnyNetwork> {
  network: T;
  mirrorNodeUrl: string | undefined;
  switchNetwork: (network: T) => void;
}

export interface MirrorNodeContextValue<T extends string = AnyNetwork> {
  client: MirrorNodeClient;
  network: T;
  mirrorNodeUrl: string | undefined;
  switchNetwork: (network: T) => void;
}

const MirrorNodeContext = createContext<MirrorNodeContextValue<AnyNetwork> | null>(null);

export interface MirrorNodeProviderProps<T extends string = AnyNetwork> {
  children: ReactNode;
  config: {
    defaultNetwork: T;
    networks: Record<T, string>;
  };
}

export function MirrorNodeProvider<T extends string>({
  children,
  config,
}: MirrorNodeProviderProps<T>) {
  const { defaultNetwork, networks } = config;

  const [currentNetwork, setCurrentNetwork] = useState<T>(defaultNetwork);
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
    (newNetwork: T) => {
      const url = getNetworkUrl(newNetwork, networks);
      setCurrentNetwork(newNetwork);
      setCurrentMirrorNodeUrl(url);
    },
    [networks],
  );

  const value = useMemo<MirrorNodeContextValue<T>>(
    () => ({
      client,
      network: currentNetwork,
      mirrorNodeUrl: currentMirrorNodeUrl,
      switchNetwork,
    }),
    [client, currentNetwork, currentMirrorNodeUrl, switchNetwork],
  );

  return (
    <MirrorNodeContext.Provider value={value as unknown as MirrorNodeContextValue}>
      {children}
    </MirrorNodeContext.Provider>
  );
}

function isDefaultNetwork(network: string): network is NetworkType {
  return network === "mainnet" || network === "testnet" || network === "previewnet";
}

function getNetworkUrl(
  network: string,
  customNetworks: Record<string, string>,
): string | undefined {
  if (isDefaultNetwork(network)) {
    return customNetworks[network] ?? DEFAULT_MIRROR_NODE_URLS[network];
  }
  return customNetworks[network];
}

export { MirrorNodeContext };
