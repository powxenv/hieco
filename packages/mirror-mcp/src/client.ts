import { MirrorNodeClient, createMirrorNodeClient } from "@hieco/mirror";
import type { NetworkType } from "@hieco/utils";
import { NETWORK_CONFIGS } from "@hieco/utils";

export interface MirrorNetworkState {
  readonly defaultNetwork: NetworkType;
  readonly defaultMirrorNodeUrl: string;
  readonly currentNetwork: NetworkType;
  readonly currentMirrorNodeUrl: string;
  readonly allowNetworkSwitch: boolean;
}

function getNetworkType(): NetworkType {
  const network = process.env.MIRROR_NETWORK ?? "mainnet";
  if (network === "mainnet" || network === "testnet" || network === "previewnet") {
    return network;
  }
  throw new Error(`Invalid MIRROR_NETWORK: ${network}. Must be: mainnet, testnet, or previewnet`);
}

function getBooleanEnv(name: string): boolean {
  const value = process.env[name];

  if (!value) {
    return false;
  }

  return value === "1" || value === "true" || value === "yes" || value === "on";
}

function getMirrorNodeUrl(network: NetworkType, mirrorNodeUrl?: string): string {
  return mirrorNodeUrl ?? NETWORK_CONFIGS[network].mirrorNode;
}

const defaultNetwork = getNetworkType();
const defaultMirrorNodeUrl = getMirrorNodeUrl(defaultNetwork, process.env.MIRROR_NODE_URL);
const allowNetworkSwitch = getBooleanEnv("MIRROR_ALLOW_NETWORK_SWITCH");

let currentNetwork: NetworkType = defaultNetwork;
let currentMirrorNodeUrl = defaultMirrorNodeUrl;
let mirrorClient = createMirrorNodeClient(currentNetwork, currentMirrorNodeUrl);

function createState(): MirrorNetworkState {
  return {
    defaultNetwork,
    defaultMirrorNodeUrl,
    currentNetwork,
    currentMirrorNodeUrl,
    allowNetworkSwitch,
  };
}

export function getMirrorClient(): MirrorNodeClient {
  return mirrorClient;
}

export function getMirrorNetworkState(): MirrorNetworkState {
  return createState();
}

export function listMirrorNetworks(): Array<{
  readonly network: NetworkType;
  readonly mirrorNodeUrl: string;
  readonly isDefault: boolean;
  readonly isCurrent: boolean;
}> {
  return (Object.keys(NETWORK_CONFIGS) as NetworkType[]).map((network) => ({
    network,
    mirrorNodeUrl: NETWORK_CONFIGS[network].mirrorNode,
    isDefault: network === defaultNetwork,
    isCurrent: network === currentNetwork,
  }));
}

export function isNetworkSwitchAllowed(): boolean {
  return allowNetworkSwitch;
}

export function switchMirrorNetwork(
  network: NetworkType,
  mirrorNodeUrl?: string,
): MirrorNetworkState {
  if (!allowNetworkSwitch) {
    throw new Error(
      "Network switching is disabled. Set MIRROR_ALLOW_NETWORK_SWITCH=true to enable it.",
    );
  }

  currentNetwork = network;
  currentMirrorNodeUrl = getMirrorNodeUrl(network, mirrorNodeUrl);
  mirrorClient = createMirrorNodeClient(currentNetwork, currentMirrorNodeUrl);

  return createState();
}
