import type { EntityId } from "@hieco/utils";
import type { ContractInfo, ContractLog } from "@hieco/mirror";
import type { TransactionReceiptData } from "../results/transaction.ts";

export interface ContractReceipt {
  readonly receipt: TransactionReceiptData;
  readonly transactionId: string;
  readonly contractId: EntityId;
}

export interface ContractDeployArtifactResult {
  readonly receipt: TransactionReceiptData;
  readonly transactionId: string;
  readonly contractId: EntityId;
  readonly fileId?: EntityId;
  readonly chunks?: number;
}

export interface ContractExecuteReceipt {
  readonly receipt: TransactionReceiptData;
  readonly transactionId: string;
}

export interface ContractCallResult<T = unknown> {
  readonly contractId: EntityId;
  readonly gasUsed: number;
  readonly errorMessage: string;
  readonly raw: Uint8Array;
  readonly value: T;
}

export interface ContractInfoData {
  readonly contractId: EntityId;
  readonly contract: ContractInfo;
}

export interface ContractLogsData {
  readonly contractId: EntityId;
  readonly logs: ReadonlyArray<ContractLog>;
}

export interface ContractBytecodeData {
  readonly contractId: EntityId;
  readonly bytecode: Uint8Array;
}

export interface MirrorContractCallData {
  readonly contractId: EntityId;
  readonly raw: string;
  readonly bytes: Uint8Array;
}

export interface MirrorContractEstimateData {
  readonly contractId: EntityId;
  readonly gas: number;
}

export interface ContractPreflightData {
  readonly estimate: MirrorContractEstimateData;
  readonly simulation: MirrorContractCallData;
  readonly suggestedGas: number;
}
