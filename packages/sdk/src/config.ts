import type { EntityId, NetworkType } from "@hieco/types";
import { isValidEntityId } from "@hieco/mirror-shared";
import { configurationError } from "./errors/messages.ts";
import type { ConfigurationError } from "./errors/types.ts";
import { isBrowser } from "./environment.ts";
import type { HieroClientConfig, LogLevel, RetryConfig, TransactionMiddleware } from "./types.ts";

const VALID_NETWORKS: ReadonlyArray<NetworkType> = ["mainnet", "testnet", "previewnet"];
const VALID_LOG_LEVELS: ReadonlyArray<LogLevel> = [
  "none",
  "error",
  "warn",
  "info",
  "debug",
  "trace",
];

export interface ResolvedConfig {
  readonly network: NetworkType;
  readonly operatorId: EntityId | undefined;
  readonly operatorKey: string | undefined;
  readonly mirrorUrl: string | undefined;
  readonly maxTransactionFee: string;
  readonly logLevel: LogLevel;
  readonly middleware: ReadonlyArray<TransactionMiddleware>;
  readonly retry: RetryConfig | false;
}

function readEnv(name: string): string | undefined {
  if (isBrowser()) return undefined;
  return typeof process !== "undefined" ? process.env[name] : undefined;
}

function isNetworkType(value: string): value is NetworkType {
  return (VALID_NETWORKS as ReadonlyArray<string>).includes(value);
}

function isLogLevel(value: string): value is LogLevel {
  return (VALID_LOG_LEVELS as ReadonlyArray<string>).includes(value);
}

function resolveNetwork(explicit: NetworkType | undefined): NetworkType {
  if (explicit) return explicit;
  const env = readEnv("HIERO_NETWORK");
  if (env && isNetworkType(env)) return env;
  return "testnet";
}

function resolveOperatorId(explicit: EntityId | undefined): EntityId | undefined {
  if (explicit) return explicit;
  const env = readEnv("HIERO_OPERATOR_ID") ?? readEnv("HIERO_ACCOUNT_ID");
  if (env && isValidEntityId(env)) return env;
  return undefined;
}

function resolveOperatorKey(explicit: string | undefined): string | undefined {
  if (explicit) return explicit;
  return readEnv("HIERO_PRIVATE_KEY");
}

function resolveMirrorUrl(explicit: string | undefined): string | undefined {
  if (explicit) return explicit;
  return readEnv("HIERO_MIRROR_URL");
}

function resolveMaxFee(explicit: number | string | undefined): string {
  if (explicit !== undefined) return String(explicit);
  return readEnv("HIERO_MAX_TRANSACTION_FEE") ?? "2";
}

function resolveLogLevel(explicit: LogLevel | undefined): LogLevel {
  if (explicit) return explicit;
  const env = readEnv("HIERO_LOG_LEVEL");
  if (env && isLogLevel(env)) return env;
  return "none";
}

export function resolveConfig(config: HieroClientConfig = {}): ResolvedConfig {
  return {
    network: resolveNetwork(config.network),
    operatorId: resolveOperatorId(config.operatorId),
    operatorKey: resolveOperatorKey(config.operatorKey),
    mirrorUrl: resolveMirrorUrl(config.mirrorUrl),
    maxTransactionFee: resolveMaxFee(config.maxTransactionFee),
    logLevel: resolveLogLevel(config.logLevel),
    middleware: config.middleware ?? [],
    retry: config.retry ?? {},
  };
}

export function validateOperatorForBrowser(
  resolved: ResolvedConfig,
): ConfigurationError | undefined {
  if (isBrowser() && !resolved.operatorId) {
    return configurationError(
      "operatorId",
      "Operator account ID is required in browser environments. Set it explicitly in createHieroClient({ operatorId: ... })",
    );
  }
  if (isBrowser() && !resolved.operatorKey) {
    return configurationError(
      "operatorKey",
      "Operator private key is required in browser environments. Set it explicitly in createHieroClient({ operatorKey: ... })",
    );
  }
  return undefined;
}
