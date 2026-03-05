export type NetworkType = "mainnet" | "testnet" | "previewnet";

export interface MirrorNetworkConfig {
  readonly mirrorNode: string;
}

export const NETWORK_CONFIGS: Record<NetworkType, MirrorNetworkConfig> = {
  mainnet: {
    mirrorNode: "https://mainnet.mirrornode.hedera.com",
  },
  testnet: {
    mirrorNode: "https://testnet.mirrornode.hedera.com",
  },
  previewnet: {
    mirrorNode: "https://previewnet.mirrornode.hedera.com",
  },
};

export interface MirrorNodeConfig {
  readonly network: NetworkType;
  readonly mirrorNodeUrl?: string;
}
