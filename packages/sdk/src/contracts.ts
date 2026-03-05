import type { EntityId } from "@hieco/types";
import type {
  CallContractParams,
  DeployContractParams,
  DeleteContractParams,
  ExecuteContractParams,
  TransactionDescriptor,
  UpdateContractParams,
} from "./types/params.ts";
import type {
  ContractCallResult,
  ContractExecuteReceipt,
  ContractReceipt,
  TransactionReceiptData,
} from "./types/results-shapes.ts";
import type { Result } from "./types/results.ts";
import { err, ok } from "./types/results.ts";
import { decodeReturn } from "./abi.ts";
import { ensureContractId } from "./transactions.ts";

export interface ContractsNamespace {
  deploy: ((params: DeployContractParams) => Promise<Result<ContractReceipt>>) & {
    tx: (params: DeployContractParams) => TransactionDescriptor;
  };
  execute: ((params: ExecuteContractParams) => Promise<Result<ContractExecuteReceipt>>) & {
    tx: (params: ExecuteContractParams) => TransactionDescriptor;
  };
  call: <T = unknown>(params: CallContractParams) => Promise<Result<ContractCallResult<T>>>;
  delete: ((params: DeleteContractParams) => Promise<Result<TransactionReceiptData>>) & {
    tx: (params: DeleteContractParams) => TransactionDescriptor;
  };
  update: ((params: UpdateContractParams) => Promise<Result<TransactionReceiptData>>) & {
    tx: (params: UpdateContractParams) => TransactionDescriptor;
  };
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

  const call = async <T = unknown>(
    params: CallContractParams,
  ): Promise<Result<ContractCallResult<T>>> => {
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
      value: decoded.value as T,
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

  return {
    deploy,
    execute,
    call,
    delete: del,
    update,
  };
}
