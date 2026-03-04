import type {
  CreateTokenParams,
  MintTokenParams,
  BurnTokenParams,
  TransferTokenParams,
  TransferNftParams,
  AssociateTokenParams,
  DissociateTokenParams,
  FreezeTokenParams,
  UnfreezeTokenParams,
  GrantKycParams,
  RevokeKycParams,
  PauseTokenParams,
  UnpauseTokenParams,
  WipeTokenParams,
  DeleteTokenParams,
  UpdateTokenParams,
  UpdateTokenFeeScheduleParams,
  TokenReceipt,
  MintReceipt,
  TransactionReceiptData,
  SdkResult,
  ActionDeps,
} from "../types.ts";
import { requireOperatorKey } from "../types.ts";
import { executeTransaction } from "../pipeline/executor.ts";

export async function createToken(
  deps: ActionDeps,
  params: CreateTokenParams,
): Promise<SdkResult<TokenReceipt>> {
  const keyResult = requireOperatorKey(deps.operatorKey);
  if (!keyResult.success) return keyResult;

  const result = await executeTransaction(
    deps.nativeClient,
    "createToken",
    params,
    keyResult.data,
    deps.middleware,
    deps.emitter,
    deps.clientRef,
    params.retry,
  );

  if (!result.success) return result;

  const tokenId = result.data.tokenId;
  if (!tokenId) {
    return {
      success: false,
      error: {
        _tag: "TransactionError",
        status: "MISSING_TOKEN_ID",
        transactionId: result.data.transactionId,
        message: `Token creation succeeded but no token ID was returned in the receipt`,
      },
    };
  }

  return {
    success: true,
    data: {
      receipt: result.data,
      transactionId: result.data.transactionId,
      tokenId,
    },
  };
}

export async function mintToken(
  deps: ActionDeps,
  params: MintTokenParams,
): Promise<SdkResult<MintReceipt>> {
  const keyResult = requireOperatorKey(deps.operatorKey);
  if (!keyResult.success) return keyResult;

  const result = await executeTransaction(
    deps.nativeClient,
    "mintToken",
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
      totalSupply: result.data.totalSupply ?? "0",
      serialNumbers: result.data.serialNumbers,
    },
  };
}

export async function burnToken(
  deps: ActionDeps,
  params: BurnTokenParams,
): Promise<SdkResult<TransactionReceiptData>> {
  const keyResult = requireOperatorKey(deps.operatorKey);
  if (!keyResult.success) return keyResult;

  return executeTransaction(
    deps.nativeClient,
    "burnToken",
    params,
    keyResult.data,
    deps.middleware,
    deps.emitter,
    deps.clientRef,
    params.retry,
  );
}

export async function transferToken(
  deps: ActionDeps,
  params: TransferTokenParams,
): Promise<SdkResult<TransactionReceiptData>> {
  const keyResult = requireOperatorKey(deps.operatorKey);
  if (!keyResult.success) return keyResult;

  return executeTransaction(
    deps.nativeClient,
    "transferToken",
    params,
    keyResult.data,
    deps.middleware,
    deps.emitter,
    deps.clientRef,
    params.retry,
  );
}

export async function transferNft(
  deps: ActionDeps,
  params: TransferNftParams,
): Promise<SdkResult<TransactionReceiptData>> {
  const keyResult = requireOperatorKey(deps.operatorKey);
  if (!keyResult.success) return keyResult;

  return executeTransaction(
    deps.nativeClient,
    "transferNft",
    params,
    keyResult.data,
    deps.middleware,
    deps.emitter,
    deps.clientRef,
    params.retry,
  );
}

export async function associateToken(
  deps: ActionDeps,
  params: AssociateTokenParams,
): Promise<SdkResult<TransactionReceiptData>> {
  const keyResult = requireOperatorKey(deps.operatorKey);
  if (!keyResult.success) return keyResult;

  return executeTransaction(
    deps.nativeClient,
    "associateToken",
    params,
    keyResult.data,
    deps.middleware,
    deps.emitter,
    deps.clientRef,
    params.retry,
  );
}

export async function dissociateToken(
  deps: ActionDeps,
  params: DissociateTokenParams,
): Promise<SdkResult<TransactionReceiptData>> {
  const keyResult = requireOperatorKey(deps.operatorKey);
  if (!keyResult.success) return keyResult;

  return executeTransaction(
    deps.nativeClient,
    "dissociateToken",
    params,
    keyResult.data,
    deps.middleware,
    deps.emitter,
    deps.clientRef,
    params.retry,
  );
}

export async function freezeToken(
  deps: ActionDeps,
  params: FreezeTokenParams,
): Promise<SdkResult<TransactionReceiptData>> {
  const keyResult = requireOperatorKey(deps.operatorKey);
  if (!keyResult.success) return keyResult;

  return executeTransaction(
    deps.nativeClient,
    "freezeToken",
    params,
    keyResult.data,
    deps.middleware,
    deps.emitter,
    deps.clientRef,
    params.retry,
  );
}

export async function unfreezeToken(
  deps: ActionDeps,
  params: UnfreezeTokenParams,
): Promise<SdkResult<TransactionReceiptData>> {
  const keyResult = requireOperatorKey(deps.operatorKey);
  if (!keyResult.success) return keyResult;

  return executeTransaction(
    deps.nativeClient,
    "unfreezeToken",
    params,
    keyResult.data,
    deps.middleware,
    deps.emitter,
    deps.clientRef,
    params.retry,
  );
}

export async function grantKyc(
  deps: ActionDeps,
  params: GrantKycParams,
): Promise<SdkResult<TransactionReceiptData>> {
  const keyResult = requireOperatorKey(deps.operatorKey);
  if (!keyResult.success) return keyResult;

  return executeTransaction(
    deps.nativeClient,
    "grantKyc",
    params,
    keyResult.data,
    deps.middleware,
    deps.emitter,
    deps.clientRef,
    params.retry,
  );
}

export async function revokeKyc(
  deps: ActionDeps,
  params: RevokeKycParams,
): Promise<SdkResult<TransactionReceiptData>> {
  const keyResult = requireOperatorKey(deps.operatorKey);
  if (!keyResult.success) return keyResult;

  return executeTransaction(
    deps.nativeClient,
    "revokeKyc",
    params,
    keyResult.data,
    deps.middleware,
    deps.emitter,
    deps.clientRef,
    params.retry,
  );
}

export async function pauseToken(
  deps: ActionDeps,
  params: PauseTokenParams,
): Promise<SdkResult<TransactionReceiptData>> {
  const keyResult = requireOperatorKey(deps.operatorKey);
  if (!keyResult.success) return keyResult;

  return executeTransaction(
    deps.nativeClient,
    "pauseToken",
    params,
    keyResult.data,
    deps.middleware,
    deps.emitter,
    deps.clientRef,
    params.retry,
  );
}

export async function unpauseToken(
  deps: ActionDeps,
  params: UnpauseTokenParams,
): Promise<SdkResult<TransactionReceiptData>> {
  const keyResult = requireOperatorKey(deps.operatorKey);
  if (!keyResult.success) return keyResult;

  return executeTransaction(
    deps.nativeClient,
    "unpauseToken",
    params,
    keyResult.data,
    deps.middleware,
    deps.emitter,
    deps.clientRef,
    params.retry,
  );
}

export async function wipeToken(
  deps: ActionDeps,
  params: WipeTokenParams,
): Promise<SdkResult<TransactionReceiptData>> {
  const keyResult = requireOperatorKey(deps.operatorKey);
  if (!keyResult.success) return keyResult;

  return executeTransaction(
    deps.nativeClient,
    "wipeToken",
    params,
    keyResult.data,
    deps.middleware,
    deps.emitter,
    deps.clientRef,
    params.retry,
  );
}

export async function deleteToken(
  deps: ActionDeps,
  params: DeleteTokenParams,
): Promise<SdkResult<TransactionReceiptData>> {
  const keyResult = requireOperatorKey(deps.operatorKey);
  if (!keyResult.success) return keyResult;

  return executeTransaction(
    deps.nativeClient,
    "deleteToken",
    params,
    keyResult.data,
    deps.middleware,
    deps.emitter,
    deps.clientRef,
    params.retry,
  );
}

export async function updateToken(
  deps: ActionDeps,
  params: UpdateTokenParams,
): Promise<SdkResult<TransactionReceiptData>> {
  const keyResult = requireOperatorKey(deps.operatorKey);
  if (!keyResult.success) return keyResult;

  return executeTransaction(
    deps.nativeClient,
    "updateToken",
    params,
    keyResult.data,
    deps.middleware,
    deps.emitter,
    deps.clientRef,
    params.retry,
  );
}

export async function updateTokenFeeSchedule(
  deps: ActionDeps,
  params: UpdateTokenFeeScheduleParams,
): Promise<SdkResult<TransactionReceiptData>> {
  const keyResult = requireOperatorKey(deps.operatorKey);
  if (!keyResult.success) return keyResult;

  return executeTransaction(
    deps.nativeClient,
    "updateTokenFeeSchedule",
    params,
    keyResult.data,
    deps.middleware,
    deps.emitter,
    deps.clientRef,
    params.retry,
  );
}
