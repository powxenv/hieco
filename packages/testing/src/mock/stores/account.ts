import { Hbar } from "@hiero-ledger/sdk";
import type { AccountState, EntityId } from "../../types/hiero.js";

const INITIAL_ACCOUNT_NUM = 1000;

type AccountId = EntityId;

interface TransferResult {
  readonly success: boolean;
  readonly fromBalance: Hbar | null;
  readonly toBalance: Hbar | null;
}

export class AccountStore extends Map<AccountId, AccountState> {
  #nextAccountNum: number;

  constructor() {
    super();
    this.#nextAccountNum = INITIAL_ACCOUNT_NUM;
  }

  create(initialBalance: Hbar, key?: string): AccountState {
    const accountId = `0.0.${this.#nextAccountNum++}` as AccountId;

    const state: AccountState = {
      accountId,
      balance: initialBalance,
      key,
      receiverSigRequired: false,
      deleted: false,
    };

    this.set(accountId, state);
    return state;
  }

  getBalance(accountId: AccountId): Hbar | undefined {
    return this.get(accountId)?.balance;
  }

  setBalance(accountId: AccountId, balance: Hbar): boolean {
    const state = this.get(accountId);
    if (!state) return false;

    const updatedState: AccountState = { ...state, balance };
    this.set(accountId, updatedState);
    return true;
  }

  adjustBalance(accountId: AccountId, delta: bigint): Hbar | null {
    const state = this.get(accountId);
    if (!state) return null;

    const currentBalance = state.balance.toBigNumber().toString();
    const deltaInHbar = Number(delta) / 100_000_000;
    const newBalance = Number(currentBalance) + deltaInHbar;

    const updatedState: AccountState = {
      ...state,
      balance: new Hbar(newBalance),
    };

    this.set(accountId, updatedState);
    return updatedState.balance;
  }

  transferBalance(fromAccountId: AccountId, toAccountId: AccountId, amount: Hbar): TransferResult {
    const fromState = this.get(fromAccountId);
    const toState = this.get(toAccountId);

    if (!fromState || !toState) {
      return { success: false, fromBalance: null, toBalance: null };
    }

    const fromBalance = fromState.balance.toBigNumber();
    const transferAmount = amount.toBigNumber();

    if (fromBalance.isLessThan(transferAmount)) {
      return { success: false, fromBalance: fromState.balance, toBalance: toState.balance };
    }

    const newFromBalance = fromBalance.minus(transferAmount);
    const newToBalance = toState.balance.toBigNumber().plus(transferAmount);

    const updatedFrom: AccountState = {
      ...fromState,
      balance: new Hbar(newFromBalance.toNumber()),
    };

    const updatedTo: AccountState = {
      ...toState,
      balance: new Hbar(newToBalance.toNumber()),
    };

    this.set(fromAccountId, updatedFrom);
    this.set(toAccountId, updatedTo);

    return {
      success: true,
      fromBalance: updatedFrom.balance,
      toBalance: updatedTo.balance,
    };
  }

  override delete(accountId: AccountId): boolean {
    const state = this.get(accountId);
    if (!state) return false;

    const updatedState: AccountState = { ...state, deleted: true };
    this.set(accountId, updatedState);
    return true;
  }

  isDeleted(accountId: AccountId): boolean {
    return this.get(accountId)?.deleted ?? false;
  }

  override clear(): void {
    super.clear();
    this.#nextAccountNum = INITIAL_ACCOUNT_NUM;
  }

  reset(): void {
    this.clear();
  }
}

export function createAccountStore(): AccountStore {
  return new AccountStore();
}
