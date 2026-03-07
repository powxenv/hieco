import { describe, test, expect } from "bun:test";
import {
  isDefaultNetwork,
  getNetworkUrl,
  DEFAULT_MIRROR_NODE_URLS,
  type NetworkType,
} from "../src/mirror/provider";

describe("isDefaultNetwork", () => {
  test("returns true for mainnet", () => {
    expect(isDefaultNetwork("mainnet")).toBe(true);
  });

  test("returns true for testnet", () => {
    expect(isDefaultNetwork("testnet")).toBe(true);
  });

  test("returns true for previewnet", () => {
    expect(isDefaultNetwork("previewnet")).toBe(true);
  });

  test("returns false for other strings", () => {
    expect(isDefaultNetwork("custom-network")).toBe(false);
    expect(isDefaultNetwork("mainnet2")).toBe(false);
    expect(isDefaultNetwork("")).toBe(false);
    expect(isDefaultNetwork("Mainnet")).toBe(false);
    expect(isDefaultNetwork("MAINNET")).toBe(false);
  });

  test("type narrowing works correctly", () => {
    const network = "mainnet" as string;
    if (isDefaultNetwork(network)) {
      const networkType: NetworkType = network;
      expect(networkType).toBe("mainnet");
    }
  });
});

describe("getNetworkUrl", () => {
  test("returns default URL for mainnet", () => {
    const url = getNetworkUrl("mainnet", {});
    expect(url).toBe("https://mainnet.mirrornode.hedera.com");
  });

  test("returns default URL for testnet", () => {
    const url = getNetworkUrl("testnet", {});
    expect(url).toBe("https://testnet.mirrornode.hedera.com");
  });

  test("returns default URL for previewnet", () => {
    const url = getNetworkUrl("previewnet", {});
    expect(url).toBe("https://previewnet.mirrornode.hedera.com");
  });

  test("returns custom URL when provided in customNetworks for mainnet", () => {
    const customNetworks = { mainnet: "https://custom-mainnet.com" };
    const url = getNetworkUrl("mainnet", customNetworks);
    expect(url).toBe("https://custom-mainnet.com");
  });

  test("returns custom URL when provided in customNetworks for testnet", () => {
    const customNetworks = { testnet: "https://custom-testnet.com" };
    const url = getNetworkUrl("testnet", customNetworks);
    expect(url).toBe("https://custom-testnet.com");
  });

  test("returns custom URL when provided in customNetworks for previewnet", () => {
    const customNetworks = { previewnet: "https://custom-previewnet.com" };
    const url = getNetworkUrl("previewnet", customNetworks);
    expect(url).toBe("https://custom-previewnet.com");
  });

  test("returns custom URL for non-default network", () => {
    const customNetworks = { "custom-network": "https://custom.com" };
    const url = getNetworkUrl("custom-network", customNetworks);
    expect(url).toBe("https://custom.com");
  });

  test("returns undefined for unknown non-default network", () => {
    const url = getNetworkUrl("unknown-network", {});
    expect(url).toBeUndefined();
  });

  test("custom networks override defaults", () => {
    const customNetworks = { mainnet: "https://override.com" };
    const url = getNetworkUrl("mainnet", customNetworks);
    expect(url).toBe("https://override.com");
    expect(url).not.toBe(DEFAULT_MIRROR_NODE_URLS.mainnet);
  });

  test("returns default when custom network not provided", () => {
    const customNetworks = { "other-network": "https://other.com" };
    const url = getNetworkUrl("mainnet", customNetworks);
    expect(url).toBe(DEFAULT_MIRROR_NODE_URLS.mainnet);
  });

  test("handles multiple custom networks", () => {
    const customNetworks = {
      "custom-1": "https://custom-1.com",
      "custom-2": "https://custom-2.com",
      mainnet: "https://custom-mainnet.com",
    };
    expect(getNetworkUrl("custom-1", customNetworks)).toBe("https://custom-1.com");
    expect(getNetworkUrl("custom-2", customNetworks)).toBe("https://custom-2.com");
    expect(getNetworkUrl("mainnet", customNetworks)).toBe("https://custom-mainnet.com");
  });
});
