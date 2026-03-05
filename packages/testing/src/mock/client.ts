import { AccountId, PrivateKey, PublicKey, Hbar } from "@hiero-ledger/sdk";
import type { TransactionReceipt } from "../types/hiero.js";
import { AccountStore } from "./stores/account.js";
import { TokenStore } from "./stores/token.js";
import { ContractStore } from "./stores/contract.js";
import { TopicStore } from "./stores/topic.js";
import { TimeController } from "./time/time-controller.js";
import { SnapshotManager } from "./snapshot/snapshot-manager.js";

const DEFAULT_MAX_QUERY_PAYMENT_TINYBARS = 100_000_000;
const DEFAULT_MAX_TRANSACTION_FEE_TINYBARS = 1_000_000_000;
const DEFAULT_REQUEST_TIMEOUT_MS = 60_000;
const DEFAULT_GRPC_DEADLINE_MS = 10_000;
const DEFAULT_SHARD = 0;
const DEFAULT_REALM = 0;

type MockCall = readonly unknown[];

interface MockFunctionState {
  calls: MockCall[];
  implementation: null | ((...args: readonly unknown[]) => unknown);
}

interface MockFunction extends MockFunctionState {
  (...args: readonly unknown[]): unknown;
  mockResolvedValueOnce(value: unknown): MockFunction;
  mockRejectedValueOnce(error: Error): MockFunction;
  mockReturnValueOnce(value: unknown): MockFunction;
  mockRejectedOnce(error: Error): MockFunction;
  mockImplementation(fn: (...args: readonly unknown[]) => unknown): MockFunction;
}

interface OperatorState {
  readonly accountId: AccountId;
  readonly publicKey: PublicKey;
  readonly privateKey: PrivateKey | null;
  readonly transactionSigner?: (message: Uint8Array) => Promise<Uint8Array>;
}

interface NetworkConfig {
  readonly [nodeAddress: string]: AccountId | string;
}

type TransactionCallback = (tx: unknown) => void;
type QueryCallback = (query: unknown) => void;

export class MockHieroClient {
  readonly accounts: AccountStore;
  readonly tokens: TokenStore;
  readonly contracts: ContractStore;
  readonly topics: TopicStore;
  readonly time: TimeController;
  readonly snapshot: SnapshotManager;

  readonly execute: MockFunction;
  readonly _setOperatorMock: MockFunction;

  #network: NetworkConfig;
  #mirrorNetwork: readonly string[];
  #operator: OperatorState | null;
  #maxQueryPayment: Hbar;
  #maxTransactionFee: Hbar;
  #requestTimeout: number;
  #grpcDeadline: number;
  #shard: number;
  #realm: number;
  #autoValidateChecksums: boolean;
  #maxNodesPerTransaction: number;
  #defaultRegenerateTransactionId: boolean;
  #isShutdown: boolean;

  _onTransaction: TransactionCallback | null;
  _onQuery: QueryCallback | null;
  #transactionResponses: Map<string, TransactionReceipt>;
  #queryResponses: Map<string, unknown>;

  constructor() {
    this.time = new TimeController();
    this.snapshot = new SnapshotManager();

    const now = (): Date => this.time.now();

    this.accounts = new AccountStore();
    this.tokens = new TokenStore();
    this.contracts = new ContractStore(now);
    this.topics = new TopicStore(now);

    this.#network = { "0.0.3": "0.testnet.hedera.com:50211" };
    this.#mirrorNetwork = ["https://testnet.mirrornode.hedera.com"];
    this.#operator = null;
    this.#isShutdown = false;
    this.#shard = DEFAULT_SHARD;
    this.#realm = DEFAULT_REALM;
    this.#autoValidateChecksums = true;
    this.#maxNodesPerTransaction = 0;
    this.#defaultRegenerateTransactionId = true;
    this.#requestTimeout = DEFAULT_REQUEST_TIMEOUT_MS;
    this.#grpcDeadline = DEFAULT_GRPC_DEADLINE_MS;
    this.#transactionResponses = new Map();
    this.#queryResponses = new Map();
    this._onTransaction = null;
    this._onQuery = null;

    this.#maxQueryPayment = Hbar.fromTinybars(DEFAULT_MAX_QUERY_PAYMENT_TINYBARS);
    this.#maxTransactionFee = Hbar.fromTinybars(DEFAULT_MAX_TRANSACTION_FEE_TINYBARS);

    this.execute = this.#createMockFunction("execute");
    this._setOperatorMock = this.#createMockFunction("_setOperatorMock");
  }

  get network(): NetworkConfig {
    return { ...this.#network };
  }

  setNetwork(network: NetworkConfig | string): void {
    this.#network = typeof network === "string" ? { "0.0.3": network } : { ...network };
  }

  getNetwork(): NetworkConfig {
    return this.network;
  }

  get mirrorNetwork(): readonly string[] {
    return [...this.#mirrorNetwork];
  }

  setMirrorNetwork(network: string | readonly string[]): void {
    this.#mirrorNetwork = Array.isArray(network) ? [...network] : [network];
  }

  getMirrorNetwork(): readonly string[] {
    return this.mirrorNetwork;
  }

  setMaxQueryPayment(amount: Hbar): this {
    this.#maxQueryPayment = amount;
    return this;
  }

  setDefaultMaxQueryPayment(amount: Hbar): this {
    return this.setMaxQueryPayment(amount);
  }

  getMaxQueryPayment(): Hbar {
    return this.#maxQueryPayment;
  }

  get maxQueryPayment(): Hbar {
    return this.#maxQueryPayment;
  }

  setMaxTransactionFee(amount: Hbar): this {
    this.#maxTransactionFee = amount;
    return this;
  }

  setDefaultMaxTransactionFee(amount: Hbar): this {
    return this.setMaxTransactionFee(amount);
  }

  get defaultMaxTransactionFee(): Hbar | null {
    return this.#maxTransactionFee;
  }

  get maxTransactionFee(): Hbar | null {
    return this.#maxTransactionFee;
  }

  get shard(): number {
    return this.#shard;
  }

  get realm(): number {
    return this.#realm;
  }

  get operatorAccountId(): AccountId | null {
    return this.#operator?.accountId ?? null;
  }

  get operatorPublicKey(): PublicKey | null {
    return this.#operator?.publicKey ?? null;
  }

  setOperator(accountId: AccountId | string, privateKey: PrivateKey | string): this {
    const resolvedAccountId =
      typeof accountId === "string" ? AccountId.fromString(accountId) : accountId;

    const resolvedPrivateKey =
      typeof privateKey === "string" ? PrivateKey.fromString(privateKey) : privateKey;

    this.#operator = {
      accountId: resolvedAccountId,
      publicKey: resolvedPrivateKey.publicKey,
      privateKey: resolvedPrivateKey,
    };

    return this;
  }

  getOperator(): { publicKey: PublicKey; accountId: AccountId } | null {
    if (!this.#operator) return null;
    return {
      publicKey: this.#operator.publicKey,
      accountId: this.#operator.accountId,
    };
  }

  setOperatorWith(
    accountId: AccountId | string,
    publicKey: PublicKey | string,
    transactionSigner: (message: Uint8Array) => Promise<Uint8Array>,
  ): this {
    const resolvedAccountId =
      typeof accountId === "string" ? AccountId.fromString(accountId) : accountId;

    const resolvedPublicKey =
      typeof publicKey === "string" ? PublicKey.fromString(publicKey) : publicKey;

    this.#operator = {
      accountId: resolvedAccountId,
      publicKey: resolvedPublicKey,
      privateKey: null,
      transactionSigner,
    };

    return this;
  }

  setRequestTimeout(timeout: number): this {
    this.#requestTimeout = timeout;
    return this;
  }

  get requestTimeout(): number {
    return this.#requestTimeout;
  }

  setGrpcDeadline(deadline: number): this {
    this.#grpcDeadline = deadline;
    return this;
  }

  get grpcDeadline(): number {
    return this.#grpcDeadline;
  }

  setMaxNodesPerTransaction(max: number): this {
    this.#maxNodesPerTransaction = max;
    return this;
  }

  get maxNodesPerTransaction(): number {
    return this.#maxNodesPerTransaction;
  }

  setAutoValidateChecksums(value: boolean): this {
    this.#autoValidateChecksums = value;
    return this;
  }

  isAutoValidateChecksumsEnabled(): boolean {
    return this.#autoValidateChecksums;
  }

  get defaultRegenerateTransactionId(): boolean {
    return this.#defaultRegenerateTransactionId;
  }

  setDefaultRegenerateTransactionId(value: boolean): this {
    this.#defaultRegenerateTransactionId = value;
    return this;
  }

  get isClientShutDown(): boolean {
    return this.#isShutdown;
  }

  setTime(timestamp: Date): void {
    this.time.setTime(timestamp);
  }

  freezeTime(at?: Date): void {
    this.time.freeze(at);
  }

  unfreezeTime(): void {
    this.time.unfreeze();
  }

  advanceTime(milliseconds: number): void {
    this.time.advance(milliseconds);
  }

  reset(): void {
    this.accounts.reset();
    this.tokens.reset();
    this.contracts.reset();
    this.topics.reset();
    this.time.reset();
    this.#transactionResponses.clear();
    this.#queryResponses.clear();
  }

  mockTransactionResponse(txId: string, receipt: TransactionReceipt): void {
    this.#transactionResponses.set(txId, receipt);
  }

  mockQueryResponse(queryType: string, response: unknown): void {
    this.#queryResponses.set(queryType, response);
  }

  clearMocks(): void {
    this.#transactionResponses.clear();
    this.#queryResponses.clear();
    this.execute.calls.length = 0;
    this._setOperatorMock.calls.length = 0;
  }

  async ping(_accountId: AccountId | string): Promise<void> {}

  async pingAll(): Promise<void> {}

  async updateNetwork(): Promise<this> {
    return this;
  }

  close(): void {
    this.#isShutdown = true;
  }

  #createMockFunction(_name: string): MockFunction {
    const state: MockFunctionState = {
      calls: [],
      implementation: null,
    };

    const fn = function (...args: readonly unknown[]): unknown {
      if (state.implementation) {
        return state.implementation(...args);
      }
      throw new Error(`Mock function was called but not implemented`);
    } as MockFunction;

    fn.calls = state.calls;
    fn.implementation = state.implementation;

    fn.mockResolvedValueOnce = function (value: unknown): MockFunction {
      state.implementation = () => value;
      return fn;
    };

    fn.mockRejectedValueOnce = function (error: Error): MockFunction {
      state.implementation = () => {
        throw error;
      };
      return fn;
    };

    fn.mockReturnValueOnce = function (value: unknown): MockFunction {
      state.implementation = () => value;
      return fn;
    };

    fn.mockRejectedOnce = function (error: Error): MockFunction {
      state.implementation = () => {
        throw error;
      };
      return fn;
    };

    fn.mockImplementation = function (
      impl: (...args: readonly unknown[]) => unknown,
    ): MockFunction {
      state.implementation = impl;
      return fn;
    };

    return fn;
  }
}
