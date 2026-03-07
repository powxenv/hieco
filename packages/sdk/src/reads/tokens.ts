import type { PaginationParams, Transaction, TransactionListParams } from "@hieco/mirror";
import { ok } from "../results/result.ts";
import type {
  ReadsNamespace,
  TokenBalancesParams,
  TokenListParams,
  TokenNftsParams,
  TokenRelationshipsParams,
  TokenTransferActivity,
  TokenTransfersParams,
} from "./namespace.ts";
import {
  readList,
  readPage,
  readSingle,
  toReadPage,
  type ReadsContext,
  withDefaultLimit,
} from "./shared.ts";

function toTokenTransferActivity(transaction: Transaction, tokenId: string): TokenTransferActivity {
  return {
    tokenId,
    transactionId: transaction.transaction_id,
    consensusTimestamp: transaction.consensus_timestamp,
    name: transaction.name,
    result: transaction.result,
    tokenTransfers: transaction.token_transfers,
    nftTransfers: transaction.nft_transfers,
  };
}

export function createTokensReads(context: ReadsContext): ReadsNamespace["tokens"] {
  const balances = async (tokenId: string, params?: TokenBalancesParams) => {
    return readList(
      await context.mirror.token.getBalances(tokenId, params),
      "Mirror token.getBalances failed",
    );
  };

  const balancesSnapshot = async (tokenId: string, params?: TokenBalancesParams) => {
    return readSingle(
      await context.mirror.token.getBalancesSnapshot(tokenId, params),
      "Mirror token.getBalancesSnapshot failed",
    );
  };

  const list = async (params?: TokenListParams) => {
    return readPage(
      await context.mirror.token.listPaginatedPage(withDefaultLimit(params)),
      "Mirror token.listPaginatedPage failed",
    );
  };

  const listPageByUrl = async (url: string) => {
    return readPage(
      await context.mirror.token.listPaginatedPageByUrl(url),
      "Mirror token.listPaginatedPageByUrl failed",
    );
  };

  const info = async (tokenId: string, params?: { readonly timestamp?: string }) => {
    return readSingle(
      await context.mirror.token.getInfo(tokenId, params),
      "Mirror token.getInfo failed",
    );
  };

  const relationships = async (accountId: string, params?: TokenRelationshipsParams) => {
    return readList(
      await context.mirror.account.getTokens(accountId, params),
      "Mirror account.getTokens failed",
    );
  };

  const nfts = async (tokenId: string, params?: TokenNftsParams) => {
    return readPage(
      await context.mirror.token.getNfts(tokenId, params),
      "Mirror token.getNfts failed",
    );
  };

  const nft = async (tokenId: string, serial: number) => {
    return readSingle(
      await context.mirror.token.getNft(tokenId, serial),
      "Mirror token.getNft failed",
    );
  };

  const nftTransactions = async (
    tokenId: string,
    serial: number,
    params?: PaginationParams & { readonly timestamp?: string },
  ) => {
    return readList(
      await context.mirror.token.getNftTransactions(tokenId, serial, params),
      "Mirror token.getNftTransactions failed",
    );
  };

  const transfers = async (tokenId: string, params?: TokenTransfersParams) => {
    const searchParams = {
      ...params,
      ...withDefaultLimit(params),
      "token.transfers.token": tokenId,
    } satisfies TransactionListParams & {
      readonly "token.transfers.token": string;
    };
    const page = readPage(
      await context.mirror.transaction.listPaginatedPage(searchParams),
      "Mirror transaction.listPaginatedPage failed",
    );

    if (!page.ok) {
      return page;
    }

    return ok(
      toReadPage(
        page.value.items.map((transaction) => toTokenTransferActivity(transaction, tokenId)),
        page.value.next,
      ),
    );
  };

  return {
    list,
    listPageByUrl,
    info,
    balances,
    balancesSnapshot,
    nfts,
    nft,
    nftTransactions,
    relationships,
    transfers,
  };
}
