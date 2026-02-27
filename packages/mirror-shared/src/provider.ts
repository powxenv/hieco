import type { NetworkType } from "@hiecom/mirror-js";

export type { NetworkType };

export const DEFAULT_MIRROR_NODE_URLS: Record<NetworkType, string> = {
  mainnet: "https://mainnet.mirrornode.hedera.com",
  testnet: "https://testnet.mirrornode.hedera.com",
  previewnet: "https://previewnet.mirrornode.hedera.com",
};

export type AnyNetwork = NetworkType | string;

export interface NetworkConfig<T extends string = string, U extends NetworkType = NetworkType> {
  defaultNetwork: U | T;
  networks?: Record<T, string>;
}

export function createNetworkConfig<T extends string, U extends NetworkType = NetworkType>(
  config: NetworkConfig<T, U>,
): NetworkConfig<T, U> {
  return config;
}

export function isDefaultNetwork(network: string): network is NetworkType {
  return network === "mainnet" || network === "testnet" || network === "previewnet";
}

export function getNetworkUrl(
  network: AnyNetwork,
  customNetworks: Record<string, string>,
): string | undefined {
  if (isDefaultNetwork(network)) {
    return customNetworks[network] ?? DEFAULT_MIRROR_NODE_URLS[network];
  }
  return customNetworks[network];
}
