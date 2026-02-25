import { describe, test, expect, beforeAll, afterAll } from "bun:test";
import { setupMirrorMock, createFixtureHandlers, mockAccount, mockToken } from "../src";

describe("createFixtureHandlers", () => {
  let server: ReturnType<typeof setupMirrorMock>;

  beforeAll(() => {
    server = setupMirrorMock({ network: "testnet" });
  });

  afterAll(() => {
    server.close();
  });

  test("creates handlers for accounts", () => {
    const account = mockAccount.build({ account: "0.0.1234" as const });
    const handlers = createFixtureHandlers({
      network: "testnet",
      accounts: [account],
    });

    expect(handlers).toHaveLength(2);
    server.use(...handlers);
  });

  test("creates handlers for tokens", () => {
    const token = mockToken.build({ token_id: "0.0.5678" as const });
    const handlers = createFixtureHandlers({
      network: "testnet",
      tokens: [token],
    });

    expect(handlers).toHaveLength(2);
    server.use(...handlers);
  });

  test("creates handlers for multiple fixture types", () => {
    const account = mockAccount.build({ account: "0.0.1111" as const });
    const token = mockToken.build({ token_id: "0.0.2222" as const });

    const handlers = createFixtureHandlers({
      network: "testnet",
      accounts: [account],
      tokens: [token],
    });

    expect(handlers).toHaveLength(4);
    server.use(...handlers);
  });

  test("creates handlers for lists of fixtures", () => {
    const accounts = mockAccount.buildList(5);
    const handlers = createFixtureHandlers({
      network: "testnet",
      accounts,
    });

    expect(handlers).toHaveLength(6);
  });

  test("returns empty array when no fixtures provided", () => {
    const handlers = createFixtureHandlers({
      network: "testnet",
    });

    expect(handlers).toHaveLength(0);
  });
});
