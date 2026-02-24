import { createMemo, type Accessor } from "solid-js";
import { useQuery } from "@tanstack/solid-query";
import type { EntityId } from "@hiecom/mirror-node";
import type { AccountInfo, Balance, TokenRelationship } from "@hiecom/mirror-node";
import { useMirrorNodeClient, useNetwork } from "../../../solid/hooks";
import { mirrorNodeKeys } from "../query-keys";
import { isSuccess } from "../utils/type-guards";

export interface CreateAccountOverviewOptions {
  readonly accountId: EntityId;
  readonly includeBalances?: boolean;
  readonly includeTokens?: boolean;
}

export interface AccountOverviewData {
  readonly info: AccountInfo | null;
  readonly balances: Balance | null;
  readonly tokens: TokenRelationship[] | null;
}

export function createAccountOverview(
  options: Accessor<CreateAccountOverviewOptions>,
): Accessor<AccountOverviewData> {
  const client = useMirrorNodeClient();
  const { network } = useNetwork();

  const opts = createMemo(() => options());

  const infoQuery = useQuery(() => {
    const o = opts();
    return {
      queryKey: mirrorNodeKeys.account.info(network(), o.accountId),
      queryFn: () => client().account.getInfo(o.accountId),
    };
  });

  const balancesQuery = useQuery(() => {
    const o = opts();
    return {
      queryKey: mirrorNodeKeys.account.balances(network(), o.accountId),
      queryFn: () => client().account.getBalances(o.accountId),
      get enabled() {
        return o.includeBalances ?? true;
      },
    };
  });

  const tokensQuery = useQuery(() => {
    const o = opts();
    return {
      queryKey: mirrorNodeKeys.account.tokens(network(), o.accountId),
      queryFn: () => client().account.getTokens(o.accountId),
      get enabled() {
        return o.includeTokens ?? true;
      },
    };
  });

  return createMemo(() => ({
    info: infoQuery.data && isSuccess(infoQuery.data) ? infoQuery.data.data : null,
    balances: balancesQuery.data && isSuccess(balancesQuery.data) ? balancesQuery.data.data : null,
    tokens: tokensQuery.data && isSuccess(tokensQuery.data) ? tokensQuery.data.data : null,
  }));
}
