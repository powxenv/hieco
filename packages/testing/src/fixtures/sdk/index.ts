import { Hbar } from "@hiero-ledger/sdk";
import type { MockHieroClient } from "../../mock/client.js";
import { createAccountFixture } from "./account.js";
import { createTokenFixture, type TokenFixtureOptions } from "./token.js";
import { createContractFixture, type ContractFixtureOptions } from "./contract.js";
import { createTopicFixture, type TopicFixtureOptions } from "./topic.js";
import type { AccountFixture } from "./account.js";
import type { TokenFixture } from "./token.js";
import type { ContractFixture } from "./contract.js";
import type { TopicFixture } from "./topic.js";

export interface Fixtures {
  accounts: (count: number, initialBalance?: Hbar) => AccountFixture[];
  account: (initialBalance?: Hbar) => AccountFixture;
  token: (options: TokenFixtureOptions) => TokenFixture;
  contract: (options: ContractFixtureOptions) => ContractFixture;
  topic: (options?: TopicFixtureOptions) => TopicFixture;
}

export function createFixtures(client: MockHieroClient): Fixtures {
  return {
    accounts: (count: number, initialBalance?: Hbar) => {
      const accounts: AccountFixture[] = [];
      const balance = initialBalance ?? Hbar.fromTinybars(100_000_000_000);
      for (let i = 0; i < count; i++) {
        accounts.push(createAccountFixture(balance, client));
      }
      return accounts;
    },

    account: (initialBalance?: Hbar) =>
      createAccountFixture(initialBalance ?? Hbar.fromTinybars(100_000_000_000), client),

    token: (options: TokenFixtureOptions) => createTokenFixture(client, options),

    contract: (options: ContractFixtureOptions) => createContractFixture(client, options),

    topic: (options?: TopicFixtureOptions) => createTopicFixture(client, options ?? {}),
  };
}

export const fixtures = createFixtures;
