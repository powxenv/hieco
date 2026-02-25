import type { QueryClient } from "@tanstack/query-core";
import type { MirrorNodeClient, EntityId } from "@hiecom/mirror-js";

type ApiProperty = Exclude<keyof MirrorNodeClient, "networkType" | "baseUrl" | "httpClient">;

type MethodMapping = {
  readonly apiProperty: ApiProperty;
  readonly methodName: string;
  readonly entityName: string;
  readonly resourceKeyPattern: readonly string[];
};

const METHOD_MAPPINGS: readonly MethodMapping[] = [
  {
    apiProperty: "account",
    methodName: "getInfo",
    entityName: "account",
    resourceKeyPattern: ["info"],
  },
  {
    apiProperty: "account",
    methodName: "getBalances",
    entityName: "account",
    resourceKeyPattern: ["balances"],
  },
  {
    apiProperty: "account",
    methodName: "getTokens",
    entityName: "account",
    resourceKeyPattern: ["tokens"],
  },
  {
    apiProperty: "account",
    methodName: "getNfts",
    entityName: "account",
    resourceKeyPattern: ["nfts"],
  },
  {
    apiProperty: "account",
    methodName: "getStakingRewards",
    entityName: "account",
    resourceKeyPattern: ["rewards"],
  },
  {
    apiProperty: "account",
    methodName: "getCryptoAllowances",
    entityName: "account",
    resourceKeyPattern: ["allowances", "crypto"],
  },
  {
    apiProperty: "account",
    methodName: "getTokenAllowances",
    entityName: "account",
    resourceKeyPattern: ["allowances", "token"],
  },
  {
    apiProperty: "account",
    methodName: "getNftAllowances",
    entityName: "account",
    resourceKeyPattern: ["allowances", "nft"],
  },
  {
    apiProperty: "account",
    methodName: "getOutstandingAirdrops",
    entityName: "account",
    resourceKeyPattern: ["airdrops", "outstanding"],
  },
  {
    apiProperty: "account",
    methodName: "getPendingAirdrops",
    entityName: "account",
    resourceKeyPattern: ["airdrops", "pending"],
  },
  {
    apiProperty: "account",
    methodName: "listPaginated",
    entityName: "account",
    resourceKeyPattern: ["list"],
  },
  {
    apiProperty: "token",
    methodName: "getInfo",
    entityName: "token",
    resourceKeyPattern: ["info"],
  },
  {
    apiProperty: "token",
    methodName: "getBalances",
    entityName: "token",
    resourceKeyPattern: ["balances"],
  },
  {
    apiProperty: "token",
    methodName: "getNfts",
    entityName: "token",
    resourceKeyPattern: ["nfts"],
  },
  { apiProperty: "token", methodName: "getNft", entityName: "token", resourceKeyPattern: ["nft"] },
  {
    apiProperty: "token",
    methodName: "getNftTransactions",
    entityName: "token",
    resourceKeyPattern: ["nft", "transactions"],
  },
  {
    apiProperty: "token",
    methodName: "listPaginated",
    entityName: "token",
    resourceKeyPattern: ["list"],
  },
  {
    apiProperty: "contract",
    methodName: "getInfo",
    entityName: "contract",
    resourceKeyPattern: ["info"],
  },
  {
    apiProperty: "contract",
    methodName: "getResults",
    entityName: "contract",
    resourceKeyPattern: ["results"],
  },
  {
    apiProperty: "contract",
    methodName: "getResult",
    entityName: "contract",
    resourceKeyPattern: ["result"],
  },
  {
    apiProperty: "contract",
    methodName: "getState",
    entityName: "contract",
    resourceKeyPattern: ["state"],
  },
  {
    apiProperty: "contract",
    methodName: "getLogs",
    entityName: "contract",
    resourceKeyPattern: ["logs"],
  },
  {
    apiProperty: "contract",
    methodName: "getAllResults",
    entityName: "contract",
    resourceKeyPattern: ["results", "all"],
  },
  {
    apiProperty: "contract",
    methodName: "getResultByTransactionIdOrHash",
    entityName: "contract",
    resourceKeyPattern: ["results", "byTx"],
  },
  {
    apiProperty: "contract",
    methodName: "getResultActions",
    entityName: "contract",
    resourceKeyPattern: ["results", "actions"],
  },
  {
    apiProperty: "contract",
    methodName: "getResultOpcodes",
    entityName: "contract",
    resourceKeyPattern: ["results", "opcodes"],
  },
  {
    apiProperty: "contract",
    methodName: "getAllContractLogs",
    entityName: "contract",
    resourceKeyPattern: ["results", "logs", "all"],
  },
  {
    apiProperty: "contract",
    methodName: "call",
    entityName: "contract",
    resourceKeyPattern: ["call"],
  },
  {
    apiProperty: "contract",
    methodName: "listPaginated",
    entityName: "contract",
    resourceKeyPattern: ["list"],
  },
  {
    apiProperty: "transaction",
    methodName: "getById",
    entityName: "transaction",
    resourceKeyPattern: ["info"],
  },
  {
    apiProperty: "transaction",
    methodName: "listByAccount",
    entityName: "transaction",
    resourceKeyPattern: ["account"],
  },
  {
    apiProperty: "transaction",
    methodName: "listPaginated",
    entityName: "transaction",
    resourceKeyPattern: ["list"],
  },
  {
    apiProperty: "topic",
    methodName: "getInfo",
    entityName: "topic",
    resourceKeyPattern: ["info"],
  },
  {
    apiProperty: "topic",
    methodName: "getMessages",
    entityName: "topic",
    resourceKeyPattern: ["messages"],
  },
  {
    apiProperty: "topic",
    methodName: "getMessage",
    entityName: "topic",
    resourceKeyPattern: ["message"],
  },
  {
    apiProperty: "topic",
    methodName: "getMessageByTimestamp",
    entityName: "topic",
    resourceKeyPattern: ["message", "byTimestamp"],
  },
  {
    apiProperty: "topic",
    methodName: "listPaginated",
    entityName: "topic",
    resourceKeyPattern: ["list"],
  },
  {
    apiProperty: "schedule",
    methodName: "getInfo",
    entityName: "schedule",
    resourceKeyPattern: ["info"],
  },
  {
    apiProperty: "schedule",
    methodName: "listPaginated",
    entityName: "schedule",
    resourceKeyPattern: ["list"],
  },
  {
    apiProperty: "network",
    methodName: "getExchangeRate",
    entityName: "network",
    resourceKeyPattern: ["exchange-rate"],
  },
  {
    apiProperty: "network",
    methodName: "getFees",
    entityName: "network",
    resourceKeyPattern: ["fees"],
  },
  {
    apiProperty: "network",
    methodName: "getNodes",
    entityName: "network",
    resourceKeyPattern: ["nodes"],
  },
  {
    apiProperty: "network",
    methodName: "getStake",
    entityName: "network",
    resourceKeyPattern: ["stake"],
  },
  {
    apiProperty: "network",
    methodName: "getSupply",
    entityName: "network",
    resourceKeyPattern: ["supply"],
  },
  {
    apiProperty: "balance",
    methodName: "getBalances",
    entityName: "balance",
    resourceKeyPattern: ["list"],
  },
  {
    apiProperty: "block",
    methodName: "getBlocks",
    entityName: "block",
    resourceKeyPattern: ["list"],
  },
  {
    apiProperty: "block",
    methodName: "getBlock",
    entityName: "block",
    resourceKeyPattern: ["info"],
  },
] as const;

export function isValidMirrorNodeKey(
  key: unknown,
): key is readonly ["mirror-node", string, string, ...unknown[]] {
  return (
    Array.isArray(key) &&
    key.length >= 4 &&
    key[0] === "mirror-node" &&
    typeof key[1] === "string" &&
    typeof key[2] === "string"
  );
}

export function findMethodMapping(
  queryKey: readonly unknown[],
): { mapping: MethodMapping; args: unknown[] } | null {
  if (!isValidMirrorNodeKey(queryKey)) {
    return null;
  }

  const [, , entity, ...queryKeyParts] = queryKey;

  for (const mapping of METHOD_MAPPINGS) {
    const isEntityMatch = entity === mapping.entityName || entity === `${mapping.entityName}s`;

    if (!isEntityMatch) continue;

    const isListWithPluralEntity =
      entity === `${mapping.entityName}s` && queryKeyParts[0] === "list";

    if (isListWithPluralEntity) {
      return { mapping, args: queryKeyParts.slice(1) };
    }

    const isPatternMatch = mapping.resourceKeyPattern.every(
      (part, index) => part === queryKeyParts[index],
    );

    if (!isPatternMatch) continue;

    const args = queryKeyParts.slice(mapping.resourceKeyPattern.length);
    return { mapping, args };
  }

  return null;
}

export async function prefetchQuery(
  queryClient: QueryClient,
  client: MirrorNodeClient,
  queryKey: readonly unknown[],
): Promise<void> {
  const result = findMethodMapping(queryKey);

  if (!result) {
    throw new Error(`Cannot find mapping for query key: ${JSON.stringify(queryKey)}`);
  }

  const { mapping, args } = result;

  const api = client[mapping.apiProperty];
  const apiMethods = api as unknown as Record<string, unknown>;
  const method = apiMethods[mapping.methodName];

  if (typeof method !== "function") {
    throw new Error(`Method ${mapping.methodName} not found on ${mapping.apiProperty}`);
  }

  await queryClient.prefetchQuery({
    queryKey,
    queryFn: () => method(...args),
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

  const { entityType, resourceId } = filters;

  return queryClient.invalidateQueries({
    predicate: (query) => {
      const key = query.queryKey;

      if (!isValidMirrorNodeKey(key)) return false;

      const [, entity] = key;

      if (entity !== entityType) return false;

      if (resourceId !== undefined) {
        const lastKey = key[key.length - 1];
        if (lastKey !== resourceId) return false;
      }

      return true;
    },
  });
}
