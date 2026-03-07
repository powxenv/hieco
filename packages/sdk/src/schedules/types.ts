import type { Signer } from "@hiero-ledger/sdk";
import type { EntityId } from "@hieco/utils";
import type { Amount } from "../shared/amount.ts";
import type { TransactionDescriptor } from "../transactions/types.ts";

export interface ScheduleCreateParams {
  readonly tx: TransactionDescriptor;
  readonly adminKey?: string | true;
  readonly payerAccountId?: EntityId;
  readonly expirationTime?: Date;
  readonly waitForExpiry?: boolean;
  readonly memo?: string;
  readonly maxFee?: Amount;
}

export interface ScheduleSignParams {
  readonly scheduleId: EntityId;
  readonly memo?: string;
  readonly maxFee?: Amount;
}

export interface ScheduleDeleteParams {
  readonly scheduleId: EntityId;
  readonly memo?: string;
  readonly maxFee?: Amount;
}

export interface ScheduleWaitOptions {
  readonly timeoutMs?: number;
  readonly pollIntervalMs?: number;
  readonly stopWhenDeleted?: boolean;
}

export interface ScheduleIdempotentCreateParams {
  readonly tx: TransactionDescriptor;
  readonly adminKey?: string | true;
  readonly payerAccountId?: EntityId;
  readonly expirationTime?: Date;
  readonly waitForExpiry?: boolean;
  readonly memo?: string;
  readonly maxFee?: Amount;
}

export interface ScheduleCollectSignaturesParams {
  readonly scheduleId: EntityId;
  readonly signers: ReadonlyArray<Signer>;
  readonly memo?: string;
  readonly maxFee?: Amount;
}

export interface ScheduleWaitExecutionOptions {
  readonly timeoutMs?: number;
  readonly pollIntervalMs?: number;
  readonly stopWhenDeleted?: boolean;
}
