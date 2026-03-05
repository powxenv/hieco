import type {
  ScheduleTransactionParams,
  SignScheduleParams,
  DeleteScheduleParams,
  ScheduleReceipt,
  TransactionReceiptData,
  SdkResult,
  ActionDeps,
} from "../types.ts";
import { requireSigningContext } from "../types.ts";
import { executeTransaction } from "../pipeline/executor.ts";

export async function scheduleTransaction(
  deps: ActionDeps,
  params: ScheduleTransactionParams,
): Promise<SdkResult<ScheduleReceipt>> {
  const signingResult = requireSigningContext({
    operatorKey: deps.operatorKey,
    signer: deps.signer,
  });
  if (!signingResult.success) return signingResult;

  const result = await executeTransaction(
    deps.nativeClient,
    { type: "scheduleTransaction", params },
    signingResult.data,
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
  const signingResult = requireSigningContext({
    operatorKey: deps.operatorKey,
    signer: deps.signer,
  });
  if (!signingResult.success) return signingResult;

  return executeTransaction(
    deps.nativeClient,
    { type: "signSchedule", params },
    signingResult.data,
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
  const signingResult = requireSigningContext({
    operatorKey: deps.operatorKey,
    signer: deps.signer,
  });
  if (!signingResult.success) return signingResult;

  return executeTransaction(
    deps.nativeClient,
    { type: "deleteSchedule", params },
    signingResult.data,
    deps.middleware,
    deps.emitter,
    deps.clientRef,
    params.retry,
  );
}
