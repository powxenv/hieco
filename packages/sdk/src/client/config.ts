import type { ClientConfig } from "../shared/params.ts";
import type { ClientRuntimeConfig } from "./runtime.ts";
import type { NetworkType } from "@hieco/utils";
import { NETWORK_CONFIGS, isValidEntityId } from "@hieco/utils";
import { PrivateKey } from "@hiero-ledger/sdk";
import { createError } from "../errors/error.ts";
import type { Result } from "../results/result.ts";
import { err, ok } from "../results/result.ts";

const VALID_NETWORKS: ReadonlyArray<NetworkType> = ["mainnet", "testnet", "previewnet"];

function isBrowser(): boolean {
  return typeof globalThis.document !== "undefined";
}

function readEnv(name: string): string | undefined {
  if (isBrowser()) return undefined;
  return typeof process !== "undefined" ? process.env[name] : undefined;
}

function isNetworkType(value: string): value is NetworkType {
  return value === "mainnet" || value === "testnet" || value === "previewnet";
}

function resolveNetwork(explicit?: NetworkType): NetworkType {
  if (explicit && VALID_NETWORKS.includes(explicit)) return explicit;
  const env = readEnv("HIERO_NETWORK");
  if (env && isNetworkType(env)) {
    return env;
  }
  return "testnet";
}

function resolveOperator(explicit?: string): string | undefined {
  if (explicit) return explicit;
  return readEnv("HIERO_OPERATOR_ID") ?? readEnv("HIERO_ACCOUNT_ID");
}

function resolveKey(explicit?: string): string | undefined {
  if (explicit) return explicit;
  return readEnv("HIERO_PRIVATE_KEY");
}

function resolveMirrorUrl(explicit: string | undefined, network: NetworkType): string | undefined {
  if (explicit) return explicit;
  const env = readEnv("HIERO_MIRROR_URL");
  if (env) return env;
  return NETWORK_CONFIGS[network].mirrorNode;
}

function resolveMaxFee(explicit: string | number | bigint | undefined): string | undefined {
  if (explicit === undefined) return undefined;
  return String(explicit);
}

function isValidUrl(value: string): boolean {
  try {
    const url = value.includes("://") ? new URL(value) : new URL(`https://${value}`);
    return Boolean(url.hostname);
  } catch {
    return false;
  }
}

function parseMaxFee(value: string | undefined): Result<string | undefined> {
  if (!value) return ok(undefined);
  const normalized = value.trim();
  if (normalized.length === 0) {
    return err(
      createError("CONFIG_INVALID_MAX_FEE", "Max fee cannot be empty", {
        hint: "Provide a numeric value or omit maxFee",
      }),
    );
  }
  const numericPattern = /^[0-9]+(\.[0-9]+)?$/;
  if (!numericPattern.test(normalized)) {
    return err(
      createError("CONFIG_INVALID_MAX_FEE", `Invalid max fee: ${value}`, {
        hint: "Provide a non-negative numeric value",
      }),
    );
  }
  return ok(normalized);
}

function parsePositiveNumber(value: number | undefined, label: string): Result<number | undefined> {
  if (value === undefined) return ok(undefined);
  if (!Number.isFinite(value) || value <= 0) {
    return err(
      createError("CONFIG_INVALID_NETWORK", `${label} must be a positive number`, {
        hint: `Provide a positive ${label}`,
      }),
    );
  }
  return ok(value);
}

function validateKey(value: string | undefined): Result<true> {
  if (!value) return ok(true);
  try {
    PrivateKey.fromStringDer(value);
    return ok(true);
  } catch {
    return err(
      createError("CONFIG_INVALID_KEY", "Invalid private key", {
        hint: "Provide a DER-encoded private key",
      }),
    );
  }
}

export function resolveConfig(input: ClientConfig = {}): Result<ClientRuntimeConfig> {
  const browser = isBrowser();
  const network = resolveNetwork(input.network);
  const operator = resolveOperator(input.operator);
  const key = resolveKey(input.key);
  const mirrorUrl = resolveMirrorUrl(input.mirrorUrl, network);
  const maxFee = resolveMaxFee(input.maxFee);

  const maxFeeResult = parseMaxFee(maxFee);
  if (!maxFeeResult.ok) return maxFeeResult;

  const maxAttemptsResult = parsePositiveNumber(input.maxAttempts, "maxAttempts");
  if (!maxAttemptsResult.ok) return maxAttemptsResult;
  const maxNodeAttemptsResult = parsePositiveNumber(input.maxNodeAttempts, "maxNodeAttempts");
  if (!maxNodeAttemptsResult.ok) return maxNodeAttemptsResult;
  const requestTimeoutResult = parsePositiveNumber(input.requestTimeoutMs, "requestTimeoutMs");
  if (!requestTimeoutResult.ok) return requestTimeoutResult;
  const grpcDeadlineResult = parsePositiveNumber(input.grpcDeadlineMs, "grpcDeadlineMs");
  if (!grpcDeadlineResult.ok) return grpcDeadlineResult;
  const minBackoffResult = parsePositiveNumber(input.minBackoffMs, "minBackoffMs");
  if (!minBackoffResult.ok) return minBackoffResult;
  const maxBackoffResult = parsePositiveNumber(input.maxBackoffMs, "maxBackoffMs");
  if (!maxBackoffResult.ok) return maxBackoffResult;

  const keyValidation = validateKey(key);
  if (!keyValidation.ok) return keyValidation;

  if (operator && !isValidEntityId(operator)) {
    return err(
      createError("CONFIG_INVALID_OPERATOR", `Invalid operator account id: ${operator}`, {
        hint: "Use the format shard.realm.num (example: 0.0.123)",
      }),
    );
  }

  if (input.network && !VALID_NETWORKS.includes(input.network)) {
    return err(
      createError("CONFIG_INVALID_NETWORK", `Unsupported network: ${input.network}`, {
        hint: "Use mainnet, testnet, or previewnet",
      }),
    );
  }

  if (mirrorUrl && !isValidUrl(mirrorUrl)) {
    return err(
      createError("CONFIG_INVALID_MIRROR_URL", `Invalid mirror URL: ${mirrorUrl}`, {
        hint: "Use a valid hostname or URL",
      }),
    );
  }

  if (browser && key) {
    return err(
      createError("CONFIG_INVALID_KEY", "Private keys are not allowed in browser environments", {
        hint: "Use a wallet signer in the browser and keep operator keys on the server",
      }),
    );
  }

  if (browser && !input.signer) {
    return err(
      createError("SIGNER_REQUIRED", "Signer is required in browser environments", {
        hint: "Pass a wallet signer",
      }),
    );
  }

  const resolved: ClientRuntimeConfig = {
    network,
    ...(operator && isValidEntityId(operator) ? { operator } : {}),
    ...(key ? { key } : {}),
    ...(input.signer ? { signer: input.signer } : {}),
    ...(mirrorUrl ? { mirrorUrl } : {}),
    ...(maxFeeResult.value ? { maxFee: maxFeeResult.value } : {}),
    ...(maxAttemptsResult.value !== undefined ? { maxAttempts: maxAttemptsResult.value } : {}),
    ...(maxNodeAttemptsResult.value !== undefined
      ? { maxNodeAttempts: maxNodeAttemptsResult.value }
      : {}),
    ...(requestTimeoutResult.value !== undefined
      ? { requestTimeoutMs: requestTimeoutResult.value }
      : {}),
    ...(grpcDeadlineResult.value !== undefined ? { grpcDeadlineMs: grpcDeadlineResult.value } : {}),
    ...(minBackoffResult.value !== undefined ? { minBackoffMs: minBackoffResult.value } : {}),
    ...(maxBackoffResult.value !== undefined ? { maxBackoffMs: maxBackoffResult.value } : {}),
  };
  return ok(resolved);
}

export function loadConfigFromEnv(options?: {
  readonly allowMissingSigner?: boolean;
}): Result<ClientRuntimeConfig> {
  const resolved = resolveConfig({});
  if (!resolved.ok) return resolved;
  if (options?.allowMissingSigner) return resolved;
  const hasSigner = Boolean(
    resolved.value.signer || (resolved.value.operator && resolved.value.key),
  );
  if (!hasSigner) {
    return err(
      createError("SIGNER_REQUIRED", "Signer or operator credentials are required", {
        hint: "Provide HIERO_OPERATOR_ID and HIERO_PRIVATE_KEY or pass signer explicitly",
      }),
    );
  }
  return resolved;
}
