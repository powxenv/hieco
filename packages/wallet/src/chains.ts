import type { WalletChain } from "./types";

export const HEDERA_MAINNET_CHAIN_ID = "hedera:mainnet";
export const HEDERA_TESTNET_CHAIN_ID = "hedera:testnet";
export const HEDERA_PREVIEWNET_CHAIN_ID = "hedera:previewnet";
export const HEDERA_DEVNET_CHAIN_ID = "hedera:devnet";

export function hederaMainnet(): WalletChain {
  return {
    id: HEDERA_MAINNET_CHAIN_ID,
    network: "mainnet",
    ledgerId: "mainnet",
  };
}

export function hederaTestnet(): WalletChain {
  return {
    id: HEDERA_TESTNET_CHAIN_ID,
    network: "testnet",
    ledgerId: "testnet",
  };
}

export function hederaPreviewnet(): WalletChain {
  return {
    id: HEDERA_PREVIEWNET_CHAIN_ID,
    network: "previewnet",
    ledgerId: "previewnet",
  };
}

export function hederaDevnet(
  input: {
    readonly id?: string;
    readonly ledgerId?: string;
    readonly rpcUrl?: string;
    readonly mirrorUrl?: string;
  } = {},
): WalletChain {
  return {
    id: input.id ?? HEDERA_DEVNET_CHAIN_ID,
    network: input.id && input.id !== HEDERA_DEVNET_CHAIN_ID ? "custom" : "devnet",
    ledgerId: input.ledgerId ?? "local-node",
    ...(input.rpcUrl ? { rpcUrl: input.rpcUrl } : {}),
    ...(input.mirrorUrl ? { mirrorUrl: input.mirrorUrl } : {}),
  };
}
