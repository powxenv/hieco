import { createContext, type VNode } from "preact";
import { useCallback, useMemo, useState } from "preact/hooks";
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

export interface MirrorNodeProviderProps<
  T extends string = string,
  U extends NetworkType = NetworkType,
> {
  children: VNode;
  config: NetworkConfig<T, U>;
}

export function MirrorNodeProvider<T extends string, U extends NetworkType = NetworkType>({
  children,
  config,
}: MirrorNodeProviderProps<T, U>) {
  const { defaultNetwork, networks = {} } = config;

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

export { MirrorNodeContext };
