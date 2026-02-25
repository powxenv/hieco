import type { AccountBalance, TokenBalance as MirrorTokenBalance } from "@hiecom/mirror-js";
import type { Factory } from "./account.js";

export type TokenBalance = Pick<MirrorTokenBalance, "token_id"> & {
  readonly balance: number;
};

export type BalanceFixtureOptions = Partial<Pick<AccountBalance, "account">> & {
  readonly hbar?: number;
  readonly tokens?: readonly TokenBalance[];
};

const createBalance = (options: BalanceFixtureOptions = {}): AccountBalance => {
  const accountId = options.account ?? ("0.0.0" as const);

  return {
    account: accountId,
    balance: options.hbar ?? 100000000000,
    tokens:
      options.tokens?.map(
        (t) =>
          ({
            token_id: t.token_id,
            balance: t.balance,
          }) as const,
      ) ?? [],
  };
};

export const mockBalance: Factory<AccountBalance, BalanceFixtureOptions> = {
  build: (overrides) => createBalance(overrides),
  buildList: (count, overrides) => Array.from({ length: count }, () => createBalance(overrides)),
};
