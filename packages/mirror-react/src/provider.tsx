import { createContext, useCallback, useMemo, useState, type ReactNode } from "react";
import { MirrorNodeClient, type NetworkType } from "@hieco/mirror";
import { type AnyNetwork, type NetworkConfig, isDefaultNetwork, getNetworkUrl } from "@hieco/utils";

export type { AnyNetwork, NetworkConfig };

const EMPTY_NETWORKS: Record<string, string> = {};

export interface MirrorNodeContextValue {
  client: MirrorNodeClient;
  network: AnyNetwork;
  mirrorNodeUrl: string | undefined;
  switchNetwork: (network: AnyNetwork) => void;
}

const MirrorNodeContext = createContext<MirrorNodeContextValue | null>(null);

export interface MirrorNodeProviderProps<
  T extends string = string,
  U extends NetworkType = NetworkType,
> {
  children: ReactNode;
  config: NetworkConfig<T, U>;
}

export function MirrorNodeProvider<T extends string, U extends NetworkType = NetworkType>({
  children,
  config,
}: MirrorNodeProviderProps<T, U>): ReactNode {
  const defaultNetwork = config.defaultNetwork;
  const networks = config.networks ?? EMPTY_NETWORKS;

  const [network, setNetwork] = useState<AnyNetwork>(defaultNetwork);
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
    (nextNetwork: AnyNetwork) => {
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
