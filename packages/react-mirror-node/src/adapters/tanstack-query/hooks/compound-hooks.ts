import { useQuery } from "@tanstack/react-query";
import type { EntityId } from "@hiecom/mirror-node";
import type {
  AccountInfo,
  Balance,
  TokenRelationship,
} from "@hiecom/mirror-node";
import { useMirrorNodeClient, useNetwork } from "../../../react/hooks";
import { mirrorNodeKeys } from "../query-keys";
import { isSuccess } from "../utils/type-guards";

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
    info: infoQuery.data && isSuccess(infoQuery.data) ? infoQuery.data.data : null,
    balances: balancesQuery.data && isSuccess(balancesQuery.data) ? balancesQuery.data.data : null,
    tokens: tokensQuery.data && isSuccess(tokensQuery.data) ? tokensQuery.data.data : null,
  };
}
