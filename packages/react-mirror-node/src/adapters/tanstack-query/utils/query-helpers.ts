import type { QueryClient } from "@tanstack/react-query";
import type { MirrorNodeClient, EntityId } from "@hiecom/mirror-node";
import { mirrorNodeKeys } from "../query-keys";

type MethodMapping = {
  readonly method: string;
  readonly resourceKey: string;
  readonly minParts: number;
  readonly maxParts: number;
};

const MAPPINGS: MethodMapping[] = [
  { method: "getInfo", resourceKey: "account.info", minParts: 2, maxParts: 2 },
  { method: "getBalances", resourceKey: "account.balances", minParts: 2, maxParts: 2 },
  { method: "getTokens", resourceKey: "account.tokens", minParts: 2, maxParts: 2 },
  { method: "getNfts", resourceKey: "account.nfts", minParts: 2, maxParts: 2 },
  { method: "getStakingRewards", resourceKey: "account.rewards", minParts: 2, maxParts: 2 },
  { method: "getCryptoAllowances", resourceKey: "account.allowances.crypto", minParts: 3, maxParts: 3 },
  { method: "getTokenAllowances", resourceKey: "account.allowances.token", minParts: 3, maxParts: 3 },
  { method: "getNftAllowances", resourceKey: "account.allowances.nft", minParts: 3, maxParts: 3 },
  { method: "getOutstandingAirdrops", resourceKey: "account.airdrops.outstanding", minParts: 3, maxParts: 3 },
  { method: "getPendingAirdrops", resourceKey: "account.airdrops.pending", minParts: 3, maxParts: 3 },
  { method: "listPaginated", resourceKey: "accounts.list", minParts: 1, maxParts: 1 },
  { method: "getInfo", resourceKey: "token.info", minParts: 2, maxParts: 2 },
  { method: "getBalances", resourceKey: "token.balances", minParts: 2, maxParts: 2 },
  { method: "getNfts", resourceKey: "token.nfts", minParts: 2, maxParts: 2 },
  { method: "getNft", resourceKey: "token.nft", minParts: 2, maxParts: 3 },
  { method: "getNftTransactions", resourceKey: "token.nft.transactions", minParts: 3, maxParts: 4 },
  { method: "listPaginated", resourceKey: "tokens.list", minParts: 1, maxParts: 1 },
  { method: "getInfo", resourceKey: "contract.info", minParts: 2, maxParts: 2 },
  { method: "getResults", resourceKey: "contract.results", minParts: 2, maxParts: 2 },
  { method: "getResult", resourceKey: "contract.result", minParts: 2, maxParts: 3 },
  { method: "getState", resourceKey: "contract.state", minParts: 2, maxParts: 2 },
  { method: "getLogs", resourceKey: "contract.logs", minParts: 2, maxParts: 2 },
  { method: "getAllResults", resourceKey: "contract.results.all", minParts: 3, maxParts: 3 },
  { method: "getResultByTransactionIdOrHash", resourceKey: "contract.results.byTx", minParts: 3, maxParts: 3 },
  { method: "getResultActions", resourceKey: "contract.results.actions", minParts: 3, maxParts: 3 },
  { method: "getResultOpcodes", resourceKey: "contract.results.opcodes", minParts: 3, maxParts: 3 },
  { method: "getAllContractLogs", resourceKey: "contract.results.logs.all", minParts: 3, maxParts: 3 },
  { method: "callContract", resourceKey: "contract.call", minParts: 1, maxParts: 1 },
  { method: "listPaginated", resourceKey: "contracts.list", minParts: 1, maxParts: 1 },
  { method: "getById", resourceKey: "transaction.info", minParts: 2, maxParts: 2 },
  { method: "listByAccount", resourceKey: "transaction.account", minParts: 2, maxParts: 2 },
  { method: "listPaginated", resourceKey: "transactions.list", minParts: 1, maxParts: 1 },
  { method: "getInfo", resourceKey: "topic.info", minParts: 2, maxParts: 2 },
  { method: "getMessages", resourceKey: "topic.messages", minParts: 2, maxParts: 2 },
  { method: "getMessage", resourceKey: "topic.message", minParts: 2, maxParts: 3 },
  { method: "getMessageByTimestamp", resourceKey: "topic.message.byTimestamp", minParts: 3, maxParts: 3 },
  { method: "listPaginated", resourceKey: "topics.list", minParts: 1, maxParts: 1 },
  { method: "getInfo", resourceKey: "schedule.info", minParts: 2, maxParts: 2 },
  { method: "listPaginated", resourceKey: "schedules.list", minParts: 1, maxParts: 1 },
  { method: "getExchangeRate", resourceKey: "network.exchange-rate", minParts: 1, maxParts: 1 },
  { method: "getFees", resourceKey: "network.fees", minParts: 1, maxParts: 1 },
  { method: "getNodes", resourceKey: "network.nodes", minParts: 1, maxParts: 1 },
  { method: "getStake", resourceKey: "network.stake", minParts: 1, maxParts: 1 },
  { method: "getSupply", resourceKey: "network.supply", minParts: 1, maxParts: 1 },
  { method: "getBalances", resourceKey: "balances.list", minParts: 1, maxParts: 1 },
  { method: "getBlocks", resourceKey: "blocks.list", minParts: 1, maxParts: 1 },
  { method: "getBlock", resourceKey: "block.info", minParts: 2, maxParts: 2 },
];

function findMapping(queryKey: readonly unknown[]): { mapping: MethodMapping; args: unknown[] } | null {
  if (!Array.isArray(queryKey) || queryKey[0] !== "mirror-node" || queryKey.length < 3) {
    return null;
  }

  const entity = queryKey[1] as string;
  const parts = queryKey.slice(2);
  const partCount = parts.length;

  for (const mapping of MAPPINGS) {
    if (!mapping.resourceKey.startsWith(entity)) continue;

    const resourceParts = mapping.resourceKey.slice(entity.length + 1).split(".");

    if (partCount < mapping.minParts || partCount > mapping.maxParts) continue;

    let matches = true;
    for (let i = 0; i < resourceParts.length; i++) {
      if (parts[i] !== resourceParts[i]) {
        matches = false;
        break;
      }
    }

    if (matches) {
      const args = parts.slice(resourceParts.length);
      return { mapping, args };
    }
  }

  return null;
}

export async function prefetchQuery(
  queryClient: QueryClient,
  client: MirrorNodeClient,
  queryKey: readonly unknown[],
): Promise<void> {
  const result = findMapping(queryKey);

  if (!result) {
    throw new Error(`Cannot find mapping for query key: ${JSON.stringify(queryKey)}`);
  }

  const { mapping, args } = result;
  const entity = queryKey[1] as string;
  const { method } = mapping;

  const api = (client as unknown as Record<string, Record<string, (...args: unknown[]) => unknown>>)[entity];
  if (!api) {
    throw new Error(`Entity ${entity} not found on client`);
  }

  const fn = api[method];
  if (typeof fn !== "function") {
    throw new Error(`Method ${method} not found on ${entity}`);
  }

  await queryClient.prefetchQuery({
    queryKey,
    queryFn: () => fn(...args),
  });
}

export type EntityType =
  | "account"
  | "accounts"
  | "token"
  | "tokens"
  | "contract"
  | "contracts"
  | "transaction"
  | "transactions"
  | "topic"
  | "topics"
  | "schedule"
  | "schedules"
  | "network"
  | "balances"
  | "blocks"
  | "block";

export type InvalidateFilters =
  | { readonly exactKey: readonly unknown[] }
  | {
      readonly entityType: EntityType;
      readonly resourceId?: EntityId | string;
    };

export function invalidateQueries(
  queryClient: QueryClient,
  filters: InvalidateFilters,
): Promise<void> {
  if ("exactKey" in filters) {
    return queryClient.invalidateQueries({ queryKey: filters.exactKey });
  }

  return queryClient.invalidateQueries({
    predicate: (query) => {
      const key = query.queryKey;
      if (!Array.isArray(key) || key[0] !== "mirror-node") {
        return false;
      }

      if (key[1] !== filters.entityType) {
        return false;
      }

      if (filters.resourceId) {
        const lastKey = key[key.length - 1];
        if (lastKey !== filters.resourceId) {
          return false;
        }
      }

      return true;
    },
  });
}

export async function prefetchAccountInfo(
  queryClient: QueryClient,
  client: MirrorNodeClient,
  accountId: EntityId,
): Promise<void> {
  await prefetchQuery(queryClient, client, mirrorNodeKeys.account.info(accountId));
}

export async function prefetchAccountBalances(
  queryClient: QueryClient,
  client: MirrorNodeClient,
  accountId: EntityId,
): Promise<void> {
  await prefetchQuery(queryClient, client, mirrorNodeKeys.account.balances(accountId));
}

export async function prefetchAccountTokens(
  queryClient: QueryClient,
  client: MirrorNodeClient,
  accountId: EntityId,
): Promise<void> {
  await prefetchQuery(queryClient, client, mirrorNodeKeys.account.tokens(accountId));
}

export async function prefetchTokenInfo(
  queryClient: QueryClient,
  client: MirrorNodeClient,
  tokenId: EntityId,
): Promise<void> {
  await prefetchQuery(queryClient, client, mirrorNodeKeys.token.info(tokenId));
}

export async function prefetchTransaction(
  queryClient: QueryClient,
  client: MirrorNodeClient,
  transactionId: EntityId,
): Promise<void> {
  await prefetchQuery(queryClient, client, mirrorNodeKeys.transaction.info(transactionId));
}

export function invalidateAccountQueries(queryClient: QueryClient, accountId: EntityId): Promise<void> {
  return invalidateQueries(queryClient, { entityType: "account", resourceId: accountId });
}

export function invalidateTokenQueries(queryClient: QueryClient, tokenId: EntityId): Promise<void> {
  return invalidateQueries(queryClient, { entityType: "token", resourceId: tokenId });
}

export function invalidateContractQueries(queryClient: QueryClient, contractId: EntityId): Promise<void> {
  return invalidateQueries(queryClient, { entityType: "contract", resourceId: contractId });
}

export function invalidateNetworkData(queryClient: QueryClient): Promise<void> {
  return invalidateQueries(queryClient, { entityType: "network" });
}

export function invalidateBalanceQueries(queryClient: QueryClient): Promise<void> {
  return invalidateQueries(queryClient, { entityType: "balances" });
}

export function invalidateBlockQueries(queryClient: QueryClient, hashOrNumber: string): Promise<void> {
  return invalidateQueries(queryClient, { entityType: "block", resourceId: hashOrNumber });
}

export function invalidateBlocksQueries(queryClient: QueryClient): Promise<void> {
  return invalidateQueries(queryClient, { entityType: "blocks" });
}
