import { Hbar } from "@hiero-ledger/sdk";
import type { MockHieroClient } from "../../mock/client.js";
import type { AccountState, EntityId } from "../../types/hiero.js";

const DEFAULT_PRIVATE_KEY =
  "302e020100300506032b657004220420db484b828e64b2d8f12ce3c0a0e93a0b8cce7af1bb8f39c97732394482538e10";

export class AccountFixture {
  readonly state: AccountState;
  readonly client: MockHieroClient;
  readonly privateKey: string;

  constructor(state: AccountState, client: MockHieroClient, privateKey: string) {
    this.state = state;
    this.client = client;
    this.privateKey = privateKey;
  }

  get accountId(): EntityId {
    return this.state.accountId;
  }

  get balance(): Hbar {
    return this.state.balance;
  }

  setBalance(balance: Hbar): boolean {
    return this.client.accounts.setBalance(this.accountId, balance);
  }

  transfer(toAccountId: EntityId, amount: Hbar): boolean {
    return this.client.accounts.transferBalance(this.accountId, toAccountId, amount).success;
  }
}

export function createAccountFixture(
  initialBalance: Hbar,
  client: MockHieroClient,
  privateKey: string = DEFAULT_PRIVATE_KEY,
): AccountFixture {
  const state = client.accounts.create(initialBalance, privateKey);
  return new AccountFixture(state, client, privateKey);
}
