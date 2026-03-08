import type { NetworkType } from "../types/network";

export type { NetworkType };

export const DEFAULT_MIRROR_NODE_URLS: Record<NetworkType, string> = {
  mainnet: "https://mainnet.mirrornode.hedera.com",
  testnet: "https://testnet.mirrornode.hedera.com",
  previewnet: "https://previewnet.mirrornode.hedera.com",
};

export interface NetworkConfig {
  defaultNetwork: string;
  networks?: Record<string, string>;
}

export function isDefaultNetwork(network: string): network is NetworkType {
  return network === "mainnet" || network === "testnet" || network === "previewnet";
}

export function getNetworkUrl(
  network: string,
  customNetworks: Record<string, string>,
): string | undefined {
  if (isDefaultNetwork(network)) {
    return customNetworks[network] ?? DEFAULT_MIRROR_NODE_URLS[network];
  }
  return customNetworks[network];
}

export function getRequiredNetworkUrl(
  network: string,
  customNetworks: Record<string, string>,
): string {
  const url = getNetworkUrl(network, customNetworks);

  if (url !== undefined) {
    return url;
  }

  throw new Error(
    `Unknown custom network "${network}". Add it to config.networks before using it.`,
  );
}
