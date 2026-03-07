import { createContext, createMemo, createSignal, type JSX, type Accessor } from "solid-js";
import { MirrorNodeClient, type NetworkType } from "@hieco/mirror";
import { type AnyNetwork, type NetworkConfig, isDefaultNetwork, getNetworkUrl } from "@hieco/utils";

export type { AnyNetwork, NetworkConfig };

const EMPTY_NETWORKS: Record<string, string> = {};

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
}: MirrorNodeProviderProps<T, U>): JSX.Element {
  const defaultNetwork = config.defaultNetwork;
  const networks = config.networks ?? EMPTY_NETWORKS;

  const [network, setNetwork] = createSignal<AnyNetwork>(defaultNetwork);
  const [mirrorNodeUrl, setMirrorNodeUrl] = createSignal<string | undefined>(
    getNetworkUrl(defaultNetwork, networks),
  );

  const client = createMemo(() => {
    const currentNetwork = network();

    return new MirrorNodeClient({
      network: isDefaultNetwork(currentNetwork) ? currentNetwork : "mainnet",
      mirrorNodeUrl: mirrorNodeUrl() ?? getNetworkUrl(currentNetwork, networks),
    });
  });

  const switchNetwork = (nextNetwork: AnyNetwork): void => {
    setNetwork(nextNetwork);
    setMirrorNodeUrl(getNetworkUrl(nextNetwork, networks));
  };

  const value: MirrorNodeContextValue = {
    client,
    network,
    mirrorNodeUrl,
    switchNetwork,
  };

  return <MirrorNodeContext.Provider value={value}>{children}</MirrorNodeContext.Provider>;
}

export { MirrorNodeContext };
