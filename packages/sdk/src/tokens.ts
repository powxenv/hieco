import type { EntityId } from "@hieco/types";
import type {
  AssociateTokenParams,
  BurnTokenParams,
  CreateTokenParams,
  DeleteTokenParams,
  DissociateTokenParams,
  FreezeTokenParams,
  GrantKycParams,
  MintTokenParams,
  PauseTokenParams,
  RevokeKycParams,
  TransferNftParams,
  TransferTokenParams,
  UnfreezeTokenParams,
  UnpauseTokenParams,
  UpdateTokenFeeScheduleParams,
  UpdateTokenParams,
  WipeTokenParams,
  TransactionDescriptor,
} from "./types/params.ts";
import type { MintReceipt, TokenReceipt, TransactionReceiptData } from "./types/results-shapes.ts";
import type { Result } from "./types/results.ts";
import { err, ok } from "./types/results.ts";
import { ensureTokenId, inferAccountId } from "./transactions.ts";

export interface TokensNamespace {
  create: ((params: CreateTokenParams) => Promise<Result<TokenReceipt>>) & {
    tx: (params: CreateTokenParams) => TransactionDescriptor;
  };
  mint: ((params: MintTokenParams) => Promise<Result<MintReceipt>>) & {
    tx: (params: MintTokenParams) => TransactionDescriptor;
  };
  burn: ((params: BurnTokenParams) => Promise<Result<TransactionReceiptData>>) & {
    tx: (params: BurnTokenParams) => TransactionDescriptor;
  };
  transfer: ((params: TransferTokenParams) => Promise<Result<TransactionReceiptData>>) & {
    tx: (params: TransferTokenParams) => TransactionDescriptor;
  };
  transferNft: ((params: TransferNftParams) => Promise<Result<TransactionReceiptData>>) & {
    tx: (params: TransferNftParams) => TransactionDescriptor;
  };
  associate: ((params: AssociateTokenParams) => Promise<Result<TransactionReceiptData>>) & {
    tx: (params: AssociateTokenParams) => TransactionDescriptor;
  };
  dissociate: ((params: DissociateTokenParams) => Promise<Result<TransactionReceiptData>>) & {
    tx: (params: DissociateTokenParams) => TransactionDescriptor;
  };
  freeze: ((params: FreezeTokenParams) => Promise<Result<TransactionReceiptData>>) & {
    tx: (params: FreezeTokenParams) => TransactionDescriptor;
  };
  unfreeze: ((params: UnfreezeTokenParams) => Promise<Result<TransactionReceiptData>>) & {
    tx: (params: UnfreezeTokenParams) => TransactionDescriptor;
  };
  grantKyc: ((params: GrantKycParams) => Promise<Result<TransactionReceiptData>>) & {
    tx: (params: GrantKycParams) => TransactionDescriptor;
  };
  revokeKyc: ((params: RevokeKycParams) => Promise<Result<TransactionReceiptData>>) & {
    tx: (params: RevokeKycParams) => TransactionDescriptor;
  };
  pause: ((params: PauseTokenParams) => Promise<Result<TransactionReceiptData>>) & {
    tx: (params: PauseTokenParams) => TransactionDescriptor;
  };
  unpause: ((params: UnpauseTokenParams) => Promise<Result<TransactionReceiptData>>) & {
    tx: (params: UnpauseTokenParams) => TransactionDescriptor;
  };
  wipe: ((params: WipeTokenParams) => Promise<Result<TransactionReceiptData>>) & {
    tx: (params: WipeTokenParams) => TransactionDescriptor;
  };
  delete: ((params: DeleteTokenParams) => Promise<Result<TransactionReceiptData>>) & {
    tx: (params: DeleteTokenParams) => TransactionDescriptor;
  };
  update: ((params: UpdateTokenParams) => Promise<Result<TransactionReceiptData>>) & {
    tx: (params: UpdateTokenParams) => TransactionDescriptor;
  };
  fees: ((params: UpdateTokenFeeScheduleParams) => Promise<Result<TransactionReceiptData>>) & {
    tx: (params: UpdateTokenFeeScheduleParams) => TransactionDescriptor;
  };
}

export function createTokensNamespace(context: {
  readonly submit: (descriptor: TransactionDescriptor) => Promise<Result<TransactionReceiptData>>;
  readonly operator?: EntityId;
  readonly signer?: import("@hiero-ledger/sdk").Signer;
}): TokensNamespace {
  const create = async (params: CreateTokenParams): Promise<Result<TokenReceipt>> => {
    const result = await context.submit({ kind: "tokens.create", params });
    if (!result.ok) return result;
    const tokenId = ensureTokenId(result);
    if (!tokenId.ok) return tokenId;
    return ok({
      receipt: result.value,
      transactionId: result.value.transactionId,
      tokenId: tokenId.value,
    });
  };

  create.tx = (params: CreateTokenParams): TransactionDescriptor => ({
    kind: "tokens.create",
    params,
  });

  const mint = async (params: MintTokenParams): Promise<Result<MintReceipt>> => {
    const result = await context.submit({ kind: "tokens.mint", params });
    if (!result.ok) return result;
    return ok({
      receipt: result.value,
      transactionId: result.value.transactionId,
      totalSupply: result.value.totalSupply ?? "0",
      ...(result.value.serialNumbers ? { serialNumbers: result.value.serialNumbers } : {}),
    });
  };

  mint.tx = (params: MintTokenParams): TransactionDescriptor => ({
    kind: "tokens.mint",
    params,
  });

  const burn = async (params: BurnTokenParams): Promise<Result<TransactionReceiptData>> => {
    const result = await context.submit({ kind: "tokens.burn", params });
    if (!result.ok) return result;
    return ok(result.value);
  };

  burn.tx = (params: BurnTokenParams): TransactionDescriptor => ({
    kind: "tokens.burn",
    params,
  });

  const transfer = async (params: TransferTokenParams): Promise<Result<TransactionReceiptData>> => {
    const inferred = params.from
      ? ok(params.from)
      : inferAccountId(context.signer, context.operator);
    if (!inferred.ok) return err(inferred.error);
    const result = await context.submit({
      kind: "tokens.transfer",
      params: { ...params, from: inferred.value },
    });
    if (!result.ok) return result;
    return ok(result.value);
  };

  transfer.tx = (params: TransferTokenParams): TransactionDescriptor => ({
    kind: "tokens.transfer",
    params,
  });

  const transferNft = async (
    params: TransferNftParams,
  ): Promise<Result<TransactionReceiptData>> => {
    const result = await context.submit({ kind: "tokens.transferNft", params });
    if (!result.ok) return result;
    return ok(result.value);
  };

  transferNft.tx = (params: TransferNftParams): TransactionDescriptor => ({
    kind: "tokens.transferNft",
    params,
  });

  const associate = async (
    params: AssociateTokenParams,
  ): Promise<Result<TransactionReceiptData>> => {
    const result = await context.submit({ kind: "tokens.associate", params });
    if (!result.ok) return result;
    return ok(result.value);
  };

  associate.tx = (params: AssociateTokenParams): TransactionDescriptor => ({
    kind: "tokens.associate",
    params,
  });

  const dissociate = async (
    params: DissociateTokenParams,
  ): Promise<Result<TransactionReceiptData>> => {
    const result = await context.submit({ kind: "tokens.dissociate", params });
    if (!result.ok) return result;
    return ok(result.value);
  };

  dissociate.tx = (params: DissociateTokenParams): TransactionDescriptor => ({
    kind: "tokens.dissociate",
    params,
  });

  const freeze = async (params: FreezeTokenParams): Promise<Result<TransactionReceiptData>> => {
    const result = await context.submit({ kind: "tokens.freeze", params });
    if (!result.ok) return result;
    return ok(result.value);
  };

  freeze.tx = (params: FreezeTokenParams): TransactionDescriptor => ({
    kind: "tokens.freeze",
    params,
  });

  const unfreeze = async (params: UnfreezeTokenParams): Promise<Result<TransactionReceiptData>> => {
    const result = await context.submit({ kind: "tokens.unfreeze", params });
    if (!result.ok) return result;
    return ok(result.value);
  };

  unfreeze.tx = (params: UnfreezeTokenParams): TransactionDescriptor => ({
    kind: "tokens.unfreeze",
    params,
  });

  const grantKyc = async (params: GrantKycParams): Promise<Result<TransactionReceiptData>> => {
    const result = await context.submit({ kind: "tokens.grantKyc", params });
    if (!result.ok) return result;
    return ok(result.value);
  };

  grantKyc.tx = (params: GrantKycParams): TransactionDescriptor => ({
    kind: "tokens.grantKyc",
    params,
  });

  const revokeKyc = async (params: RevokeKycParams): Promise<Result<TransactionReceiptData>> => {
    const result = await context.submit({ kind: "tokens.revokeKyc", params });
    if (!result.ok) return result;
    return ok(result.value);
  };

  revokeKyc.tx = (params: RevokeKycParams): TransactionDescriptor => ({
    kind: "tokens.revokeKyc",
    params,
  });

  const pause = async (params: PauseTokenParams): Promise<Result<TransactionReceiptData>> => {
    const result = await context.submit({ kind: "tokens.pause", params });
    if (!result.ok) return result;
    return ok(result.value);
  };

  pause.tx = (params: PauseTokenParams): TransactionDescriptor => ({
    kind: "tokens.pause",
    params,
  });

  const unpause = async (params: UnpauseTokenParams): Promise<Result<TransactionReceiptData>> => {
    const result = await context.submit({ kind: "tokens.unpause", params });
    if (!result.ok) return result;
    return ok(result.value);
  };

  unpause.tx = (params: UnpauseTokenParams): TransactionDescriptor => ({
    kind: "tokens.unpause",
    params,
  });

  const wipe = async (params: WipeTokenParams): Promise<Result<TransactionReceiptData>> => {
    const result = await context.submit({ kind: "tokens.wipe", params });
    if (!result.ok) return result;
    return ok(result.value);
  };

  wipe.tx = (params: WipeTokenParams): TransactionDescriptor => ({
    kind: "tokens.wipe",
    params,
  });

  const del = async (params: DeleteTokenParams): Promise<Result<TransactionReceiptData>> => {
    const result = await context.submit({ kind: "tokens.delete", params });
    if (!result.ok) return result;
    return ok(result.value);
  };

  del.tx = (params: DeleteTokenParams): TransactionDescriptor => ({
    kind: "tokens.delete",
    params,
  });

  const update = async (params: UpdateTokenParams): Promise<Result<TransactionReceiptData>> => {
    const result = await context.submit({ kind: "tokens.update", params });
    if (!result.ok) return result;
    return ok(result.value);
  };

  update.tx = (params: UpdateTokenParams): TransactionDescriptor => ({
    kind: "tokens.update",
    params,
  });

  const fees = async (
    params: UpdateTokenFeeScheduleParams,
  ): Promise<Result<TransactionReceiptData>> => {
    const result = await context.submit({ kind: "tokens.fees", params });
    if (!result.ok) return result;
    return ok(result.value);
  };

  fees.tx = (params: UpdateTokenFeeScheduleParams): TransactionDescriptor => ({
    kind: "tokens.fees",
    params,
  });

  return {
    create,
    mint,
    burn,
    transfer,
    transferNft,
    associate,
    dissociate,
    freeze,
    unfreeze,
    grantKyc,
    revokeKyc,
    pause,
    unpause,
    wipe,
    delete: del,
    update,
    fees,
  };
}
