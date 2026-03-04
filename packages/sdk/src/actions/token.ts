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
import { requireSigningContext } from "../types.ts";
import { executeTransaction } from "../pipeline/executor.ts";

export async function createToken(
  deps: ActionDeps,
  params: CreateTokenParams,
): Promise<SdkResult<TokenReceipt>> {
  const signingResult = requireSigningContext({
    operatorKey: deps.operatorKey,
    signer: deps.signer,
  });
  if (!signingResult.success) return signingResult;

  const result = await executeTransaction(
    deps.nativeClient,
    { type: "createToken", params },
    signingResult.data,
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
  const signingResult = requireSigningContext({
    operatorKey: deps.operatorKey,
    signer: deps.signer,
  });
  if (!signingResult.success) return signingResult;

  const result = await executeTransaction(
    deps.nativeClient,
    { type: "mintToken", params },
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
      totalSupply: result.data.totalSupply ?? "0",
      serialNumbers: result.data.serialNumbers,
    },
  };
}

export async function burnToken(
  deps: ActionDeps,
  params: BurnTokenParams,
): Promise<SdkResult<TransactionReceiptData>> {
  const signingResult = requireSigningContext({
    operatorKey: deps.operatorKey,
    signer: deps.signer,
  });
  if (!signingResult.success) return signingResult;

  return executeTransaction(
    deps.nativeClient,
    { type: "burnToken", params },
    signingResult.data,
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
  const signingResult = requireSigningContext({
    operatorKey: deps.operatorKey,
    signer: deps.signer,
  });
  if (!signingResult.success) return signingResult;

  return executeTransaction(
    deps.nativeClient,
    { type: "transferToken", params },
    signingResult.data,
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
  const signingResult = requireSigningContext({
    operatorKey: deps.operatorKey,
    signer: deps.signer,
  });
  if (!signingResult.success) return signingResult;

  return executeTransaction(
    deps.nativeClient,
    { type: "transferNft", params },
    signingResult.data,
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
  const signingResult = requireSigningContext({
    operatorKey: deps.operatorKey,
    signer: deps.signer,
  });
  if (!signingResult.success) return signingResult;

  return executeTransaction(
    deps.nativeClient,
    { type: "associateToken", params },
    signingResult.data,
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
  const signingResult = requireSigningContext({
    operatorKey: deps.operatorKey,
    signer: deps.signer,
  });
  if (!signingResult.success) return signingResult;

  return executeTransaction(
    deps.nativeClient,
    { type: "dissociateToken", params },
    signingResult.data,
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
  const signingResult = requireSigningContext({
    operatorKey: deps.operatorKey,
    signer: deps.signer,
  });
  if (!signingResult.success) return signingResult;

  return executeTransaction(
    deps.nativeClient,
    { type: "freezeToken", params },
    signingResult.data,
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
  const signingResult = requireSigningContext({
    operatorKey: deps.operatorKey,
    signer: deps.signer,
  });
  if (!signingResult.success) return signingResult;

  return executeTransaction(
    deps.nativeClient,
    { type: "unfreezeToken", params },
    signingResult.data,
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
  const signingResult = requireSigningContext({
    operatorKey: deps.operatorKey,
    signer: deps.signer,
  });
  if (!signingResult.success) return signingResult;

  return executeTransaction(
    deps.nativeClient,
    { type: "grantKyc", params },
    signingResult.data,
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
  const signingResult = requireSigningContext({
    operatorKey: deps.operatorKey,
    signer: deps.signer,
  });
  if (!signingResult.success) return signingResult;

  return executeTransaction(
    deps.nativeClient,
    { type: "revokeKyc", params },
    signingResult.data,
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
  const signingResult = requireSigningContext({
    operatorKey: deps.operatorKey,
    signer: deps.signer,
  });
  if (!signingResult.success) return signingResult;

  return executeTransaction(
    deps.nativeClient,
    { type: "pauseToken", params },
    signingResult.data,
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
  const signingResult = requireSigningContext({
    operatorKey: deps.operatorKey,
    signer: deps.signer,
  });
  if (!signingResult.success) return signingResult;

  return executeTransaction(
    deps.nativeClient,
    { type: "unpauseToken", params },
    signingResult.data,
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
  const signingResult = requireSigningContext({
    operatorKey: deps.operatorKey,
    signer: deps.signer,
  });
  if (!signingResult.success) return signingResult;

  return executeTransaction(
    deps.nativeClient,
    { type: "wipeToken", params },
    signingResult.data,
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
  const signingResult = requireSigningContext({
    operatorKey: deps.operatorKey,
    signer: deps.signer,
  });
  if (!signingResult.success) return signingResult;

  return executeTransaction(
    deps.nativeClient,
    { type: "deleteToken", params },
    signingResult.data,
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
  const signingResult = requireSigningContext({
    operatorKey: deps.operatorKey,
    signer: deps.signer,
  });
  if (!signingResult.success) return signingResult;

  return executeTransaction(
    deps.nativeClient,
    { type: "updateToken", params },
    signingResult.data,
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
  const signingResult = requireSigningContext({
    operatorKey: deps.operatorKey,
    signer: deps.signer,
  });
  if (!signingResult.success) return signingResult;

  return executeTransaction(
    deps.nativeClient,
    { type: "updateTokenFeeSchedule", params },
    signingResult.data,
    deps.middleware,
    deps.emitter,
    deps.clientRef,
    params.retry,
  );
}
