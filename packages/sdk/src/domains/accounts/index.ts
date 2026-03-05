import type { EntityId } from "@hieco/types";
import type {
  ApproveAllowanceParams,
  CreateAccountParams,
  DeleteAccountParams,
  TransferParams,
  UpdateAccountParams,
  TransactionDescriptor,
} from "../../shared/params.ts";
import type {
  AccountInfoData,
  AccountRecordsData,
  CreateAccountResult,
  DeleteAccountResult,
  TransferResult,
  TransactionReceiptData,
  UpdateAccountResult,
} from "../../shared/results-shapes.ts";
import type { Result } from "../../shared/results.ts";
import { err, ok } from "../../shared/results.ts";
import { AccountBalanceQuery } from "@hiero-ledger/sdk";
import { createError } from "../../shared/errors.ts";
import {
  ensureAccountId,
  inferAccountId,
  queryAccountRecords,
  type SigningContext,
} from "../transactions/index.ts";

export interface AccountsNamespace {
  transfer: ((params: TransferParams) => Promise<Result<TransferResult>>) & {
    tx: (params: TransferParams) => TransactionDescriptor;
  };
  create: ((params: CreateAccountParams) => Promise<Result<CreateAccountResult>>) & {
    tx: (params: CreateAccountParams) => TransactionDescriptor;
  };
  update: ((params: UpdateAccountParams) => Promise<Result<UpdateAccountResult>>) & {
    tx: (params: UpdateAccountParams) => TransactionDescriptor;
  };
  delete: ((params: DeleteAccountParams) => Promise<Result<DeleteAccountResult>>) & {
    tx: (params: DeleteAccountParams) => TransactionDescriptor;
  };
  allowances: ((params: ApproveAllowanceParams) => Promise<Result<TransactionReceiptData>>) & {
    tx: (params: ApproveAllowanceParams) => TransactionDescriptor;
  };
  balance: (accountId?: EntityId) => Promise<
    Result<{
      readonly hbar: string;
      readonly tokens: ReadonlyArray<{
        readonly tokenId: string;
        readonly balance: string;
        readonly decimals: number;
      }>;
    }>
  >;
  info: (accountId: EntityId) => Promise<Result<AccountInfoData>>;
  records: (accountId?: EntityId) => Promise<Result<AccountRecordsData>>;
}

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
    balance,
    info,
    records,
  };
}
