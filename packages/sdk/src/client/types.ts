import type { Signer as HieroSigner } from "@hieco/runtime";
import type { NetworkType } from "@hieco/utils";
import type { Amount } from "../shared/amount.ts";

export interface ClientConfig {
  readonly network?: NetworkType;
  readonly operator?: string;
  readonly key?: string;
  readonly signer?: HieroSigner;
  readonly mirrorUrl?: string;
  readonly maxFee?: Amount;
  readonly maxAttempts?: number;
  readonly maxNodeAttempts?: number;
  readonly requestTimeoutMs?: number;
  readonly grpcDeadlineMs?: number;
  readonly minBackoffMs?: number;
  readonly maxBackoffMs?: number;
}
