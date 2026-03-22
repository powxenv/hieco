import { describe, expect, test } from "bun:test";
import { asWalletError, WalletError } from "./errors";
import {
  HEDERA_DEVNET_CHAIN_ID,
  HEDERA_MAINNET_CHAIN_ID,
  HEDERA_TESTNET_CHAIN_ID,
  hederaDevnet,
  hederaMainnet,
  hederaTestnet,
} from "./chains";
import { getConnectableWallets, getUnavailableWallets } from "./selectors";
import { createWalletInitialState } from "./state";
import { getDefaultWallets, genericWalletConnectWallet } from "./wallets";

describe("wallet helpers", () => {
  test("creates Hedera chain descriptors", () => {
    expect(hederaMainnet()).toEqual({
      id: HEDERA_MAINNET_CHAIN_ID,
      network: "mainnet",
      ledgerId: "mainnet",
    });

    expect(hederaTestnet()).toEqual({
      id: HEDERA_TESTNET_CHAIN_ID,
      network: "testnet",
      ledgerId: "testnet",
    });

    expect(hederaDevnet()).toEqual({
      id: HEDERA_DEVNET_CHAIN_ID,
      network: "devnet",
      ledgerId: "local-node",
    });

    expect(
      hederaDevnet({
        id: "hedera:custom-devnet",
        ledgerId: "custom-ledger",
        rpcUrl: "https://rpc.local",
        mirrorUrl: "https://mirror.local",
      }),
    ).toEqual({
      id: "hedera:custom-devnet",
      network: "custom",
      ledgerId: "custom-ledger",
      rpcUrl: "https://rpc.local",
      mirrorUrl: "https://mirror.local",
    });
  });

  test("returns the default wallet catalog", () => {
    const wallets = getDefaultWallets();

    expect(wallets).toHaveLength(3);
    expect(wallets.map((wallet) => wallet.id)).toEqual(["hashpack", "kabila", "hedera-wallet"]);
    expect(genericWalletConnectWallet().transports).toEqual(["walletconnect"]);
  });

  test("creates initial wallet state from extension-capable wallets only", () => {
    const state = createWalletInitialState({
      projectId: "  project-123  ",
      wallets: getDefaultWallets(),
    });

    expect(state.chain).toEqual(hederaTestnet());
    expect(state.walletConnectEnabled).toBe(true);
    expect(state.wallets.map((wallet) => wallet.id)).toEqual(["hashpack", "kabila"]);
    expect(state.session).toBeNull();
    expect(state.connection).toBeNull();
  });

  test("selects connectable and unavailable wallets", () => {
    const state = createWalletInitialState({
      projectId: "",
      wallets: getDefaultWallets(),
    });
    const firstWallet = state.wallets[0];

    if (!firstWallet) {
      throw new Error("Expected at least one wallet");
    }

    const installedWallet = {
      ...firstWallet,
      availability: "installed" as const,
      canConnect: true,
    };
    const nextState = {
      ...state,
      wallets: [installedWallet, ...state.wallets.slice(1)],
    };

    expect(getConnectableWallets(nextState)).toEqual([installedWallet]);
    expect(getUnavailableWallets(nextState)).toEqual(state.wallets.slice(1));
  });

  test("normalizes wallet errors", () => {
    const existing = new WalletError("PAIRING_REQUIRED", "Need pairing");

    expect(asWalletError(existing, "CONNECT_FAILED")).toBe(existing);
    expect(asWalletError(new Error("User rejected request"), "CONNECT_FAILED")).toMatchObject({
      code: "USER_REJECTED",
      message: "USER_REJECTED",
    });
    expect(asWalletError(new Error("Session expired"), "CONNECT_FAILED")).toMatchObject({
      code: "SESSION_EXPIRED",
      message: "SESSION_EXPIRED",
    });
    expect(asWalletError(new Error("Socket closed"), "CONNECT_FAILED")).toMatchObject({
      code: "CONNECT_FAILED",
      message: "Socket closed",
    });
  });
});
