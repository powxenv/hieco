import type { HttpHandler } from "msw";
import type { MirrorMockServer as MirrorMockServerType } from "../types/config.js";
import { state } from "./state.js";
import { setupMirrorMock } from "../server/setup.js";

export interface TestContext {
  readonly server: MirrorMockServerType;
  readonly network: "mainnet" | "testnet" | "previewnet";
}

export const createTestSetup = (options: {
  readonly network?: "mainnet" | "testnet" | "previewnet";
  readonly resetState?: boolean;
  readonly onUnhandledRequest?: "error" | "warn" | "bypass";
}) => {
  const { network = "testnet", resetState = true, onUnhandledRequest = "error" } = options;

  if (resetState) {
    state.reset();
  }

  const server = setupMirrorMock({ network, onUnhandledRequest });

  return {
    async start(): Promise<TestContext> {
      server.listen();
      return { server, network };
    },

    async stop(): Promise<void> {
      server.close();
    },

    get handlers() {
      return {
        use: (...handlers: HttpHandler[]) => server.use(...handlers),
        reset: () => server.resetHandlers(),
      };
    },
  };
};

export const withAutoCleanup = async <T>(
  callback: (context: TestContext) => T | Promise<T>,
  options: {
    readonly network?: "mainnet" | "testnet" | "previewnet";
    readonly resetState?: boolean;
  } = {},
): Promise<T> => {
  const setup = createTestSetup(options);
  const context = await setup.start();

  try {
    return await callback(context);
  } finally {
    await setup.stop();
  }
};
