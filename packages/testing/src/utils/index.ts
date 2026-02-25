export * from "./state.js";
export * from "./timestamp.js";
export * from "./integration.js";

export interface WithMirrorServerOptions {
  readonly network?: "mainnet" | "testnet" | "previewnet";
  readonly onUnhandledRequest?: "error" | "warn" | "bypass";
}

export const withMirrorServer = async <T>(
  callback: (server: import("../types/config.js").MirrorMockServer) => T | Promise<T>,
  options: WithMirrorServerOptions = {},
): Promise<T> => {
  const { setupMirrorMock } = await import("../server/setup.js");
  const server = setupMirrorMock({ network: options.network ?? "testnet" });

  server.listen();

  try {
    return await callback(server);
  } finally {
    server.close();
  }
};

export const sleep = (ms: number): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, ms));

export const waitFor = async <T>(
  condition: () => T | Promise<T>,
  options: { readonly timeout?: number; readonly interval?: number } = {},
): Promise<T> => {
  const { timeout = 5000, interval = 50 } = options;
  const start = Date.now();

  while (Date.now() - start < timeout) {
    try {
      const result = await condition();
      return result;
    } catch {
      await sleep(interval);
    }
  }

  throw new Error(`waitFor timed out after ${timeout}ms`);
};

export const assertThrows = async <T extends Error = Error>(
  callback: () => unknown,
  errorType?: abstract new (...args: any[]) => T,
): Promise<T> => {
  try {
    const result = callback();
    await result;
    throw new Error("Expected function to throw");
  } catch (error) {
    if (error instanceof Error && error.message === "Expected function to throw") {
      throw error;
    }
    if (errorType && !(error instanceof errorType)) {
      throw new Error(`Expected error to be instance of ${errorType.name}, got ${error}`);
    }
    return error as T;
  }
};
