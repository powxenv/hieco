import { ContractCallQuery } from "@hiero-ledger/sdk";
import type {
  DeployContractParams,
  ExecuteContractParams,
  CallContractParams,
  DeleteContractParams,
  UpdateContractParams,
  ContractReceipt,
  ContractExecuteReceipt,
  ContractCallResult,
  TransactionReceiptData,
  SdkResult,
  ActionDeps,
} from "../types.ts";
import { requireSigningContext } from "../types.ts";
import { executeTransaction } from "../pipeline/executor.ts";
import { buildContractFunctionParameters } from "../pipeline/resolver.ts";

export async function deployContract(
  deps: ActionDeps,
  params: DeployContractParams,
): Promise<SdkResult<ContractReceipt>> {
  const signingResult = requireSigningContext({
    operatorKey: deps.operatorKey,
    signer: deps.signer,
  });
  if (!signingResult.success) return signingResult;

  const result = await executeTransaction(
    deps.nativeClient,
    { type: "deployContract", params },
    signingResult.data,
    deps.middleware,
    deps.emitter,
    deps.clientRef,
    params.retry,
  );

  if (!result.success) return result;

  const contractId = result.data.contractId;
  if (!contractId) {
    return {
      success: false,
      error: {
        _tag: "TransactionError",
        status: "MISSING_CONTRACT_ID",
        transactionId: result.data.transactionId,
        message: "Contract deployment succeeded but no contract ID was returned in the receipt",
      },
    };
  }

  return {
    success: true,
    data: {
      receipt: result.data,
      transactionId: result.data.transactionId,
      contractId,
    },
  };
}

export async function executeContract(
  deps: ActionDeps,
  params: ExecuteContractParams,
): Promise<SdkResult<ContractExecuteReceipt>> {
  const signingResult = requireSigningContext({
    operatorKey: deps.operatorKey,
    signer: deps.signer,
  });
  if (!signingResult.success) return signingResult;

  const result = await executeTransaction(
    deps.nativeClient,
    { type: "executeContract", params },
    signingResult.data,
    deps.middleware,
    deps.emitter,
    deps.clientRef,
    params.retry,
  );

  if (!result.success) return result;

  return {
    success: true,
    data: {
      receipt: result.data,
      transactionId: result.data.transactionId,
    },
  };
}

export async function callContract(
  deps: ActionDeps,
  params: CallContractParams,
): Promise<SdkResult<ContractCallResult>> {
  try {
    const signingResult = requireSigningContext({
      operatorKey: deps.operatorKey,
      signer: deps.signer,
    });
    if (!signingResult.success) return signingResult;

    const query = new ContractCallQuery().setContractId(params.contractId);

    if (params.gas !== undefined) query.setGas(params.gas);
    if (params.senderAccountId) query.setSenderAccountId(params.senderAccountId);

    if (params.functionParams) {
      query.setFunction(
        params.functionName,
        buildContractFunctionParameters(params.functionParams),
      );
    } else {
      query.setFunction(params.functionName);
    }

    const result =
      signingResult.data._tag === "signer"
        ? await query.executeWithSigner(signingResult.data.signer)
        : await query.execute(deps.nativeClient);

    return {
      success: true,
      data: {
        contractId: params.contractId,
        gasUsed: result.gasUsed.toNumber(),
        result: result.asBytes(),
        errorMessage: result.errorMessage ?? "",
      },
    };
  } catch (error) {
    return {
      success: false,
      error: {
        _tag: "TransactionError",
        status: "CONTRACT_CALL_FAILED",
        transactionId: "query",
        message:
          error instanceof Error
            ? `Contract call to ${params.contractId} failed: ${error.message}`
            : `Contract call to ${params.contractId} failed`,
      },
    };
  }
}

export async function deleteContract(
  deps: ActionDeps,
  params: DeleteContractParams,
): Promise<SdkResult<TransactionReceiptData>> {
  const signingResult = requireSigningContext({
    operatorKey: deps.operatorKey,
    signer: deps.signer,
  });
  if (!signingResult.success) return signingResult;

  return executeTransaction(
    deps.nativeClient,
    { type: "deleteContract", params },
    signingResult.data,
    deps.middleware,
    deps.emitter,
    deps.clientRef,
    params.retry,
  );
}

export async function updateContract(
  deps: ActionDeps,
  params: UpdateContractParams,
): Promise<SdkResult<TransactionReceiptData>> {
  const signingResult = requireSigningContext({
    operatorKey: deps.operatorKey,
    signer: deps.signer,
  });
  if (!signingResult.success) return signingResult;

  return executeTransaction(
    deps.nativeClient,
    { type: "updateContract", params },
    signingResult.data,
    deps.middleware,
    deps.emitter,
    deps.clientRef,
    params.retry,
  );
}
