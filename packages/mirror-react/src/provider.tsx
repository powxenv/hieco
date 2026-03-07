import { createContext, useCallback, useMemo, useState, type ReactNode } from "react";
import { MirrorNodeClient } from "@hieco/mirror";
import { type NetworkConfig, isDefaultNetwork, getNetworkUrl } from "@hieco/utils";

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
  children: ReactNode;
  config: NetworkConfig;
}

export function MirrorNodeProvider({ children, config }: MirrorNodeProviderProps): ReactNode {
  const defaultNetwork = config.defaultNetwork;
  const networks = config.networks ?? EMPTY_NETWORKS;

  const [network, setNetwork] = useState<string>(defaultNetwork);
  const [mirrorNodeUrl, setMirrorNodeUrl] = useState<string | undefined>(
    getNetworkUrl(defaultNetwork, networks),
  );

  const client = useMemo(
    () =>
      new MirrorNodeClient({
        network: isDefaultNetwork(network) ? network : "mainnet",
        mirrorNodeUrl: mirrorNodeUrl ?? getNetworkUrl(network, networks),
      }),
    [mirrorNodeUrl, network, networks],
  );

  const switchNetwork = useCallback(
    (nextNetwork: string) => {
      setNetwork(nextNetwork);
      setMirrorNodeUrl(getNetworkUrl(nextNetwork, networks));
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
