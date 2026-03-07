import type { PaginationParams, Transaction, TransactionListParams } from "@hieco/mirror";
import { ok } from "../results/result.ts";
import type {
  AccountHistoryParams,
  AccountListParams,
  AccountNftAllowancesParams,
  AccountNftsParams,
  AccountTokenAllowancesParams,
  AccountTransferActivity,
  AccountTransfersParams,
  ReadsNamespace,
  TokenRelationshipsParams,
} from "./namespace.ts";
import {
  readList,
  readPage,
  readSingle,
  toReadPage,
  type ReadsContext,
  withDefaultLimit,
} from "./shared.ts";

function toAccountTransferActivity(transaction: Transaction): AccountTransferActivity {
  return {
    transactionId: transaction.transaction_id,
    consensusTimestamp: transaction.consensus_timestamp,
    name: transaction.name,
    result: transaction.result,
    transfers: transaction.transfers,
    tokenTransfers: transaction.token_transfers,
    nftTransfers: transaction.nft_transfers,
  };
}

export function createAccountsReads(context: ReadsContext): ReadsNamespace["accounts"] {
  const list = async (params?: AccountListParams) => {
    return readPage(
      await context.mirror.account.listPaginatedPage(withDefaultLimit(params)),
      "Mirror account.listPaginatedPage failed",
    );
  };

  const listPageByUrl = async (url: string) => {
    return readPage(
      await context.mirror.account.listPaginatedPageByUrl(url),
      "Mirror account.listPaginatedPageByUrl failed",
    );
  };

  const info = async (
    accountId: string,
    params?: { readonly timestamp?: string; readonly transactions?: boolean },
  ) => {
    return readSingle(
      await context.mirror.account.getInfo(accountId, params),
      "Mirror account.getInfo failed",
    );
  };

  const balances = async (accountId: string) => {
    return readSingle(
      await context.mirror.account.getBalances(accountId),
      "Mirror account.getBalances failed",
    );
  };

  const tokens = async (accountId: string, params?: TokenRelationshipsParams) => {
    return readList(
      await context.mirror.account.getTokens(accountId, params),
      "Mirror account.getTokens failed",
    );
  };

  const nfts = async (accountId: string, params?: AccountNftsParams) => {
    return readList(
      await context.mirror.account.getNfts(accountId, params),
      "Mirror account.getNfts failed",
    );
  };

  const rewards = async (
    accountId: string,
    params?: PaginationParams & { readonly timestamp?: string },
  ) => {
    return readList(
      await context.mirror.account.getStakingRewards(accountId, params),
      "Mirror account.getStakingRewards failed",
    );
  };

  const crypto = async (
    accountId: string,
    params?: PaginationParams & { readonly "spender.id"?: string },
  ) => {
    return readList(
      await context.mirror.account.getCryptoAllowances(accountId, params),
      "Mirror account.getCryptoAllowances failed",
    );
  };

  const token = async (accountId: string, params?: AccountTokenAllowancesParams) => {
    return readList(
      await context.mirror.account.getTokenAllowances(accountId, params),
      "Mirror account.getTokenAllowances failed",
    );
  };

  const nft = async (accountId: string, params?: AccountNftAllowancesParams) => {
    return readList(
      await context.mirror.account.getNftAllowances(accountId, params),
      "Mirror account.getNftAllowances failed",
    );
  };

  const outstanding = async (
    accountId: string,
    params?: {
      readonly limit?: number;
      readonly order?: "asc" | "desc";
      readonly "receiver.id"?: string;
      readonly serial_number?: number;
      readonly "token.id"?: string;
    },
  ) => {
    return readSingle(
      await context.mirror.account.getOutstandingAirdrops(accountId, params),
      "Mirror account.getOutstandingAirdrops failed",
    );
  };

  const pending = async (
    accountId: string,
    params?: {
      readonly limit?: number;
      readonly order?: "asc" | "desc";
      readonly "sender.id"?: string;
      readonly serial_number?: number;
      readonly "token.id"?: string;
    },
  ) => {
    return readSingle(
      await context.mirror.account.getPendingAirdrops(accountId, params),
      "Mirror account.getPendingAirdrops failed",
    );
  };

  const history = async (accountId: string, params?: AccountHistoryParams) => {
    const searchParams: TransactionListParams = {
      ...params,
      ...withDefaultLimit(params),
      account: accountId,
    };

    return readPage(
      await context.mirror.transaction.listPaginatedPage(searchParams),
      "Mirror transaction.listPaginatedPage failed",
    );
  };

  const transfers = async (accountId: string, params?: AccountTransfersParams) => {
    const searchParams: TransactionListParams = {
      ...params,
      ...withDefaultLimit(params),
      account: accountId,
    };
    const page = readPage(
      await context.mirror.transaction.listPaginatedPage(searchParams),
      "Mirror transaction.listPaginatedPage failed",
    );

    if (!page.ok) {
      return page;
    }

    return ok(toReadPage(page.value.items.map(toAccountTransferActivity), page.value.next));
  };

  return {
    list,
    listPageByUrl,
    info,
    balances,
    tokens,
    nfts,
    rewards,
    allowances: {
      crypto,
      token,
      nft,
    },
    airdrops: {
      outstanding,
      pending,
    },
    history,
    transfers,
  };
}
