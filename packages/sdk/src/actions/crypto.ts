import type {
  TransferParams,
  CreateAccountParams,
  UpdateAccountParams,
  DeleteAccountParams,
  ApproveAllowanceParams,
  TransferResult,
  CreateAccountResult,
  UpdateAccountResult,
  DeleteAccountResult,
  TransactionReceiptData,
  SdkResult,
  ActionDeps,
} from "../types.ts";
import { requireSigningContext } from "../types.ts";
import { executeTransaction } from "../pipeline/executor.ts";

export async function transfer(
  deps: ActionDeps,
  params: TransferParams,
): Promise<SdkResult<TransferResult>> {
  const signingResult = requireSigningContext({
    operatorKey: deps.operatorKey,
    signer: deps.signer,
  });
  if (!signingResult.success) return signingResult;

  const result = await executeTransaction(
    deps.nativeClient,
    { type: "transfer", params },
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

export async function createAccount(
  deps: ActionDeps,
  params: CreateAccountParams,
): Promise<SdkResult<CreateAccountResult>> {
  const signingResult = requireSigningContext({
    operatorKey: deps.operatorKey,
    signer: deps.signer,
  });
  if (!signingResult.success) return signingResult;

  const result = await executeTransaction(
    deps.nativeClient,
    { type: "createAccount", params },
    signingResult.data,
    deps.middleware,
    deps.emitter,
    deps.clientRef,
    params.retry,
  );

  if (!result.success) return result;

  const accountId = result.data.accountId;
  if (!accountId) {
    return {
      success: false,
      error: {
        _tag: "TransactionError",
        status: "MISSING_ACCOUNT_ID",
        transactionId: result.data.transactionId,
        message: `Account creation succeeded but no account ID was returned in the receipt`,
      },
    };
  }

  return {
    success: true,
    data: {
      receipt: result.data,
      transactionId: result.data.transactionId,
      accountId,
    },
  };
}

export async function updateAccount(
  deps: ActionDeps,
  params: UpdateAccountParams,
): Promise<SdkResult<UpdateAccountResult>> {
  const signingResult = requireSigningContext({
    operatorKey: deps.operatorKey,
    signer: deps.signer,
  });
  if (!signingResult.success) return signingResult;

  const result = await executeTransaction(
    deps.nativeClient,
    { type: "updateAccount", params },
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

export async function deleteAccount(
  deps: ActionDeps,
  params: DeleteAccountParams,
): Promise<SdkResult<DeleteAccountResult>> {
  const signingResult = requireSigningContext({
    operatorKey: deps.operatorKey,
    signer: deps.signer,
  });
  if (!signingResult.success) return signingResult;

  const result = await executeTransaction(
    deps.nativeClient,
    { type: "deleteAccount", params },
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

export async function approveAllowance(
  deps: ActionDeps,
  params: ApproveAllowanceParams,
): Promise<SdkResult<TransactionReceiptData>> {
  const signingResult = requireSigningContext({
    operatorKey: deps.operatorKey,
    signer: deps.signer,
  });
  if (!signingResult.success) return signingResult;

  return executeTransaction(
    deps.nativeClient,
    { type: "approveAllowance", params },
    signingResult.data,
    deps.middleware,
    deps.emitter,
    deps.clientRef,
    params.retry,
  );
}
