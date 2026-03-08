import { createContext, createMemo, createSignal, type JSX, type Accessor } from "solid-js";
import { MirrorNodeClient } from "@hieco/mirror";
import { type NetworkConfig, getRequiredNetworkUrl, isDefaultNetwork } from "@hieco/utils";

export type { NetworkConfig };

const EMPTY_NETWORKS: Record<string, string> = {};

export interface MirrorNodeContextValue {
  client: Accessor<MirrorNodeClient>;
  network: Accessor<string>;
  mirrorNodeUrl: Accessor<string | undefined>;
  switchNetwork: (network: string) => void;
}

const MirrorNodeContext = createContext<MirrorNodeContextValue>();

export interface MirrorNodeProviderProps {
  children: JSX.Element;
  config: NetworkConfig;
}

export function MirrorNodeProvider({ children, config }: MirrorNodeProviderProps): JSX.Element {
  const defaultNetwork = config.defaultNetwork;
  const networks = config.networks ?? EMPTY_NETWORKS;

  const [network, setNetwork] = createSignal<string>(defaultNetwork);
  const mirrorNodeUrl = createMemo(() => getRequiredNetworkUrl(network(), networks));

  const client = createMemo(() => {
    const currentNetwork = network();

    return new MirrorNodeClient({
      network: isDefaultNetwork(currentNetwork) ? currentNetwork : "mainnet",
      mirrorNodeUrl: mirrorNodeUrl(),
    });
  });

  const switchNetwork = (nextNetwork: string): void => {
    getRequiredNetworkUrl(nextNetwork, networks);
    setNetwork(nextNetwork);
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
