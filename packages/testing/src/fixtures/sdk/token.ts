import type { MockHieroClient } from "../../mock/client.js";
import type { TokenState, EntityId } from "../../types/hiero.js";

export class TokenFixture {
  readonly #state: TokenState;
  readonly #client: MockHieroClient;

  constructor(state: TokenState, client: MockHieroClient) {
    this.#state = state;
    this.#client = client;
  }

  get tokenId(): EntityId {
    return this.#state.tokenId;
  }

  get name(): string {
    return this.#state.name;
  }

  get symbol(): string {
    return this.#state.symbol;
  }

  get decimals(): number {
    return this.#state.decimals;
  }

  get totalSupply(): bigint {
    return this.#state.totalSupply;
  }

  get treasury(): EntityId {
    return this.#state.treasury;
  }

  get paused(): boolean {
    return this.#state.paused ?? false;
  }

  mint(amount: bigint): bigint | null {
    return this.#client.tokens.mint(this.tokenId, amount);
  }

  burn(amount: bigint): bigint | null {
    return this.#client.tokens.burn(this.tokenId, amount);
  }

  associate(accountId: EntityId): boolean {
    return this.#client.tokens.associate(accountId, this.tokenId);
  }

  dissociate(accountId: EntityId): boolean {
    return this.#client.tokens.dissociate(accountId, this.tokenId);
  }

  getBalance(accountId: EntityId): bigint | undefined {
    return this.#client.tokens.getBalance(accountId, this.tokenId);
  }

  transfer(fromAccountId: EntityId, toAccountId: EntityId, amount: bigint): boolean {
    return this.#client.tokens.transfer(fromAccountId, toAccountId, this.tokenId, amount).success;
  }

  freeze(accountId: EntityId, freeze: boolean): boolean {
    return this.#client.tokens.freeze(accountId, this.tokenId, freeze);
  }

  grantKyc(accountId: EntityId): boolean {
    return this.#client.tokens.grantKyc(accountId, this.tokenId);
  }

  revokeKyc(accountId: EntityId): boolean {
    return this.#client.tokens.revokeKyc(accountId, this.tokenId);
  }

  wipe(accountId: EntityId, amount: bigint): boolean {
    return this.#client.tokens.wipe(accountId, this.tokenId, amount);
  }

  pause(): boolean {
    return this.#client.tokens.pause(this.tokenId);
  }

  unpause(): boolean {
    return this.#client.tokens.unpause(this.tokenId);
  }
}

export interface TokenFixtureOptions {
  readonly name: string;
  readonly symbol: string;
  readonly decimals: number;
  readonly initialSupply: bigint;
  readonly treasury: EntityId;
  readonly adminKey?: string;
  readonly kycKey?: string;
  readonly freezeKey?: string;
  readonly wipeKey?: string;
  readonly supplyKey?: string;
  readonly pauseKey?: string;
  readonly feeScheduleKey?: string;
}

export function createTokenFixture(
  client: MockHieroClient,
  options: TokenFixtureOptions,
): TokenFixture {
  const state = client.tokens.createToken(options);

  client.tokens.associate(options.treasury, state.tokenId);
  client.tokens.setBalance(options.treasury, state.tokenId, options.initialSupply);

  return new TokenFixture(state, client);
}
