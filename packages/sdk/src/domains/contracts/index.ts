import type { EntityId } from "@hieco/types";
import type {
  CallContractParams,
  DeployContractParams,
  DeleteContractParams,
  ExecuteContractParams,
  TransactionDescriptor,
  UpdateContractParams,
} from "../../shared/params.ts";
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
} from "../../shared/results-shapes.ts";
import type { Result } from "../../shared/results.ts";
import { err, ok } from "../../shared/results.ts";
import { decodeReturn } from "./abi.ts";
import {
  ensureContractId,
  queryMirrorContractCall,
  queryMirrorContractEstimate,
} from "../transactions/index.ts";
import { createError } from "../../shared/errors.ts";

export interface ContractsNamespace {
  deploy: ((params: DeployContractParams) => Promise<Result<ContractReceipt>>) & {
    tx: (params: DeployContractParams) => TransactionDescriptor;
  };
  execute: ((params: ExecuteContractParams) => Promise<Result<ContractExecuteReceipt>>) & {
    tx: (params: ExecuteContractParams) => TransactionDescriptor;
  };
  call: (params: CallContractParams) => Promise<Result<ContractCallResult<unknown>>>;
  delete: ((params: DeleteContractParams) => Promise<Result<TransactionReceiptData>>) & {
    tx: (params: DeleteContractParams) => TransactionDescriptor;
  };
  update: ((params: UpdateContractParams) => Promise<Result<TransactionReceiptData>>) & {
    tx: (params: UpdateContractParams) => TransactionDescriptor;
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

export function createContractsNamespace(context: {
  readonly submit: (descriptor: TransactionDescriptor) => Promise<Result<TransactionReceiptData>>;
  readonly call: (params: {
    readonly id: EntityId;
    readonly fn: string;
    readonly args?: ReadonlyArray<unknown>;
    readonly gas: number;
    readonly senderAccountId?: EntityId;
  }) => Promise<
    Result<{
      readonly gasUsed: number;
      readonly errorMessage: string;
      readonly raw: Uint8Array;
      readonly getString: (index?: number) => string;
      readonly getBool: (index?: number) => boolean;
      readonly getAddress: (index?: number) => string;
      readonly getBytes32: (index?: number) => Uint8Array;
      readonly getInt8: (index?: number) => number;
      readonly getInt16: (index?: number) => number;
      readonly getInt32: (index?: number) => number;
      readonly getInt64: (index?: number) => import("bignumber.js").BigNumber;
      readonly getInt256: (index?: number) => import("bignumber.js").BigNumber;
      readonly getUint8: (index?: number) => number;
      readonly getUint16: (index?: number) => number;
      readonly getUint32: (index?: number) => number;
      readonly getUint64: (index?: number) => import("bignumber.js").BigNumber;
      readonly getUint256: (index?: number) => import("bignumber.js").BigNumber;
    }>
  >;
  readonly mirror: import("@hieco/mirror").MirrorNodeClient;
  readonly queryBytecode: (contractId: EntityId) => Promise<Result<ContractBytecodeData>>;
  readonly mirrorClient: import("@hiero-ledger/sdk").Client;
}): ContractsNamespace {
  const deploy = async (params: DeployContractParams): Promise<Result<ContractReceipt>> => {
    const result = await context.submit({ kind: "contracts.deploy", params });
    if (!result.ok) return result;
    const contractId = ensureContractId(result);
    if (!contractId.ok) return contractId;
    return ok({
      receipt: result.value,
      transactionId: result.value.transactionId,
      contractId: contractId.value,
    });
  };

  deploy.tx = (params: DeployContractParams): TransactionDescriptor => ({
    kind: "contracts.deploy",
    params,
  });

  const execute = async (
    params: ExecuteContractParams,
  ): Promise<Result<ContractExecuteReceipt>> => {
    const result = await context.submit({ kind: "contracts.execute", params });
    if (!result.ok) return result;
    return ok({ receipt: result.value, transactionId: result.value.transactionId });
  };

  execute.tx = (params: ExecuteContractParams): TransactionDescriptor => ({
    kind: "contracts.execute",
    params,
  });

  const call = async (params: CallContractParams): Promise<Result<ContractCallResult<unknown>>> => {
    const callParams = {
      id: params.id,
      fn: params.fn,
      ...(params.args ? { args: params.args } : {}),
      gas: params.gas ?? 150_000,
      ...(params.senderAccountId ? { senderAccountId: params.senderAccountId } : {}),
    };
    const result = await context.call(callParams);
    if (!result.ok) return result;

    const rawResult = result.value;
    const decoded = decodeReturn(rawResult, params.returns);
    if (!decoded.ok) return err(decoded.error);

    return ok({
      contractId: params.id,
      gasUsed: rawResult.gasUsed,
      errorMessage: rawResult.errorMessage,
      raw: rawResult.raw,
      value: decoded.value,
    });
  };

  const del = async (params: DeleteContractParams): Promise<Result<TransactionReceiptData>> => {
    const result = await context.submit({ kind: "contracts.delete", params });
    if (!result.ok) return result;
    return ok(result.value);
  };

  del.tx = (params: DeleteContractParams): TransactionDescriptor => ({
    kind: "contracts.delete",
    params,
  });

  const update = async (params: UpdateContractParams): Promise<Result<TransactionReceiptData>> => {
    const result = await context.submit({ kind: "contracts.update", params });
    if (!result.ok) return result;
    return ok(result.value);
  };

  update.tx = (params: UpdateContractParams): TransactionDescriptor => ({
    kind: "contracts.update",
    params,
  });

  const info = async (contractId: EntityId): Promise<Result<ContractInfoData>> => {
    const result = await context.mirror.contract.getInfo(contractId);
    if (!result.success) {
      return err(
        createError(
          "MIRROR_QUERY_FAILED",
          `Mirror contract.getInfo failed: ${result.error.message}`,
          {
            hint: "Verify mirror node connectivity",
            details: {
              status: result.error.status ?? "unknown",
              code: result.error.code ?? "unknown",
            },
          },
        ),
      );
    }
    return ok({ contractId, contract: result.data });
  };

  const logs = async (
    contractId: EntityId,
    params?: import("@hieco/mirror").ContractLogsParams,
  ): Promise<Result<ContractLogsData>> => {
    const result = await context.mirror.contract.getLogs(contractId, params);
    if (!result.success) {
      return err(
        createError(
          "MIRROR_QUERY_FAILED",
          `Mirror contract.getLogs failed: ${result.error.message}`,
          {
            hint: "Verify mirror node connectivity",
            details: {
              status: result.error.status ?? "unknown",
              code: result.error.code ?? "unknown",
            },
          },
        ),
      );
    }
    return ok({ contractId, logs: result.data });
  };

  const bytecode = async (contractId: EntityId): Promise<Result<ContractBytecodeData>> => {
    return context.queryBytecode(contractId);
  };

  const simulate = async (input: {
    readonly contractId: EntityId;
    readonly fn: string;
    readonly args?: ReadonlyArray<unknown>;
    readonly senderEvmAddress?: string;
    readonly gas?: number;
    readonly value?: string | number | bigint;
    readonly gasPrice?: string | number | bigint;
    readonly blockNumber?: string | number | bigint;
  }): Promise<Result<MirrorContractCallData>> => {
    return queryMirrorContractCall({
      client: context.mirrorClient,
      contractId: input.contractId,
      functionName: input.fn,
      ...(input.args ? { args: input.args } : {}),
      ...(input.senderEvmAddress ? { senderEvmAddress: input.senderEvmAddress } : {}),
      ...(input.gas !== undefined ? { gas: input.gas } : {}),
      ...(input.value !== undefined ? { value: input.value } : {}),
      ...(input.gasPrice !== undefined ? { gasPrice: input.gasPrice } : {}),
      ...(input.blockNumber !== undefined ? { blockNumber: input.blockNumber } : {}),
    });
  };

  const estimateGas = async (input: {
    readonly contractId: EntityId;
    readonly fn: string;
    readonly args?: ReadonlyArray<unknown>;
    readonly senderEvmAddress?: string;
    readonly gas?: number;
    readonly value?: string | number | bigint;
    readonly gasPrice?: string | number | bigint;
    readonly blockNumber?: string | number | bigint;
  }): Promise<Result<MirrorContractEstimateData>> => {
    return queryMirrorContractEstimate({
      client: context.mirrorClient,
      contractId: input.contractId,
      functionName: input.fn,
      ...(input.args ? { args: input.args } : {}),
      ...(input.senderEvmAddress ? { senderEvmAddress: input.senderEvmAddress } : {}),
      ...(input.gas !== undefined ? { gas: input.gas } : {}),
      ...(input.value !== undefined ? { value: input.value } : {}),
      ...(input.gasPrice !== undefined ? { gasPrice: input.gasPrice } : {}),
      ...(input.blockNumber !== undefined ? { blockNumber: input.blockNumber } : {}),
    });
  };

  return {
    deploy,
    execute,
    call,
    delete: del,
    update,
    info,
    logs,
    bytecode,
    simulate,
    estimateGas,
  };
}
