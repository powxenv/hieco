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
import { requireOperatorKey } from "../types.ts";
import { executeTransaction } from "../pipeline/executor.ts";

export async function transfer(
  deps: ActionDeps,
  params: TransferParams,
): Promise<SdkResult<TransferResult>> {
  const keyResult = requireOperatorKey(deps.operatorKey);
  if (!keyResult.success) return keyResult;

  const result = await executeTransaction(
    deps.nativeClient,
    "transfer",
    params,
    keyResult.data,
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
  const keyResult = requireOperatorKey(deps.operatorKey);
  if (!keyResult.success) return keyResult;

  const result = await executeTransaction(
    deps.nativeClient,
    "createAccount",
    params,
    keyResult.data,
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
  const keyResult = requireOperatorKey(deps.operatorKey);
  if (!keyResult.success) return keyResult;

  const result = await executeTransaction(
    deps.nativeClient,
    "updateAccount",
    params,
    keyResult.data,
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
  const keyResult = requireOperatorKey(deps.operatorKey);
  if (!keyResult.success) return keyResult;

  const result = await executeTransaction(
    deps.nativeClient,
    "deleteAccount",
    params,
    keyResult.data,
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
  const keyResult = requireOperatorKey(deps.operatorKey);
  if (!keyResult.success) return keyResult;

  return executeTransaction(
    deps.nativeClient,
    "approveAllowance",
    params,
    keyResult.data,
    deps.middleware,
    deps.emitter,
    deps.clientRef,
    params.retry,
  );
}
