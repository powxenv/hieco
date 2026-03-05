import type { EntityId } from "@hieco/utils";
import type { TransactionDescriptor } from "../../foundation/params.ts";
import type {
  ContractCallResult,
  ContractBytecodeData,
  MirrorContractCallData,
  MirrorContractEstimateData,
  ContractExecuteReceipt,
  ContractInfoData,
  ContractLogsData,
  ContractReceipt,
  TransactionReceiptData,
} from "../../foundation/results-shapes.ts";
import type { Result } from "../../foundation/results.ts";

export interface ContractsNamespace {
  deploy: ((
    params: import("../../foundation/params.ts").DeployContractParams,
  ) => Promise<Result<ContractReceipt>>) & {
    tx: (
      params: import("../../foundation/params.ts").DeployContractParams,
    ) => TransactionDescriptor;
  };
  execute: ((
    params: import("../../foundation/params.ts").ExecuteContractParams,
  ) => Promise<Result<ContractExecuteReceipt>>) & {
    tx: (
      params: import("../../foundation/params.ts").ExecuteContractParams,
    ) => TransactionDescriptor;
  };
  call: (
    params: import("../../foundation/params.ts").CallContractParams,
  ) => Promise<Result<ContractCallResult<unknown>>>;
  delete: ((
    params: import("../../foundation/params.ts").DeleteContractParams,
  ) => Promise<Result<TransactionReceiptData>>) & {
    tx: (
      params: import("../../foundation/params.ts").DeleteContractParams,
    ) => TransactionDescriptor;
  };
  update: ((
    params: import("../../foundation/params.ts").UpdateContractParams,
  ) => Promise<Result<TransactionReceiptData>>) & {
    tx: (
      params: import("../../foundation/params.ts").UpdateContractParams,
    ) => TransactionDescriptor;
  };
  info: (contractId: EntityId) => Promise<Result<ContractInfoData>>;
  logs: (
    contractId: EntityId,
    params?: import("@hieco/mirror").ContractLogsParams,
  ) => Promise<Result<ContractLogsData>>;
  bytecode: (contractId: EntityId) => Promise<Result<ContractBytecodeData>>;
  simulate: (input: {
    readonly contractId: EntityId;
    readonly fn: string;
    readonly args?: ReadonlyArray<unknown>;
    readonly senderEvmAddress?: string;
    readonly gas?: number;
    readonly value?: string | number | bigint;
    readonly gasPrice?: string | number | bigint;
    readonly blockNumber?: string | number | bigint;
  }) => Promise<Result<MirrorContractCallData>>;
  estimateGas: (input: {
    readonly contractId: EntityId;
    readonly fn: string;
    readonly args?: ReadonlyArray<unknown>;
    readonly senderEvmAddress?: string;
    readonly gas?: number;
    readonly value?: string | number | bigint;
    readonly gasPrice?: string | number | bigint;
    readonly blockNumber?: string | number | bigint;
  }) => Promise<Result<MirrorContractEstimateData>>;
}
