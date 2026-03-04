import type {
  CreateFileParams,
  AppendFileParams,
  UpdateFileParams,
  DeleteFileParams,
  FileReceipt,
  TransactionReceiptData,
  SdkResult,
  ActionDeps,
} from "../types.ts";
import { requireOperatorKey } from "../types.ts";
import { executeTransaction } from "../pipeline/executor.ts";

export async function createFile(
  deps: ActionDeps,
  params: CreateFileParams,
): Promise<SdkResult<FileReceipt>> {
  const keyResult = requireOperatorKey(deps.operatorKey);
  if (!keyResult.success) return keyResult;

  const result = await executeTransaction(
    deps.nativeClient,
    "createFile",
    params,
    keyResult.data,
    deps.middleware,
    deps.emitter,
    deps.clientRef,
    params.retry,
  );

  if (!result.success) return result;

  const fileId = result.data.fileId;
  if (!fileId) {
    return {
      success: false,
      error: {
        _tag: "TransactionError",
        status: "MISSING_FILE_ID",
        transactionId: result.data.transactionId,
        message: "File creation succeeded but no file ID was returned in the receipt",
      },
    };
  }

  return {
    success: true,
    data: {
      receipt: result.data,
      transactionId: result.data.transactionId,
      fileId,
    },
  };
}

export async function appendFile(
  deps: ActionDeps,
  params: AppendFileParams,
): Promise<SdkResult<TransactionReceiptData>> {
  const keyResult = requireOperatorKey(deps.operatorKey);
  if (!keyResult.success) return keyResult;

  return executeTransaction(
    deps.nativeClient,
    "appendFile",
    params,
    keyResult.data,
    deps.middleware,
    deps.emitter,
    deps.clientRef,
    params.retry,
  );
}

export async function updateFile(
  deps: ActionDeps,
  params: UpdateFileParams,
): Promise<SdkResult<TransactionReceiptData>> {
  const keyResult = requireOperatorKey(deps.operatorKey);
  if (!keyResult.success) return keyResult;

  return executeTransaction(
    deps.nativeClient,
    "updateFile",
    params,
    keyResult.data,
    deps.middleware,
    deps.emitter,
    deps.clientRef,
    params.retry,
  );
}

export async function deleteFile(
  deps: ActionDeps,
  params: DeleteFileParams,
): Promise<SdkResult<TransactionReceiptData>> {
  const keyResult = requireOperatorKey(deps.operatorKey);
  if (!keyResult.success) return keyResult;

  return executeTransaction(
    deps.nativeClient,
    "deleteFile",
    params,
    keyResult.data,
    deps.middleware,
    deps.emitter,
    deps.clientRef,
    params.retry,
  );
}
