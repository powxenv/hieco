import { createContext, createMemo, createSignal, type JSX, type Accessor } from "solid-js";
import { MirrorNodeClient, type NetworkType } from "@hieco/mirror";
import {
  type AnyNetwork,
  type NetworkConfig,
  createNetworkConfig,
  isDefaultNetwork,
  getNetworkUrl,
} from "@hieco/utils";

export type { AnyNetwork, NetworkConfig };

export { createNetworkConfig };

const EMPTY_NETWORKS: Record<string, string> = {};

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
  children: JSX.Element;
  config: NetworkConfig<T, U>;
}

export function MirrorNodeProvider<T extends string, U extends NetworkType = NetworkType>({
  children,
  config,
}: MirrorNodeProviderProps<T, U>) {
  const defaultNetwork = config.defaultNetwork;
  const networks = config.networks ?? EMPTY_NETWORKS;

  const currentNetwork = createSignal<AnyNetwork>(defaultNetwork);
  const currentMirrorNodeUrl = createSignal<string | undefined>(
    getNetworkUrl(defaultNetwork, networks),
  );

  const client = createMemo(() => {
    const network = currentNetwork[0]();
    const url = currentMirrorNodeUrl[0]() ?? getNetworkUrl(network, networks);
    return new MirrorNodeClient({
      network: isDefaultNetwork(network) ? network : "mainnet",
      mirrorNodeUrl: url,
    });
  });

  const switchNetwork = (newNetwork: AnyNetwork) => {
    const url = getNetworkUrl(newNetwork, networks);
    currentNetwork[1](newNetwork);
    currentMirrorNodeUrl[1](url);
  };

  const value: MirrorNodeContextValue = {
    client,
    network: currentNetwork[0],
    mirrorNodeUrl: currentMirrorNodeUrl[0],
    switchNetwork,
  };

  return <MirrorNodeContext.Provider value={value}>{children}</MirrorNodeContext.Provider>;
}

export { MirrorNodeContext };
