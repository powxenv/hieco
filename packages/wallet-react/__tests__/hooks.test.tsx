import { describe, expect, mock, test } from "bun:test";
import { renderToStaticMarkup } from "react-dom/server";
import type { Wallet, WalletState } from "../../wallet/src";

mock.module("@hieco/wallet", () => ({
  createWallet: mock(() => {
    throw new Error("Not needed in this test.");
  }),
  getConnectableWallets: (state: WalletState) => {
    return state.wallets.filter((wallet) => wallet.availability === "installed");
  },
  getUnavailableWallets: (state: WalletState) => {
    return state.wallets.filter((wallet) => wallet.availability === "unavailable");
  },
}));

const { WalletProvider, useWallet, useWalletClient } = await import("../src");

function createMockWallet(state: WalletState): Wallet {
  return {
    snapshot: () => state,
    subscribe: () => {
      return () => undefined;
    },
    connectQr: mock(async () => {
      throw new Error("Not implemented");
    }),
    connectExtension: mock(async () => {
      throw new Error("Not implemented");
    }),
    cancelConnection: mock(() => undefined),
    disconnect: mock(async () => undefined),
    restore: mock(async () => null),
    destroy: mock(async () => undefined),
  };
}

describe("wallet-react hooks", () => {
  test("useWallet exposes the controller API", async () => {
    const wallet = createMockWallet({
      chain: {
        id: "hedera:testnet",
        network: "testnet",
        ledgerId: "testnet",
      },
      walletConnectEnabled: true,
      wallets: [
        {
          id: "hashpack",
          name: "HashPack",
          icon: "https://example.com/icon.png",
          availability: "installed",
          canConnect: true,
        },
        {
          id: "kabila",
          name: "Kabila",
          icon: "https://example.com/kabila.png",
          availability: "unavailable",
          canConnect: false,
          installUrl: "https://example.com/install",
        },
      ],
      session: null,
      connection: null,
    });

    let open!: () => Promise<void>;
    let close!: () => void;
    let connectExtension!: (walletId: string) => Promise<unknown>;
    let disconnect!: () => Promise<void>;
    let clearError!: () => void;
    let walletClient!: Wallet;

    function Probe() {
      const state = useWallet();
      walletClient = useWalletClient();
      open = state.open;
      close = state.close;
      connectExtension = state.connectExtension;
      disconnect = state.disconnect;
      clearError = state.clearError;

      return (
        <div>
          {state.connectableWallets[0]?.id ?? "no-wallet"}|
          {state.unavailableWallets[0]?.id ?? "no-unavailable"}|{state.qr.uri ?? "no-qr"}|
          {state.qr.pending ? "pending" : "not-pending"}|{state.ready ? "ready" : "not-ready"}|
          {state.session === null ? "no-session" : "session"}
        </div>
      );
    }

    const markup = renderToStaticMarkup(
      <WalletProvider wallet={wallet}>
        <Probe />
      </WalletProvider>,
    );

    expect(markup).toContain("hashpack");
    expect(markup).toContain("kabila");
    expect(markup).toContain("no-qr");
    expect(markup).toContain("not-pending");
    expect(markup).toContain("ready");
    expect(markup).toContain("no-session");
    expect(walletClient).toBe(wallet);

    await open();
    await connectExtension("hashpack").catch(() => undefined);
    close();
    clearError();
    await disconnect();

    expect(wallet.connectQr).toHaveBeenCalledTimes(1);
    expect(wallet.connectExtension).toHaveBeenCalledWith("hashpack");
    expect(wallet.disconnect).toHaveBeenCalledTimes(1);
  });
});
