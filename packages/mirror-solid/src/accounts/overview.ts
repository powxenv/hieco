import { createMemo, type Accessor } from "solid-js";
import { useQuery } from "@tanstack/solid-query";
import type { AccountInfo, Balance, TokenRelationship } from "@hieco/mirror";
import { useMirrorNodeClient, useNetwork } from "../context-hooks";
import { mirrorNodeKeys } from "@hieco/utils";

export interface CreateAccountOverviewOptions {
  readonly accountId: string;
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
    info: infoQuery.data?.success ? infoQuery.data.data : null,
    balances: balancesQuery.data?.success ? balancesQuery.data.data : null,
    tokens: tokensQuery.data?.success ? tokensQuery.data.data : null,
  }));
}
