import type { QueryClient } from "@tanstack/query-core";
import { type MirrorNodeMethodDefinition, mirrorNodeMethodMappings } from "./registry";

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
): { mapping: MirrorNodeMethodDefinition; args: unknown[] } | null {
  if (!isValidMirrorNodeKey(queryKey)) {
    return null;
  }

  const [, , ...queryKeyParts] = queryKey;

  for (const mapping of mirrorNodeMethodMappings) {
    const matches = mapping.keyPath.every((part, index) => part === queryKeyParts[index]);
    if (!matches) continue;
    const args = queryKeyParts.slice(mapping.keyPath.length);
    return { mapping, args };
  }

  return null;
}

type MirrorNodeClientLike = Record<
  MirrorNodeMethodDefinition["apiProperty"],
  Record<string, unknown>
>;

export async function prefetchQuery(
  queryClient: QueryClient,
  client: MirrorNodeClientLike,
  queryKey: readonly unknown[],
): Promise<void> {
  const result = findMethodMapping(queryKey);

  if (!result) {
    throw new Error(`Cannot find mapping for query key: ${JSON.stringify(queryKey)}`);
  }

  const { mapping, args } = result;

  const api = client[mapping.apiProperty];
  const method = api[mapping.methodName];

  if (typeof method !== "function") {
    throw new Error(`Method ${String(mapping.methodName)} not found on ${mapping.apiProperty}`);
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
      readonly resourceId?: string;
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

      const [, , entity] = key;

      if (entity !== entityType) return false;

      if (resourceId !== undefined) {
        const lastKey = key[key.length - 1];
        if (lastKey !== resourceId) return false;
      }

      return true;
    },
  });
}
