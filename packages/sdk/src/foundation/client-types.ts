import type { EntityId, NetworkType } from "@hieco/types";
import type { Signer as HieroSigner } from "@hiero-ledger/sdk";

export interface ClientRuntimeConfig {
  readonly network: NetworkType;
  readonly operator?: EntityId;
  readonly key?: string;
  readonly signer?: HieroSigner;
  readonly mirrorUrl?: string;
  readonly maxFee?: string;
}
