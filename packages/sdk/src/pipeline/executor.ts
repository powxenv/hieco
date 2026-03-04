import { Client, ReceiptStatusError, Status, PrivateKey } from "@hiero-ledger/sdk";
import { asEntityId } from "@hieco/mirror-shared";
import { resolveTransaction } from "./resolver.ts";
import type {
  TransactionType,
  TransactionMiddleware,
  TransactionContext,
  TransactionReceiptData,
  SdkResult,
  HieroClientRef,
  RetryConfig,
  AnyTransactionParams,
  SigningContext,
} from "../types.ts";
import { transactionError, invalidSignatureError } from "../errors/messages.ts";
import type { TransactionEventEmitter } from "../events/emitter.ts";

const INSUFFICIENT_BALANCE_STATUSES = new Set([
  "INSUFFICIENT_ACCOUNT_BALANCE",
  "INSUFFICIENT_PAYER_BALANCE",
]);

const INVALID_SIGNATURE_STATUSES = new Set(["INVALID_SIGNATURE", "KEY_NOT_PROVIDED"]);

function statusToString(status: Status): string {
  return status.toString();
}

function mapReceiptStatusError(
  err: ReceiptStatusError,
  txId: string,
): SdkResult<TransactionReceiptData> {
  const statusStr = statusToString(err.status);

  if (INSUFFICIENT_BALANCE_STATUSES.has(statusStr)) {
    return { success: false, error: transactionError(statusStr, txId) };
  }

  if (INVALID_SIGNATURE_STATUSES.has(statusStr)) {
    return { success: false, error: invalidSignatureError(txId) };
  }

  return { success: false, error: transactionError(statusStr, txId) };
}

export async function executeTransaction(
  nativeClient: Client,
  type: TransactionType,
  params: AnyTransactionParams,
  signing: SigningContext,
  middleware: ReadonlyArray<TransactionMiddleware>,
  emitter: TransactionEventEmitter,
  clientRef: HieroClientRef,
  perTransactionRetry?: RetryConfig | false,
): Promise<SdkResult<TransactionReceiptData>> {
  const startedAt = Date.now();
  const paramsRecord: Record<string, unknown> = { ...params };

  emitter.emit("transaction:before", { type, params: paramsRecord });

  const context: TransactionContext = {
    type,
    params: paramsRecord,
    client: clientRef,
    attempt: 0,
    transactionId: undefined,
    startedAt,
    retry: perTransactionRetry,
  };

  const coreExecution = async (): Promise<SdkResult<TransactionReceiptData>> => {
    try {
      const operatorKey = signing._tag === "operator" ? signing.operatorKey : undefined;
      const nativeTx = resolveTransaction(type, paramsRecord, operatorKey, signing);

      const submitted =
        signing._tag === "signer"
          ? await (
              await (await nativeTx.freezeWithSigner(signing.signer)).signWithSigner(signing.signer)
            ).executeWithSigner(signing.signer)
          : await (
              await (await nativeTx.freezeWith(nativeClient)).sign(
                PrivateKey.fromStringDer(signing.operatorKey),
              )
            ).execute(nativeClient);

      const txId = submitted.transactionId?.toString() ?? "unknown";

      emitter.emit("transaction:submitted", {
        type,
        transactionId: txId,
        nodeId: submitted.nodeId.toString(),
      });

      emitter.emit("transaction:signed", { type, transactionId: txId });

      const receipt =
        signing._tag === "signer"
          ? await submitted.getReceiptWithSigner(signing.signer)
          : await submitted.getReceipt(nativeClient);

      const accountIdStr = receipt.accountId?.toString();
      const receiptData: TransactionReceiptData = {
        status: statusToString(receipt.status),
        transactionId: txId,
        accountId: accountIdStr ? asEntityId(accountIdStr) : undefined,
        fileId: receipt.fileId ? asEntityId(receipt.fileId.toString()) : undefined,
        contractId: receipt.contractId ? asEntityId(receipt.contractId.toString()) : undefined,
        topicId: receipt.topicId ? asEntityId(receipt.topicId.toString()) : undefined,
        tokenId: receipt.tokenId ? asEntityId(receipt.tokenId.toString()) : undefined,
        scheduleId: receipt.scheduleId ? asEntityId(receipt.scheduleId.toString()) : undefined,
        totalSupply: receipt.totalSupply?.toString(),
        serialNumbers: receipt.serials?.map((s: { toNumber(): number }) => s.toNumber()),
        topicSequenceNumber: receipt.topicSequenceNumber?.toString(),
      };

      emitter.emit("transaction:confirmed", {
        type,
        transactionId: txId,
        receipt: receiptData,
        durationMs: Date.now() - startedAt,
      });

      return { success: true, data: receiptData };
    } catch (error) {
      if (error instanceof ReceiptStatusError) {
        const txId = error.transactionId?.toString() ?? "unknown";
        const result = mapReceiptStatusError(error, txId);
        if (!result.success) {
          emitter.emit("transaction:error", { type, error: result.error });
        }
        return result;
      }

      const sdkError = transactionError("UNKNOWN", context.transactionId ?? "unknown");
      emitter.emit("transaction:error", { type, error: sdkError });
      return { success: false, error: sdkError };
    }
  };

  const chain = buildMiddlewareChain(middleware, context, coreExecution);
  return chain();
}

function buildMiddlewareChain(
  middleware: ReadonlyArray<TransactionMiddleware>,
  context: TransactionContext,
  core: () => Promise<SdkResult<TransactionReceiptData>>,
): () => Promise<SdkResult<TransactionReceiptData>> {
  let next = core;

  for (let i = middleware.length - 1; i >= 0; i--) {
    const mw = middleware[i];
    if (!mw) continue;
    const currentNext = next;
    next = () => mw(context, currentNext);
  }

  return next;
}
