import type { SetupServer } from "msw/node";
import type { HttpHandler } from "msw";

export type NetworkType = "mainnet" | "testnet" | "previewnet";

export interface MirrorMockConfig {
  readonly network: NetworkType;
  readonly onUnhandledRequest?: "error" | "warn" | "bypass";
}

export interface MirrorMockServer {
  readonly server: SetupServer;
  readonly listen: () => void;
  readonly resetHandlers: () => void;
  readonly close: () => void;
  readonly use: (...handlers: HttpHandler[]) => void;
}
