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
import { requireSigningContext } from "../types.ts";
import { executeTransaction } from "../pipeline/executor.ts";

export async function createTopic(
  deps: ActionDeps,
  params: CreateTopicParams,
): Promise<SdkResult<TopicReceipt>> {
  const signingResult = requireSigningContext({
    operatorKey: deps.operatorKey,
    signer: deps.signer,
  });
  if (!signingResult.success) return signingResult;

  const result = await executeTransaction(
    deps.nativeClient,
    { type: "createTopic", params },
    signingResult.data,
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
  const signingResult = requireSigningContext({
    operatorKey: deps.operatorKey,
    signer: deps.signer,
  });
  if (!signingResult.success) return signingResult;

  return executeTransaction(
    deps.nativeClient,
    { type: "updateTopic", params },
    signingResult.data,
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
  const signingResult = requireSigningContext({
    operatorKey: deps.operatorKey,
    signer: deps.signer,
  });
  if (!signingResult.success) return signingResult;

  return executeTransaction(
    deps.nativeClient,
    { type: "deleteTopic", params },
    signingResult.data,
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
  const signingResult = requireSigningContext({
    operatorKey: deps.operatorKey,
    signer: deps.signer,
  });
  if (!signingResult.success) return signingResult;

  const result = await executeTransaction(
    deps.nativeClient,
    { type: "submitMessage", params },
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
      topicSequenceNumber: result.data.topicSequenceNumber ?? "0",
    },
  };
}
