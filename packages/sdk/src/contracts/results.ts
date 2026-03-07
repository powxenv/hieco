import type { ContractInfo, ContractLog } from "@hieco/mirror";
import type { TransactionReceiptData } from "../results/transaction.ts";

export interface ContractReceipt {
  readonly receipt: TransactionReceiptData;
  readonly transactionId: string;
  readonly contractId: string;
}

export interface ContractDeployArtifactResult {
  readonly receipt: TransactionReceiptData;
  readonly transactionId: string;
  readonly contractId: string;
  readonly fileId?: string;
  readonly chunks?: number;
}

export interface ContractExecuteReceipt {
  readonly receipt: TransactionReceiptData;
  readonly transactionId: string;
}

export interface ContractCallResult<T = unknown> {
  readonly contractId: string;
  readonly gasUsed: number;
  readonly errorMessage: string;
  readonly raw: Uint8Array;
  readonly value: T;
}

export interface ContractInfoData {
  readonly contractId: string;
  readonly contract: ContractInfo;
}

export interface ContractLogsData {
  readonly contractId: string;
  readonly logs: ReadonlyArray<ContractLog>;
}

export interface ContractBytecodeData {
  readonly contractId: string;
  readonly bytecode: Uint8Array;
}

export interface MirrorContractCallData {
  readonly contractId: string;
  readonly raw: string;
  readonly bytes: Uint8Array;
}

export interface MirrorContractEstimateData {
  readonly contractId: string;
  readonly gas: number;
}

export interface ContractPreflightData {
  readonly estimate: MirrorContractEstimateData;
  readonly simulation: MirrorContractCallData;
  readonly suggestedGas: number;
}
