import type { TransactionDescriptor } from "../shared/params.ts";
import type {
  ContractCallResult,
  ContractBytecodeData,
  MirrorContractCallData,
  MirrorContractEstimateData,
  ContractDeployArtifactResult,
  ContractExecuteReceipt,
  ContractInfoData,
  ContractLogsData,
  ContractReceipt,
  TransactionReceiptData,
  ContractPreflightData,
} from "../results/shapes.ts";
import type { Result } from "../results/result.ts";

export interface ContractsNamespace {
  deploy: ((
    params: import("../shared/params.ts").DeployContractParams,
  ) => Promise<Result<ContractReceipt>>) & {
    tx: (params: import("../shared/params.ts").DeployContractParams) => TransactionDescriptor;
  };
  deployArtifact: (
    params: import("../shared/params.ts").DeployArtifactParams,
  ) => Promise<Result<ContractDeployArtifactResult>>;
  execute: ((
    params: import("../shared/params.ts").ExecuteContractParams,
  ) => Promise<Result<ContractExecuteReceipt>>) & {
    tx: (params: import("../shared/params.ts").ExecuteContractParams) => TransactionDescriptor;
  };
  call: (
    params: import("../shared/params.ts").CallContractParams,
  ) => Promise<Result<ContractCallResult<unknown>>>;
  callTyped: (params: {
    readonly id: string;
    readonly fn: string;
    readonly params: import("../shared/params.ts").FunctionParamsConfig;
    readonly gas?: number;
    readonly senderAccountId?: string;
    readonly returns?: import("./abi.ts").ReturnTypeHint;
  }) => Promise<Result<ContractCallResult<unknown>>>;
  executeTyped: (
    params: import("../shared/params.ts").ExecuteContractParamsTyped,
  ) => Promise<Result<ContractExecuteReceipt>>;
  preflight: (params: {
    readonly id: string;
    readonly fn: string;
    readonly args?: ReadonlyArray<unknown>;
    readonly senderEvmAddress?: string;
    readonly gas?: number;
    readonly value?: string | number | bigint;
    readonly gasPrice?: string | number | bigint;
    readonly blockNumber?: string | number | bigint;
    readonly gasBuffer?: number;
  }) => Promise<Result<ContractPreflightData>>;
  withAbi: (abi: import("./abi.ts").AbiSpec) => {
    readonly call: (params: {
      readonly id: string;
      readonly fn: string;
      readonly args: ReadonlyArray<unknown>;
      readonly gas?: number;
      readonly senderAccountId?: string;
    }) => Promise<Result<ContractCallResult<unknown>>>;
    readonly execute: (
      params: Omit<import("../shared/params.ts").ExecuteContractParamsTyped, "params"> & {
        readonly args: ReadonlyArray<unknown>;
      },
    ) => Promise<Result<ContractExecuteReceipt>>;
    readonly preflight: (params: {
      readonly id: string;
      readonly fn: string;
      readonly args: ReadonlyArray<unknown>;
      readonly senderEvmAddress?: string;
      readonly gas?: number;
      readonly value?: string | number | bigint;
      readonly gasPrice?: string | number | bigint;
      readonly blockNumber?: string | number | bigint;
      readonly gasBuffer?: number;
    }) => Promise<Result<ContractPreflightData>>;
  };
  delete: ((
    params: import("../shared/params.ts").DeleteContractParams,
  ) => Promise<Result<TransactionReceiptData>>) & {
    tx: (params: import("../shared/params.ts").DeleteContractParams) => TransactionDescriptor;
  };
  update: ((
    params: import("../shared/params.ts").UpdateContractParams,
  ) => Promise<Result<TransactionReceiptData>>) & {
    tx: (params: import("../shared/params.ts").UpdateContractParams) => TransactionDescriptor;
  };
  info: (contractId: string) => Promise<Result<ContractInfoData>>;
  logs: (
    contractId: string,
    params?: import("@hieco/mirror").ContractLogsParams,
  ) => Promise<Result<ContractLogsData>>;
  bytecode: (contractId: string) => Promise<Result<ContractBytecodeData>>;
  simulate: (input: {
    readonly contractId: string;
    readonly fn: string;
    readonly args?: ReadonlyArray<unknown>;
    readonly senderEvmAddress?: string;
    readonly gas?: number;
    readonly value?: string | number | bigint;
    readonly gasPrice?: string | number | bigint;
    readonly blockNumber?: string | number | bigint;
  }) => Promise<Result<MirrorContractCallData>>;
  estimateGas: (input: {
    readonly contractId: string;
    readonly fn: string;
    readonly args?: ReadonlyArray<unknown>;
    readonly senderEvmAddress?: string;
    readonly gas?: number;
    readonly value?: string | number | bigint;
    readonly gasPrice?: string | number | bigint;
    readonly blockNumber?: string | number | bigint;
  }) => Promise<Result<MirrorContractEstimateData>>;
}
