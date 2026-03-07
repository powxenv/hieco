import type { Signer } from "@hiero-ledger/sdk";
import type { Amount } from "../shared/amount.ts";
import type { TransactionDescriptor } from "../transactions/types.ts";

export interface ScheduleCreateParams {
  readonly tx: TransactionDescriptor;
  readonly adminKey?: string | true;
  readonly payerAccountId?: string;
  readonly expirationTime?: Date;
  readonly waitForExpiry?: boolean;
  readonly memo?: string;
  readonly maxFee?: Amount;
}

export interface ScheduleSignParams {
  readonly scheduleId: string;
  readonly memo?: string;
  readonly maxFee?: Amount;
}

export interface ScheduleDeleteParams {
  readonly scheduleId: string;
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
  readonly payerAccountId?: string;
  readonly expirationTime?: Date;
  readonly waitForExpiry?: boolean;
  readonly memo?: string;
  readonly maxFee?: Amount;
}

export interface ScheduleCollectSignaturesParams {
  readonly scheduleId: string;
  readonly signers: ReadonlyArray<Signer>;
  readonly memo?: string;
  readonly maxFee?: Amount;
}

export interface ScheduleWaitExecutionOptions {
  readonly timeoutMs?: number;
  readonly pollIntervalMs?: number;
  readonly stopWhenDeleted?: boolean;
}
