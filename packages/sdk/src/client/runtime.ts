import type { NetworkType } from "@hieco/utils";
import type { Signer as HieroSigner } from "@hieco/runtime";

export interface ClientRuntimeConfig {
  readonly network: NetworkType;
  readonly operator?: string;
  readonly key?: string;
  readonly signer?: HieroSigner;
  readonly mirrorUrl?: string;
  readonly maxFee?: string;
  readonly maxAttempts?: number;
  readonly maxNodeAttempts?: number;
  readonly requestTimeoutMs?: number;
  readonly grpcDeadlineMs?: number;
  readonly minBackoffMs?: number;
  readonly maxBackoffMs?: number;
}
