import { createContext, useContext, createSignal, createMemo, type ParentComponent, type JSX, type Accessor } from "solid-js";
import { MirrorNodeClient, type NetworkType } from "@hiecom/mirror-node";

const DEFAULT_MIRROR_NODE_URLS: Record<NetworkType, string> = {
  mainnet: "https://mainnet.mirrornode.hedera.com",
  testnet: "https://testnet.mirrornode.hedera.com",
  previewnet: "https://previewnet.mirrornode.hedera.com",
};

export type AnyNetwork = NetworkType | string;

export interface NetworkConfig<T extends string = string, U extends NetworkType = NetworkType> {
  defaultNetwork: U | T;
  networks?: Record<T, string>;
}

export function createNetworkConfig<T extends string, U extends NetworkType = NetworkType>(config: {
  defaultNetwork: U | T;
  networks: Record<T, string>;
}): NetworkConfig<T, U> {
  return config as NetworkConfig<T, U>;
}

export interface NetworkState {
  network: Accessor<AnyNetwork>;
  mirrorNodeUrl: Accessor<string | undefined>;
  switchNetwork: (network: AnyNetwork) => void;
}

export interface MirrorNodeContextValue {
  client: Accessor<MirrorNodeClient>;
  network: Accessor<AnyNetwork>;
  mirrorNodeUrl: Accessor<string | undefined>;
  switchNetwork: (network: AnyNetwork) => void;
}

const MirrorNodeContext = createContext<MirrorNodeContextValue>();

export interface MirrorNodeProviderProps<
  T extends string = string,
  U extends NetworkType = NetworkType,
> {
  children?: JSX.Element;
  config: NetworkConfig<T, U>;
}

function isDefaultNetwork(network: string): network is NetworkType {
  return network === "mainnet" || network === "testnet" || network === "previewnet";
}

function getNetworkUrl(
  network: AnyNetwork,
  customNetworks: Record<string, string>,
): string | undefined {
  if (isDefaultNetwork(network)) {
    return customNetworks[network] ?? DEFAULT_MIRROR_NODE_URLS[network];
  }
  return customNetworks[network];
}

export const MirrorNodeProvider: ParentComponent<MirrorNodeProviderProps> = (props) => {
  const { defaultNetwork, networks = {} } = props.config;

  const [currentNetwork, setCurrentNetwork] = createSignal<AnyNetwork>(defaultNetwork);
  const [currentMirrorNodeUrl, setCurrentMirrorNodeUrl] = createSignal<string | undefined>(
    getNetworkUrl(defaultNetwork, networks),
  );

  const client = createMemo(() => {
    const networkVal = currentNetwork();
    const url = currentMirrorNodeUrl() ?? getNetworkUrl(networkVal, networks);
    return new MirrorNodeClient({
      network: isDefaultNetwork(networkVal) ? networkVal : "mainnet",
      mirrorNodeUrl: url,
    });
  });

  const switchNetwork = (newNetwork: AnyNetwork) => {
    const url = getNetworkUrl(newNetwork, networks);
    setCurrentNetwork(newNetwork);
    setCurrentMirrorNodeUrl(url);
  };

  const value: MirrorNodeContextValue = {
    client,
    network: currentNetwork,
    mirrorNodeUrl: currentMirrorNodeUrl,
    switchNetwork,
  };

  return (
    <MirrorNodeContext.Provider value={value}>
      {props.children}
    </MirrorNodeContext.Provider>
  );
};

function useMirrorNodeContext(): MirrorNodeContextValue {
  const context = useContext(MirrorNodeContext);

  if (context === null || context === undefined) {
    throw new Error("useMirrorNodeContext must be used within a MirrorNodeProvider");
  }

  return context;
}

function useMirrorNodeClient(): Accessor<MirrorNodeClient> {
  const { client } = useMirrorNodeContext();
  return client;
}

function useNetwork(): NetworkState {
  const { network, mirrorNodeUrl, switchNetwork } = useMirrorNodeContext();

  return {
    network,
    mirrorNodeUrl,
    switchNetwork,
  };
}

export { MirrorNodeContext, useMirrorNodeContext, useMirrorNodeClient, useNetwork };
