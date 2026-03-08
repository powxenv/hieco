import { createContext, type VNode } from "preact";
import { useCallback, useMemo, useState } from "preact/hooks";
import { MirrorNodeClient } from "@hieco/mirror";
import { type NetworkConfig, getRequiredNetworkUrl, isDefaultNetwork } from "@hieco/utils";

export type { NetworkConfig };

const EMPTY_NETWORKS: Record<string, string> = {};

export interface MirrorNodeContextValue {
  client: MirrorNodeClient;
  network: string;
  mirrorNodeUrl: string | undefined;
  switchNetwork: (network: string) => void;
}

const MirrorNodeContext = createContext<MirrorNodeContextValue | null>(null);

export interface MirrorNodeProviderProps {
  children: VNode;
  config: NetworkConfig;
}

export function MirrorNodeProvider({ children, config }: MirrorNodeProviderProps): VNode {
  const defaultNetwork = config.defaultNetwork;
  const networks = config.networks ?? EMPTY_NETWORKS;

  const [network, setNetwork] = useState<string>(defaultNetwork);
  const mirrorNodeUrl = useMemo(
    () => getRequiredNetworkUrl(network, networks),
    [network, networks],
  );

  const client = useMemo(
    () =>
      new MirrorNodeClient({
        network: isDefaultNetwork(network) ? network : "mainnet",
        mirrorNodeUrl,
      }),
    [mirrorNodeUrl, network],
  );

  const switchNetwork = useCallback(
    (nextNetwork: string) => {
      getRequiredNetworkUrl(nextNetwork, networks);
      setNetwork(nextNetwork);
    },
    [networks],
  );

  const value = useMemo<MirrorNodeContextValue>(
    () => ({
      client,
      network,
      mirrorNodeUrl,
      switchNetwork,
    }),
    [client, mirrorNodeUrl, network, switchNetwork],
  );

  return <MirrorNodeContext.Provider value={value}>{children}</MirrorNodeContext.Provider>;
}

export { MirrorNodeContext };
