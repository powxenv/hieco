import { createMirrorNodeClient } from "@hiecom/mirror-js";
import type { NetworkType } from "@hiecom/types";
import { NETWORK_CONFIGS } from "@hiecom/types";

function getNetworkType(): NetworkType {
  const network = process.env.MIRROR_NETWORK ?? "mainnet";
  if (network === "mainnet" || network === "testnet" || network === "previewnet") {
    return network;
  }
  throw new Error(`Invalid MIRROR_NETWORK: ${network}. Must be: mainnet, testnet, or previewnet`);
}

const network: NetworkType = getNetworkType();
const mirrorNodeUrl = process.env.MIRROR_NODE_URL ?? NETWORK_CONFIGS[network].mirrorNode;

export const mirrorClient = createMirrorNodeClient(network, mirrorNodeUrl);
