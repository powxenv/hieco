import type {
  ScheduleTransactionParams,
  SignScheduleParams,
  DeleteScheduleParams,
  ScheduleReceipt,
  TransactionReceiptData,
  SdkResult,
  ActionDeps,
} from "../types.ts";
import { requireOperatorKey } from "../types.ts";
import { executeTransaction } from "../pipeline/executor.ts";

export async function scheduleTransaction(
  deps: ActionDeps,
  params: ScheduleTransactionParams,
): Promise<SdkResult<ScheduleReceipt>> {
  const keyResult = requireOperatorKey(deps.operatorKey);
  if (!keyResult.success) return keyResult;

  const result = await executeTransaction(
    deps.nativeClient,
    "scheduleTransaction",
    params,
    keyResult.data,
    deps.middleware,
    deps.emitter,
    deps.clientRef,
    params.retry,
  );

  if (!result.success) return result;

  const scheduleId = result.data.scheduleId;
  if (!scheduleId) {
    return {
      success: false,
      error: {
        _tag: "TransactionError",
        status: "MISSING_SCHEDULE_ID",
        transactionId: result.data.transactionId,
        message: "Schedule creation succeeded but no schedule ID was returned in the receipt",
      },
    };
  }

  return {
    success: true,
    data: {
      receipt: result.data,
      transactionId: result.data.transactionId,
      scheduleId,
    },
  };
}

export async function signSchedule(
  deps: ActionDeps,
  params: SignScheduleParams,
): Promise<SdkResult<TransactionReceiptData>> {
  const keyResult = requireOperatorKey(deps.operatorKey);
  if (!keyResult.success) return keyResult;

  return executeTransaction(
    deps.nativeClient,
    "signSchedule",
    params,
    keyResult.data,
    deps.middleware,
    deps.emitter,
    deps.clientRef,
    params.retry,
  );
}

export async function deleteSchedule(
  deps: ActionDeps,
  params: DeleteScheduleParams,
): Promise<SdkResult<TransactionReceiptData>> {
  const keyResult = requireOperatorKey(deps.operatorKey);
  if (!keyResult.success) return keyResult;

  return executeTransaction(
    deps.nativeClient,
    "deleteSchedule",
    params,
    keyResult.data,
    deps.middleware,
    deps.emitter,
    deps.clientRef,
    params.retry,
  );
}
