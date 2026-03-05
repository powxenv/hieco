import type { EntityId } from "@hieco/utils";
import type { TransactionDescriptor } from "../../foundation/params.ts";
import type {
  MintReceipt,
  TokenNftInfoData,
  TokenInfoData,
  TokenReceipt,
  TransactionReceiptData,
} from "../../foundation/results-shapes.ts";
import type { Result } from "../../foundation/results.ts";
import { err, ok } from "../../foundation/results.ts";
import {
  ensureTokenId,
  inferAccountId,
  queryTokenNftInfo,
  type SigningContext,
} from "../transactions/api.ts";
import { createError } from "../../foundation/errors.ts";
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
  TokenAllowancesQueryParams,
} from "../../foundation/params.ts";
import type { TokensNamespace } from "./namespace.ts";

export function createTokensNamespace(context: {
  readonly submit: (descriptor: TransactionDescriptor) => Promise<Result<TransactionReceiptData>>;
  readonly operator?: EntityId;
  readonly signer?: import("@hiero-ledger/sdk").Signer;
  readonly mirror: import("@hieco/mirror").MirrorNodeClient;
  readonly nativeClient: import("@hiero-ledger/sdk").Client;
  readonly operatorKey?: string;
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

  const info = async (tokenId: EntityId): Promise<Result<TokenInfoData>> => {
    const result = await context.mirror.token.getInfo(tokenId);
    if (!result.success) {
      return err(
        createError("MIRROR_QUERY_FAILED", `Mirror token.getInfo failed: ${result.error.message}`, {
          hint: "Verify mirror node connectivity",
          details: {
            status: result.error.status ?? "unknown",
            code: result.error.code ?? "unknown",
          },
        }),
      );
    }
    return ok({ tokenId, token: result.data });
  };

  const resolveNftId = (input: string | { readonly tokenId: EntityId; readonly serial: number }) =>
    typeof input === "string" ? input : `${input.tokenId}/${String(input.serial)}`;

  const nftInfo = async (
    nft: string | { readonly tokenId: EntityId; readonly serial: number },
  ): Promise<Result<TokenNftInfoData>> => {
    const nftId = resolveNftId(nft);
    const signing: SigningContext | undefined = context.signer
      ? { kind: "signer", signer: context.signer }
      : context.operatorKey
        ? { kind: "operator", key: context.operatorKey }
        : undefined;

    if (!signing) {
      return err(
        createError("SIGNER_REQUIRED", "A signer or operator key is required to query NFTs", {
          hint: "Pass signer in client config or provide operator key",
        }),
      );
    }

    return queryTokenNftInfo({ client: context.nativeClient, signing }, nftId);
  };

  const allowancesList = async (
    accountId: EntityId,
    params?: TokenAllowancesQueryParams,
  ): Promise<
    Result<{
      readonly allowances: ReadonlyArray<import("@hieco/mirror").TokenAllowance>;
    }>
  > => {
    const result = await context.mirror.account.getTokenAllowances(accountId, {
      ...(params?.limit !== undefined ? { limit: params.limit } : {}),
      ...(params?.order !== undefined ? { order: params.order } : {}),
      ...(params?.spenderId ? { "spender.id": params.spenderId } : {}),
      ...(params?.tokenId ? { "token.id": params.tokenId } : {}),
    });
    if (!result.success) {
      return err(
        createError(
          "MIRROR_QUERY_FAILED",
          `Mirror account.getTokenAllowances failed: ${result.error.message}`,
          {
            hint: "Verify mirror node connectivity",
            details: {
              status: result.error.status ?? "unknown",
              code: result.error.code ?? "unknown",
            },
          },
        ),
      );
    }
    return ok({ allowances: result.data });
  };

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
    info,
    nftInfo,
    allowancesList,
  };
}
