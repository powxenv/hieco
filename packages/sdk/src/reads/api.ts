import type { ReadsNamespace } from "./namespace.ts";
import { createAccountsReads } from "./accounts.ts";
import { createTokensReads } from "./tokens.ts";
import { createContractsReads } from "./contracts.ts";
import { createTransactionsReads } from "./transactions.ts";
import { createTopicsReads } from "./topics.ts";
import { createSchedulesReads } from "./schedules.ts";
import { createNetworkReads } from "./network.ts";
import { createBalancesReads } from "./balances.ts";
import { createBlocksReads } from "./blocks.ts";
import type { ReadsContext } from "./shared.ts";

export function createReadsNamespace(context: ReadsContext): ReadsNamespace {
  return {
    accounts: createAccountsReads(context),
    tokens: createTokensReads(context),
    contracts: createContractsReads(context),
    transactions: createTransactionsReads(context),
    topics: createTopicsReads(context),
    schedules: createSchedulesReads(context),
    network: createNetworkReads(context),
    balances: createBalancesReads(context),
    blocks: createBlocksReads(context),
  };
}
