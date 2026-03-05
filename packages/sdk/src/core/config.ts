import type { ClientConfig } from "../shared/params.ts";
import type { ClientRuntimeConfig } from "../shared/client-types.ts";
import type { NetworkType } from "@hieco/types";
import { NETWORK_CONFIGS } from "@hieco/types";
import { isValidEntityId } from "@hieco/mirror-shared";
import { createError } from "../shared/errors.ts";
import type { Result } from "../shared/results.ts";
import { err, ok } from "../shared/results.ts";

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

export function resolveConfig(input: ClientConfig = {}): Result<ClientRuntimeConfig> {
  const network = resolveNetwork(input.network);
  const operator = resolveOperator(input.operator);
  const key = resolveKey(input.key);
  const mirrorUrl = resolveMirrorUrl(input.mirrorUrl, network);
  const maxFee = resolveMaxFee(input.maxFee);

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

  if (isBrowser() && !input.signer && (!operator || !key)) {
    return err(
      createError(
        "SIGNER_REQUIRED",
        "Signer is required in browser environments unless operator and key are provided",
        {
          hint: "Pass a wallet signer or set operator and key explicitly",
        },
      ),
    );
  }

  const resolved: ClientRuntimeConfig = {
    network,
    ...(operator && isValidEntityId(operator) ? { operator } : {}),
    ...(key ? { key } : {}),
    ...(input.signer ? { signer: input.signer } : {}),
    ...(mirrorUrl ? { mirrorUrl } : {}),
    ...(maxFee ? { maxFee } : {}),
  };
  return ok(resolved);
}
