import type { TokenState, TokenAssociation, EntityId } from "../../types/hiero.js";

const INITIAL_TOKEN_NUM = 2000;

type TokenId = EntityId;
type AccountId = EntityId;

type AssociationKey = `${AccountId}:${TokenId}`;

interface TransferResult {
  readonly success: boolean;
  readonly fromBalance: bigint | null;
  readonly toBalance: bigint | null;
}

interface TokenCreationConfig {
  readonly name: string;
  readonly symbol: string;
  readonly decimals: number;
  readonly initialSupply: bigint;
  readonly treasury: AccountId;
  readonly adminKey?: string;
  readonly kycKey?: string;
  readonly freezeKey?: string;
  readonly wipeKey?: string;
  readonly supplyKey?: string;
  readonly pauseKey?: string;
  readonly feeScheduleKey?: string;
}

export class TokenStore extends Map<TokenId, TokenState> {
  #associations: Map<AssociationKey, TokenAssociation>;
  #nextTokenNum: number;

  constructor() {
    super();
    this.#associations = new Map();
    this.#nextTokenNum = INITIAL_TOKEN_NUM;
  }

  createToken(config: TokenCreationConfig): TokenState {
    const tokenId = `0.0.${this.#nextTokenNum++}` as TokenId;

    const state: TokenState = {
      tokenId,
      name: config.name,
      symbol: config.symbol,
      decimals: config.decimals,
      totalSupply: config.initialSupply,
      treasury: config.treasury,
      adminKey: config.adminKey,
      kycKey: config.kycKey,
      freezeKey: config.freezeKey,
      wipeKey: config.wipeKey,
      supplyKey: config.supplyKey,
      pauseKey: config.pauseKey,
      feeScheduleKey: config.feeScheduleKey,
      paused: false,
      deleted: false,
    };

    this.set(tokenId, state);
    return state;
  }

  associate(accountId: AccountId, tokenId: TokenId): boolean {
    const key = `${accountId}:${tokenId}` as AssociationKey;

    if (this.#associations.has(key)) {
      return false;
    }

    const token = this.get(tokenId);
    if (!token || token.deleted) {
      return false;
    }

    const association: TokenAssociation = {
      accountId,
      tokenId,
      balance: 0n,
      kycGranted: !token.kycKey,
      frozen: false,
    };

    this.#associations.set(key, association);
    return true;
  }

  dissociate(accountId: AccountId, tokenId: TokenId): boolean {
    const key = `${accountId}:${tokenId}` as AssociationKey;
    return this.#associations.delete(key);
  }

  isAssociated(accountId: AccountId, tokenId: TokenId): boolean {
    const key = `${accountId}:${tokenId}` as AssociationKey;
    return this.#associations.has(key);
  }

  getAssociation(accountId: AccountId, tokenId: TokenId): TokenAssociation | undefined {
    const key = `${accountId}:${tokenId}` as AssociationKey;
    return this.#associations.get(key);
  }

  getBalance(accountId: AccountId, tokenId: TokenId): bigint | undefined {
    const key = `${accountId}:${tokenId}` as AssociationKey;
    return this.#associations.get(key)?.balance;
  }

  setBalance(accountId: AccountId, tokenId: TokenId, balance: bigint): boolean {
    const key = `${accountId}:${tokenId}` as AssociationKey;
    const association = this.#associations.get(key);

    if (!association) {
      return false;
    }

    const updated: TokenAssociation = { ...association, balance };
    this.#associations.set(key, updated);
    return true;
  }

  transfer(
    fromAccountId: AccountId,
    toAccountId: AccountId,
    tokenId: TokenId,
    amount: bigint,
  ): TransferResult {
    const fromKey = `${fromAccountId}:${tokenId}` as AssociationKey;
    const toKey = `${toAccountId}:${tokenId}` as AssociationKey;

    const fromAssoc = this.#associations.get(fromKey);
    const toAssoc = this.#associations.get(toKey);

    if (!fromAssoc || !toAssoc) {
      return { success: false, fromBalance: null, toBalance: null };
    }

    if (fromAssoc.frozen || toAssoc.frozen) {
      return { success: false, fromBalance: fromAssoc.balance, toBalance: toAssoc.balance };
    }

    if (!fromAssoc.kycGranted || !toAssoc.kycGranted) {
      return { success: false, fromBalance: fromAssoc.balance, toBalance: toAssoc.balance };
    }

    if (fromAssoc.balance < amount) {
      return { success: false, fromBalance: fromAssoc.balance, toBalance: toAssoc.balance };
    }

    const updatedFrom: TokenAssociation = {
      ...fromAssoc,
      balance: fromAssoc.balance - amount,
    };

    const updatedTo: TokenAssociation = {
      ...toAssoc,
      balance: toAssoc.balance + amount,
    };

    this.#associations.set(fromKey, updatedFrom);
    this.#associations.set(toKey, updatedTo);

    return {
      success: true,
      fromBalance: updatedFrom.balance,
      toBalance: updatedTo.balance,
    };
  }

  mint(tokenId: TokenId, amount: bigint): bigint | null {
    const token = this.get(tokenId);
    if (!token || token.deleted || token.paused || !token.supplyKey) {
      return null;
    }

    const updatedState: TokenState = {
      ...token,
      totalSupply: token.totalSupply + amount,
    };

    this.set(tokenId, updatedState);

    const treasuryKey = `${token.treasury}:${tokenId}` as AssociationKey;
    const treasuryAssoc = this.#associations.get(treasuryKey);

    if (treasuryAssoc) {
      const updatedAssoc: TokenAssociation = {
        ...treasuryAssoc,
        balance: treasuryAssoc.balance + amount,
      };
      this.#associations.set(treasuryKey, updatedAssoc);
    }

    return updatedState.totalSupply;
  }

  burn(tokenId: TokenId, amount: bigint): bigint | null {
    const token = this.get(tokenId);
    if (!token || token.deleted || token.paused || !token.supplyKey) {
      return null;
    }

    if (token.totalSupply < amount) {
      return null;
    }

    const updatedState: TokenState = {
      ...token,
      totalSupply: token.totalSupply - amount,
    };

    this.set(tokenId, updatedState);
    return updatedState.totalSupply;
  }

  freeze(accountId: AccountId, tokenId: TokenId, freeze: boolean): boolean {
    const key = `${accountId}:${tokenId}` as AssociationKey;
    const association = this.#associations.get(key);

    if (!association) {
      return false;
    }

    const token = this.get(tokenId);
    if (!token || !token.freezeKey) {
      return false;
    }

    const updated: TokenAssociation = { ...association, frozen: freeze };
    this.#associations.set(key, updated);
    return true;
  }

  grantKyc(accountId: AccountId, tokenId: TokenId): boolean {
    const key = `${accountId}:${tokenId}` as AssociationKey;
    const association = this.#associations.get(key);

    if (!association) {
      return false;
    }

    const token = this.get(tokenId);
    if (!token || !token.kycKey) {
      return false;
    }

    const updated: TokenAssociation = { ...association, kycGranted: true };
    this.#associations.set(key, updated);
    return true;
  }

  revokeKyc(accountId: AccountId, tokenId: TokenId): boolean {
    const key = `${accountId}:${tokenId}` as AssociationKey;
    const association = this.#associations.get(key);

    if (!association) {
      return false;
    }

    const token = this.get(tokenId);
    if (!token || !token.kycKey) {
      return false;
    }

    const updated: TokenAssociation = { ...association, kycGranted: false };
    this.#associations.set(key, updated);
    return true;
  }

  wipe(accountId: AccountId, tokenId: TokenId, amount: bigint): boolean {
    const key = `${accountId}:${tokenId}` as AssociationKey;
    const association = this.#associations.get(key);

    if (!association) {
      return false;
    }

    const token = this.get(tokenId);
    if (!token || !token.wipeKey) {
      return false;
    }

    if (association.balance < amount) {
      return false;
    }

    const updated: TokenAssociation = {
      ...association,
      balance: association.balance - amount,
    };
    this.#associations.set(key, updated);

    const updatedToken: TokenState = {
      ...token,
      totalSupply: token.totalSupply - amount,
    };
    this.set(tokenId, updatedToken);

    return true;
  }

  pause(tokenId: TokenId): boolean {
    const token = this.get(tokenId);
    if (!token || token.deleted || !token.pauseKey) {
      return false;
    }

    const updated: TokenState = { ...token, paused: true };
    this.set(tokenId, updated);
    return true;
  }

  unpause(tokenId: TokenId): boolean {
    const token = this.get(tokenId);
    if (!token || token.deleted || !token.pauseKey) {
      return false;
    }

    const updated: TokenState = { ...token, paused: false };
    this.set(tokenId, updated);
    return true;
  }

  override delete(tokenId: TokenId): boolean {
    const token = this.get(tokenId);
    if (!token) return false;

    const updated: TokenState = { ...token, deleted: true };
    this.set(tokenId, updated);
    return true;
  }

  override clear(): void {
    super.clear();
    this.#associations.clear();
    this.#nextTokenNum = INITIAL_TOKEN_NUM;
  }

  reset(): void {
    this.clear();
  }

  get associations(): ReadonlyMap<AssociationKey, TokenAssociation> {
    return this.#associations;
  }
}

export function createTokenStore(): TokenStore {
  return new TokenStore();
}

export type { TokenCreationConfig, TransferResult };
