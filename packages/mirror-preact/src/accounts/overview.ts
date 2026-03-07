import { useQuery } from "@tanstack/preact-query";
import type { EntityId } from "@hieco/mirror";
import type { AccountInfo, Balance, TokenRelationship } from "@hieco/mirror";
import { useMirrorNodeClient, useNetwork } from "../context-hooks";
import { mirrorNodeKeys } from "@hieco/utils";

export interface UseAccountOverviewOptions {
  readonly accountId: EntityId;
  readonly includeBalances?: boolean;
  readonly includeTokens?: boolean;
}

export interface AccountOverviewData {
  info: AccountInfo | null;
  balances: Balance | null;
  tokens: TokenRelationship[] | null;
}

export function useAccountOverview(options: UseAccountOverviewOptions): AccountOverviewData {
  const { accountId, includeBalances = true, includeTokens = true } = options;
  const client = useMirrorNodeClient();
  const { network } = useNetwork();

  const infoQuery = useQuery({
    queryKey: mirrorNodeKeys.account.info(network, accountId),
    queryFn: () => client.account.getInfo(accountId),
  });

  const balancesQuery = useQuery({
    queryKey: mirrorNodeKeys.account.balances(network, accountId),
    queryFn: () => client.account.getBalances(accountId),
    enabled: includeBalances,
  });

  const tokensQuery = useQuery({
    queryKey: mirrorNodeKeys.account.tokens(network, accountId),
    queryFn: () => client.account.getTokens(accountId),
    enabled: includeTokens,
  });

  return {
    info: infoQuery.data?.success ? infoQuery.data.data : null,
    balances: balancesQuery.data?.success ? balancesQuery.data.data : null,
    tokens: tokensQuery.data?.success ? tokensQuery.data.data : null,
  };
}
