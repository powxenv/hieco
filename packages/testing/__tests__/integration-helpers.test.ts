import { describe, test, expect } from "bun:test";
import { createTestSetup, withAutoCleanup, mockAccount, state } from "../src";

describe("createTestSetup", () => {
  test("creates setup with server", async () => {
    const setup = createTestSetup({ network: "testnet" });
    const context = await setup.start();

    expect(context.server).toBeDefined();
    expect(context.network).toBe("testnet");

    await setup.stop();
  });

  test("resets state when requested", async () => {
    state.reset();

    const setup1 = createTestSetup({ resetState: true });
    await setup1.start();

    const account1 = mockAccount.build();
    const accountId1 = account1.account;

    await setup1.stop();

    const setup2 = createTestSetup({ resetState: true });
    await setup2.start();

    const account2 = mockAccount.build();
    const accountId2 = account2.account;

    await setup2.stop();

    expect(accountId1).toBe("0.0.0");
    expect(accountId2).toBe("0.0.0");
  });
});

describe("withAutoCleanup", () => {
  test("automatically cleans up server", async () => {
    let serverStarted = false;
    let serverStopped = false;

    await withAutoCleanup(async (context) => {
      serverStarted = true;
      expect(context.server).toBeDefined();
    });

    serverStopped = true;

    expect(serverStarted).toBe(true);
    expect(serverStopped).toBe(true);
  });

  test("passes context to callback", async () => {
    await withAutoCleanup((context) => {
      expect(context.network).toBe("testnet");
      expect(context.server).toBeDefined();
    });
  });

  test("supports custom network", async () => {
    await withAutoCleanup(
      (context) => {
        expect(context.network).toBe("mainnet");
      },
      { network: "mainnet" },
    );
  });
});
