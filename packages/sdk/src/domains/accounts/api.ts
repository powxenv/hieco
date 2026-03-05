import type { EntityId } from "@hieco/utils";
import type { TransactionDescriptor } from "../../foundation/params.ts";
import type {
  AccountInfoData,
  AccountRecordsData,
  CreateAccountResult,
  DeleteAccountResult,
  TransferResult,
  TransactionReceiptData,
  UpdateAccountResult,
} from "../../foundation/results-shapes.ts";
import type { Result } from "../../foundation/results.ts";
import { err, ok } from "../../foundation/results.ts";
import { AccountBalanceQuery } from "@hiero-ledger/sdk";
import { createError } from "../../foundation/errors.ts";
import type {
  ApproveAllowanceParams,
  CreateAccountParams,
  DeleteAccountParams,
  TransferParams,
  UpdateAccountParams,
  HbarAllowanceParams,
  TokenAllowanceParams,
  NftAllowanceParams,
  DeleteNftAllowancesParams,
} from "../../foundation/params.ts";
import {
  ensureAccountId,
  inferAccountId,
  queryAccountRecords,
  type SigningContext,
} from "../transactions/api.ts";

import type { AccountsNamespace } from "./namespace.ts";

export function createAccountsNamespace(context: {
  readonly submit: (descriptor: TransactionDescriptor) => Promise<Result<TransactionReceiptData>>;
  readonly operator?: EntityId;
  readonly signer?: import("@hiero-ledger/sdk").Signer;
  readonly mirror: import("@hieco/mirror").MirrorNodeClient;
  readonly nativeClient?: import("@hiero-ledger/sdk").Client;
  readonly operatorKey?: string;
}): AccountsNamespace {
  const transfer = async (params: TransferParams): Promise<Result<TransferResult>> => {
    const inferred = params.from
      ? ok(params.from)
      : inferAccountId(context.signer, context.operator);
    if (!inferred.ok) return err(inferred.error);
    const descriptor: TransactionDescriptor = {
      kind: "accounts.transfer",
      params: { ...params, from: inferred.value },
    };
    const result = await context.submit(descriptor);
    if (!result.ok) return result;
    return ok({ receipt: result.value, transactionId: result.value.transactionId });
  };

  transfer.tx = (params: TransferParams): TransactionDescriptor => ({
    kind: "accounts.transfer",
    params,
  });

  const create = async (params: CreateAccountParams): Promise<Result<CreateAccountResult>> => {
    const result = await context.submit({ kind: "accounts.create", params });
    if (!result.ok) return result;
    const accountId = ensureAccountId(result);
    if (!accountId.ok) return accountId;
    return ok({
      receipt: result.value,
      transactionId: result.value.transactionId,
      accountId: accountId.value,
    });
  };

  create.tx = (params: CreateAccountParams): TransactionDescriptor => ({
    kind: "accounts.create",
    params,
  });

  const update = async (params: UpdateAccountParams): Promise<Result<UpdateAccountResult>> => {
    const result = await context.submit({ kind: "accounts.update", params });
    if (!result.ok) return result;
    return ok({ receipt: result.value, transactionId: result.value.transactionId });
  };

  update.tx = (params: UpdateAccountParams): TransactionDescriptor => ({
    kind: "accounts.update",
    params,
  });

  const del = async (params: DeleteAccountParams): Promise<Result<DeleteAccountResult>> => {
    const result = await context.submit({ kind: "accounts.delete", params });
    if (!result.ok) return result;
    return ok({ receipt: result.value, transactionId: result.value.transactionId });
  };

  del.tx = (params: DeleteAccountParams): TransactionDescriptor => ({
    kind: "accounts.delete",
    params,
  });

  const allowances = async (
    params: ApproveAllowanceParams,
  ): Promise<Result<TransactionReceiptData>> => {
    const result = await context.submit({ kind: "accounts.allowances", params });
    if (!result.ok) return result;
    return ok(result.value);
  };

  allowances.tx = (params: ApproveAllowanceParams): TransactionDescriptor => ({
    kind: "accounts.allowances",
    params,
  });

  const allowancesDeleteNft = async (
    params: DeleteNftAllowancesParams,
  ): Promise<Result<TransactionReceiptData>> => {
    const result = await context.submit({ kind: "accounts.allowances.deleteNft", params });
    if (!result.ok) return result;
    return ok(result.value);
  };

  allowancesDeleteNft.tx = (params: DeleteNftAllowancesParams): TransactionDescriptor => ({
    kind: "accounts.allowances.deleteNft",
    params,
  });

  const allowancesList = async (
    accountId: EntityId,
  ): Promise<
    Result<{
      readonly hbar: ReadonlyArray<import("@hieco/mirror").CryptoAllowance>;
      readonly tokens: ReadonlyArray<import("@hieco/mirror").TokenAllowance>;
      readonly nfts: ReadonlyArray<import("@hieco/mirror").NftAllowance>;
    }>
  > => {
    const [hbar, tokens, nfts] = await Promise.all([
      context.mirror.account.getCryptoAllowances(accountId),
      context.mirror.account.getTokenAllowances(accountId),
      context.mirror.account.getNftAllowances(accountId),
    ]);

    if (!hbar.success) {
      return err(
        createError(
          "MIRROR_QUERY_FAILED",
          `Mirror account.getCryptoAllowances failed: ${hbar.error.message}`,
          {
            hint: "Verify mirror node connectivity",
            details: {
              status: hbar.error.status ?? "unknown",
              code: hbar.error.code ?? "unknown",
            },
          },
        ),
      );
    }
    if (!tokens.success) {
      return err(
        createError(
          "MIRROR_QUERY_FAILED",
          `Mirror account.getTokenAllowances failed: ${tokens.error.message}`,
          {
            hint: "Verify mirror node connectivity",
            details: {
              status: tokens.error.status ?? "unknown",
              code: tokens.error.code ?? "unknown",
            },
          },
        ),
      );
    }
    if (!nfts.success) {
      return err(
        createError(
          "MIRROR_QUERY_FAILED",
          `Mirror account.getNftAllowances failed: ${nfts.error.message}`,
          {
            hint: "Verify mirror node connectivity",
            details: {
              status: nfts.error.status ?? "unknown",
              code: nfts.error.code ?? "unknown",
            },
          },
        ),
      );
    }

    return ok({ hbar: hbar.data, tokens: tokens.data, nfts: nfts.data });
  };

  const allowanceMatch = (
    a: HbarAllowanceParams,
    existing: import("@hieco/mirror").CryptoAllowance,
  ) =>
    existing.owner === a.ownerAccountId &&
    existing.spender === a.spenderAccountId &&
    existing.amount >= Number(a.amount);

  const tokenAllowanceMatch = (
    a: TokenAllowanceParams,
    existing: import("@hieco/mirror").TokenAllowance,
  ) =>
    existing.owner === a.ownerAccountId &&
    existing.spender === a.spenderAccountId &&
    existing.token_id === a.tokenId &&
    existing.amount >= Number(a.amount);

  const nftAllowanceMatch = (
    a: NftAllowanceParams,
    existing: import("@hieco/mirror").NftAllowance,
  ) => {
    if (existing.owner !== a.ownerAccountId) return false;
    if (existing.spender !== a.spenderAccountId) return false;
    if (existing.token_id !== a.tokenId) return false;
    if (a.approveAll) return existing.approved_for_all;
    if (a.serial !== undefined) return existing.serial_numbers.includes(a.serial);
    return false;
  };

  const allowancesEnsure = async (params: {
    readonly hbar?: ReadonlyArray<HbarAllowanceParams>;
    readonly tokens?: ReadonlyArray<TokenAllowanceParams>;
    readonly nfts?: ReadonlyArray<NftAllowanceParams>;
    readonly memo?: string;
    readonly maxFee?: import("../../foundation/params.ts").Amount;
  }): Promise<
    Result<
      | {
          readonly status: "skipped";
          readonly reason: "already-approved";
        }
      | {
          readonly status: "submitted";
          readonly receipt: TransactionReceiptData;
        }
    >
  > => {
    const ownerAccountId =
      params.hbar?.[0]?.ownerAccountId ??
      params.tokens?.[0]?.ownerAccountId ??
      params.nfts?.[0]?.ownerAccountId;
    if (!ownerAccountId) {
      return err(
        createError("SIGNER_ACCOUNT_ID_REQUIRED", "Owner account id is required", {
          hint: "Provide at least one allowance entry with ownerAccountId",
        }),
      );
    }

    const listResult = await allowancesList(ownerAccountId);
    if (!listResult.ok) return listResult;

    const hbarNeeded = (params.hbar ?? []).filter(
      (a) => !listResult.value.hbar.some((existing) => allowanceMatch(a, existing)),
    );
    const tokenNeeded = (params.tokens ?? []).filter(
      (a) => !listResult.value.tokens.some((existing) => tokenAllowanceMatch(a, existing)),
    );
    const nftNeeded = (params.nfts ?? []).filter(
      (a) => !listResult.value.nfts.some((existing) => nftAllowanceMatch(a, existing)),
    );

    if (hbarNeeded.length === 0 && tokenNeeded.length === 0 && nftNeeded.length === 0) {
      return ok({ status: "skipped", reason: "already-approved" });
    }

    const approval = await allowances({
      ...(hbarNeeded.length ? { hbar: hbarNeeded } : {}),
      ...(tokenNeeded.length ? { tokens: tokenNeeded } : {}),
      ...(nftNeeded.length ? { nfts: nftNeeded } : {}),
      ...(params.memo ? { memo: params.memo } : {}),
      ...(params.maxFee !== undefined ? { maxFee: params.maxFee } : {}),
    });
    if (!approval.ok) return approval;
    return ok({ status: "submitted", receipt: approval.value });
  };

  const balance = async (
    accountId?: EntityId,
  ): Promise<
    Result<{
      readonly hbar: string;
      readonly tokens: ReadonlyArray<{
        readonly tokenId: string;
        readonly balance: string;
        readonly decimals: number;
      }>;
    }>
  > => {
    const inferred = accountId ? ok(accountId) : inferAccountId(context.signer, context.operator);
    if (!inferred.ok) return err(inferred.error);

    if (context.signer) {
      const balanceResult = await context.signer.getAccountBalance();
      const json = balanceResult.toJSON();
      return ok({
        hbar: json.hbars,
        tokens: json.tokens.map((token) => ({
          tokenId: token.tokenId,
          balance: token.balance,
          decimals: token.decimals,
        })),
      });
    }

    if (context.nativeClient) {
      const balanceResult = await new AccountBalanceQuery()
        .setAccountId(inferred.value)
        .execute(context.nativeClient);
      const json = balanceResult.toJSON();
      return ok({
        hbar: json.hbars,
        tokens: json.tokens.map((token) => ({
          tokenId: token.tokenId,
          balance: token.balance,
          decimals: token.decimals,
        })),
      });
    }

    const result = await context.mirror.account.getBalances(inferred.value);
    if (!result.success) {
      return err(
        createError(
          "MIRROR_QUERY_FAILED",
          `Mirror account.getBalances failed: ${result.error.message}`,
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

    return ok({
      hbar: result.data.balance?.toString() ?? "0",
      tokens: result.data.tokens.map((token) => ({
        tokenId: token.token_id,
        balance: token.balance.toString(),
        decimals: 0,
      })),
    });
  };

  const info = async (accountId: EntityId): Promise<Result<AccountInfoData>> => {
    const result = await context.mirror.account.getInfo(accountId);
    if (!result.success) {
      return err(
        createError(
          "MIRROR_QUERY_FAILED",
          `Mirror account.getInfo failed: ${result.error.message}`,
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
    return ok({ accountId, account: result.data });
  };

  const records = async (accountId?: EntityId): Promise<Result<AccountRecordsData>> => {
    const inferred = accountId ? ok(accountId) : inferAccountId(context.signer, context.operator);
    if (!inferred.ok) return err(inferred.error);
    if (!context.nativeClient) {
      return err(
        createError("SIGNER_REQUIRED", "A signer or operator key is required to query records", {
          hint: "Pass signer in client config or provide operator key",
        }),
      );
    }

    const signing: SigningContext | undefined = context.signer
      ? { kind: "signer", signer: context.signer }
      : context.operatorKey
        ? { kind: "operator", key: context.operatorKey }
        : undefined;

    if (!signing) {
      return err(
        createError("SIGNER_REQUIRED", "A signer or operator key is required to query records", {
          hint: "Pass signer in client config or provide operator key",
        }),
      );
    }

    return queryAccountRecords({ client: context.nativeClient, signing }, inferred.value);
  };

  return {
    transfer,
    create,
    update,
    delete: del,
    allowances,
    allowancesDeleteNft,
    allowancesList,
    allowancesEnsure,
    balance,
    info,
    records,
  };
}
