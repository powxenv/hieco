import type {
  CreateTopicParams,
  UpdateTopicParams,
  DeleteTopicParams,
  SubmitMessageParams,
  TopicReceipt,
  MessageReceipt,
  TransactionReceiptData,
  SdkResult,
  ActionDeps,
} from "../types.ts";
import { requireOperatorKey } from "../types.ts";
import { executeTransaction } from "../pipeline/executor.ts";

export async function createTopic(
  deps: ActionDeps,
  params: CreateTopicParams,
): Promise<SdkResult<TopicReceipt>> {
  const keyResult = requireOperatorKey(deps.operatorKey);
  if (!keyResult.success) return keyResult;

  const result = await executeTransaction(
    deps.nativeClient,
    "createTopic",
    params,
    keyResult.data,
    deps.middleware,
    deps.emitter,
    deps.clientRef,
    params.retry,
  );

  if (!result.success) return result;

  const topicId = result.data.topicId;
  if (!topicId) {
    return {
      success: false,
      error: {
        _tag: "TransactionError",
        status: "MISSING_TOPIC_ID",
        transactionId: result.data.transactionId,
        message: `Topic creation succeeded but no topic ID was returned in the receipt`,
      },
    };
  }

  return {
    success: true,
    data: {
      receipt: result.data,
      transactionId: result.data.transactionId,
      topicId,
    },
  };
}

export async function updateTopic(
  deps: ActionDeps,
  params: UpdateTopicParams,
): Promise<SdkResult<TransactionReceiptData>> {
  const keyResult = requireOperatorKey(deps.operatorKey);
  if (!keyResult.success) return keyResult;

  return executeTransaction(
    deps.nativeClient,
    "updateTopic",
    params,
    keyResult.data,
    deps.middleware,
    deps.emitter,
    deps.clientRef,
    params.retry,
  );
}

export async function deleteTopic(
  deps: ActionDeps,
  params: DeleteTopicParams,
): Promise<SdkResult<TransactionReceiptData>> {
  const keyResult = requireOperatorKey(deps.operatorKey);
  if (!keyResult.success) return keyResult;

  return executeTransaction(
    deps.nativeClient,
    "deleteTopic",
    params,
    keyResult.data,
    deps.middleware,
    deps.emitter,
    deps.clientRef,
    params.retry,
  );
}

export async function submitMessage(
  deps: ActionDeps,
  params: SubmitMessageParams,
): Promise<SdkResult<MessageReceipt>> {
  const keyResult = requireOperatorKey(deps.operatorKey);
  if (!keyResult.success) return keyResult;

  const result = await executeTransaction(
    deps.nativeClient,
    "submitMessage",
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
      topicSequenceNumber: result.data.topicSequenceNumber ?? "0",
    },
  };
}
