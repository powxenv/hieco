import { Client, Hbar } from "@hieco/runtime";
import type { Signer as HieroSigner } from "@hieco/runtime";
import { MirrorNodeClient } from "@hieco/mirror";
import type { ClientConfig, TransactionDescriptor } from "../shared/params.ts";
import type { ClientRuntimeConfig } from "./runtime.ts";
import type { Result } from "../results/result.ts";
import { err } from "../results/result.ts";
import { loadConfigFromEnv, resolveConfig } from "./config.ts";
import { createAccountsNamespace } from "../accounts/api.ts";
import { createTokensNamespace } from "../tokens/api.ts";
import { createTopicsNamespace } from "../topics/api.ts";
import { createContractsNamespace } from "../contracts/api.ts";
import { createFilesNamespace } from "../files/api.ts";
import { createSchedulesNamespace } from "../schedules/api.ts";
import { createTransactionsNamespace } from "../transactions/namespace.ts";
import { createNetworkNamespace } from "../network/api.ts";
import { createReadsNamespace } from "../reads/api.ts";
import {
  callContract,
  callContractWithParams,
  queryLiveHash,
  queryFileContents,
  queryFileInfo,
  queryTransactionRecord,
  queryTransactionReceipt,
  requireSigningContext,
  resolveQueryContext as resolveSigningForQuery,
  submitTransaction,
  queryContractBytecode,
} from "../transactions/api.ts";
import { createError } from "../errors/error.ts";
import type { TransactionReceiptData } from "../results/shapes.ts";

export class HieroClient {
  readonly mirror: MirrorNodeClient;
  readonly accounts: ReturnType<typeof createAccountsNamespace>;
  readonly tokens: ReturnType<typeof createTokensNamespace>;
  readonly topics: ReturnType<typeof createTopicsNamespace>;
  readonly contracts: ReturnType<typeof createContractsNamespace>;
  readonly files: ReturnType<typeof createFilesNamespace>;
  readonly schedules: ReturnType<typeof createSchedulesNamespace>;
  readonly transactions: ReturnType<typeof createTransactionsNamespace>;
  readonly network: ReturnType<typeof createNetworkNamespace>;
  readonly reads: ReturnType<typeof createReadsNamespace>;
  readonly evm: {
    readonly sendRaw: (
      params: import("../shared/params.ts").EthereumSendRawParams,
    ) => Promise<Result<TransactionReceiptData>>;
  };
  readonly legacy: {
    readonly liveHash: {
      readonly get: (
        params: import("../shared/params.ts").LiveHashQueryParams,
      ) => Promise<Result<import("../results/shapes.ts").LiveHashData>>;
      readonly add: (
        params: import("../shared/params.ts").LiveHashAddParams,
      ) => Promise<Result<TransactionReceiptData>>;
      readonly delete: (
        params: import("../shared/params.ts").LiveHashDeleteParams,
      ) => Promise<Result<TransactionReceiptData>>;
    };
  };

  private readonly nativeClient: Client;
  private readonly config: ClientRuntimeConfig;
  private legacyLiveHashWarned = false;

  constructor(config: ClientConfig = {}) {
    const resolved = resolveConfig(config);
    if (!resolved.ok) {
      throw new Error(resolved.error.message);
    }
    this.config = resolved.value;
    this.nativeClient = this.createNativeClient(this.config);
    this.mirror = new MirrorNodeClient({
      network: this.config.network,
      ...(this.config.mirrorUrl ? { mirrorNodeUrl: this.config.mirrorUrl } : {}),
    });

    const submit = (descriptor: TransactionDescriptor): Promise<Result<TransactionReceiptData>> =>
      this.submit(descriptor);

    const call = (params: {
      readonly id: string;
      readonly fn: string;
      readonly args?: ReadonlyArray<unknown>;
      readonly gas: number;
      readonly senderAccountId?: string;
    }) => {
      return this.withQueryContext((queryContext) => callContract(queryContext, params));
    };

    const callWithParams = (params: {
      readonly id: string;
      readonly fn: string;
      readonly params: import("../shared/params.ts").FunctionParamsConfig;
      readonly gas: number;
      readonly senderAccountId?: string;
    }) => {
      return this.withQueryContext((queryContext) => callContractWithParams(queryContext, params));
    };

    const queryInfo = (fileId: string) => {
      return this.withQueryContext((queryContext) => queryFileInfo(queryContext, fileId));
    };

    const queryContents = (fileId: string) => {
      return this.withQueryContext((queryContext) => queryFileContents(queryContext, fileId));
    };

    const queryRecord = (transactionId: string) => {
      return this.withQueryContext((queryContext) =>
        queryTransactionRecord(queryContext, transactionId),
      );
    };

    const queryReceipt = (
      transactionId: string,
      options?: {
        readonly includeChildren?: boolean;
        readonly includeDuplicates?: boolean;
        readonly validateStatus?: boolean;
      },
    ) => {
      return this.withQueryContext((queryContext) =>
        queryTransactionReceipt(queryContext, transactionId, options),
      );
    };

    this.accounts = createAccountsNamespace({
      submit,
      ...(this.config.operator ? { operator: this.config.operator } : {}),
      ...(this.config.signer ? { signer: this.config.signer } : {}),
      mirror: this.mirror,
      nativeClient: this.nativeClient,
      ...(this.config.key ? { operatorKey: this.config.key } : {}),
    });
    this.tokens = createTokensNamespace({
      submit,
      ...(this.config.operator ? { operator: this.config.operator } : {}),
      ...(this.config.signer ? { signer: this.config.signer } : {}),
      mirror: this.mirror,
      nativeClient: this.nativeClient,
      ...(this.config.key ? { operatorKey: this.config.key } : {}),
    });
    this.topics = createTopicsNamespace({
      submit,
      nativeClient: this.nativeClient,
      mirror: this.mirror,
    });
    this.contracts = createContractsNamespace({
      submit,
      uploadFile: (params) => this.files.upload(params),
      call,
      callWithParams,
      mirror: this.mirror,
      queryBytecode: (contractId) =>
        this.withQueryContext((queryContext) => queryContractBytecode(queryContext, contractId)),
      mirrorClient: this.nativeClient,
    });
    this.files = createFilesNamespace({
      submit,
      queryFileInfo: queryInfo,
      queryFileContents: queryContents,
    });
    this.transactions = createTransactionsNamespace({
      submit,
      queryRecord,
      queryReceipt,
    });
    this.network = createNetworkNamespace({ client: this.nativeClient });
    this.reads = createReadsNamespace({ mirror: this.mirror });
    this.evm = {
      sendRaw: (params) => this.submit({ kind: "evm.ethereum", params }),
    };
    this.legacy = {
      liveHash: {
        get: (params) => {
          this.warnLegacyLiveHash();
          return this.withQueryContext((queryContext) => queryLiveHash(queryContext, params));
        },
        add: (params) => {
          this.warnLegacyLiveHash();
          return this.submit({ kind: "legacy.liveHash.add", params });
        },
        delete: (params) => {
          this.warnLegacyLiveHash();
          return this.submit({ kind: "legacy.liveHash.delete", params });
        },
      },
    };
    this.schedules = createSchedulesNamespace({
      submit,
      mirror: this.mirror,
      withSigner: (signer: HieroSigner) => ({
        submit: (descriptor) => this.with({ signer }).submit(descriptor),
      }),
    });
  }

  static forTestnet(): HieroClient {
    return new HieroClient({ network: "testnet" });
  }

  static forMainnet(): HieroClient {
    return new HieroClient({ network: "mainnet" });
  }

  static forPreviewnet(): HieroClient {
    return new HieroClient({ network: "previewnet" });
  }

  static validateConfig(config: ClientConfig = {}): Result<ClientRuntimeConfig> {
    return resolveConfig(config);
  }

  static fromEnv(options?: { readonly allowMissingSigner?: boolean }): HieroClient {
    const resolved = loadConfigFromEnv(options);
    if (!resolved.ok) {
      throw new Error(resolved.error.message);
    }
    return new HieroClient(resolved.value);
  }

  get networkName(): ClientRuntimeConfig["network"] {
    return this.config.network;
  }

  get operator(): string | undefined {
    return this.config.operator;
  }

  with(partial: {
    readonly signer?: HieroSigner;
    readonly operator?: string;
    readonly key?: string;
  }) {
    const operator = partial.operator ?? this.config.operator;
    const key = partial.key ?? this.config.key;
    const signer = partial.signer ?? this.config.signer;
    return new HieroClient({
      network: this.config.network,
      ...(operator ? { operator } : {}),
      ...(key ? { key } : {}),
      ...(signer ? { signer } : {}),
      ...(this.config.mirrorUrl ? { mirrorUrl: this.config.mirrorUrl } : {}),
      ...(this.config.maxFee ? { maxFee: this.config.maxFee } : {}),
      ...(this.config.maxAttempts !== undefined ? { maxAttempts: this.config.maxAttempts } : {}),
      ...(this.config.maxNodeAttempts !== undefined
        ? { maxNodeAttempts: this.config.maxNodeAttempts }
        : {}),
      ...(this.config.requestTimeoutMs !== undefined
        ? { requestTimeoutMs: this.config.requestTimeoutMs }
        : {}),
      ...(this.config.grpcDeadlineMs !== undefined
        ? { grpcDeadlineMs: this.config.grpcDeadlineMs }
        : {}),
      ...(this.config.minBackoffMs !== undefined ? { minBackoffMs: this.config.minBackoffMs } : {}),
      ...(this.config.maxBackoffMs !== undefined ? { maxBackoffMs: this.config.maxBackoffMs } : {}),
    });
  }

  setNetwork(network: import("@hieco/utils").NetworkType): HieroClient {
    return new HieroClient({
      ...this.config,
      network,
    });
  }

  setMirrorNetwork(mirrorNetwork: string | ReadonlyArray<string>): HieroClient {
    if (typeof mirrorNetwork === "string") {
      return new HieroClient({
        ...this.config,
        mirrorUrl: mirrorNetwork,
      });
    }
    const first = mirrorNetwork[0];
    if (!first) return this;
    return new HieroClient({
      ...this.config,
      mirrorUrl: first,
    });
  }

  updateNetwork(): Promise<Result<{ readonly updated: true }>> {
    const candidate: unknown = this.nativeClient;
    if (
      typeof candidate === "object" &&
      candidate !== null &&
      "updateNetwork" in candidate &&
      typeof candidate.updateNetwork === "function"
    ) {
      return Promise.resolve(candidate.updateNetwork()).then(() => ({
        ok: true as const,
        value: { updated: true as const },
      }));
    }
    return Promise.resolve({ ok: true, value: { updated: true } });
  }

  setOperator(operator: string, key: string): HieroClient {
    return new HieroClient({
      ...this.config,
      operator,
      key,
    });
  }

  setMaxAttempts(maxAttempts: number): HieroClient {
    return new HieroClient({
      ...this.config,
      maxAttempts,
    });
  }

  setMaxNodeAttempts(maxNodeAttempts: number): HieroClient {
    return new HieroClient({
      ...this.config,
      maxNodeAttempts,
    });
  }

  setRequestTimeout(requestTimeoutMs: number): HieroClient {
    return new HieroClient({
      ...this.config,
      requestTimeoutMs,
    });
  }

  setGrpcDeadline(grpcDeadlineMs: number): HieroClient {
    return new HieroClient({
      ...this.config,
      grpcDeadlineMs,
    });
  }

  setMinBackoff(minBackoffMs: number): HieroClient {
    return new HieroClient({
      ...this.config,
      minBackoffMs,
    });
  }

  setMaxBackoff(maxBackoffMs: number): HieroClient {
    return new HieroClient({
      ...this.config,
      maxBackoffMs,
    });
  }

  as(signer: HieroSigner) {
    return this.with({ signer });
  }

  submit(descriptor: TransactionDescriptor): Promise<Result<TransactionReceiptData>> {
    const context = this.resolveSubmitContext();
    if (!context.ok) return Promise.resolve(err(context.error));
    return submitTransaction(context.value, descriptor);
  }

  destroy(): void {
    this.nativeClient.close();
  }

  private resolveSubmitContext(): Result<{
    readonly client: Client;
    readonly signing: import("../transactions/api.ts").SigningContext;
    readonly operator?: string;
  }> {
    const signing = requireSigningContext({
      operatorKey: this.config.key,
      signer: this.config.signer,
    });
    if (!signing.ok) return signing;
    return {
      ok: true,
      value: {
        client: this.nativeClient,
        signing: signing.value,
        ...(this.config.operator ? { operator: this.config.operator } : {}),
      },
    };
  }

  private resolveQueryContext(): Result<{
    readonly client: Client;
    readonly signing: import("../transactions/api.ts").SigningContext;
    readonly operator?: string;
  }> {
    const signing = resolveSigningForQuery({
      operatorKey: this.config.key,
      signer: this.config.signer,
    });
    if (!signing.ok) return signing;
    return {
      ok: true,
      value: {
        client: this.nativeClient,
        signing: signing.value,
        ...(this.config.operator ? { operator: this.config.operator } : {}),
      },
    };
  }

  private withQueryContext<T>(
    run: (queryContext: {
      readonly client: Client;
      readonly signing: import("../transactions/api.ts").SigningContext;
      readonly operator?: string;
    }) => Promise<Result<T>>,
  ): Promise<Result<T>> {
    const queryContext = this.resolveQueryContext();
    if (!queryContext.ok) return Promise.resolve(err(queryContext.error));
    return run(queryContext.value);
  }

  private createNativeClient(config: ClientRuntimeConfig): Client {
    const client = Client.forName(config.network);
    if (config.mirrorUrl) {
      try {
        const url = config.mirrorUrl.includes("://")
          ? new URL(config.mirrorUrl)
          : new URL(`https://${config.mirrorUrl}`);
        const hostname = url.hostname;
        const port = url.port || (url.protocol === "http:" ? "80" : "443");
        if (hostname) client.setMirrorNetwork([`${hostname}:${port}`]);
      } catch {
        throw new Error(
          createError("CONFIG_INVALID_NETWORK", `Invalid mirror URL: ${config.mirrorUrl}`).message,
        );
      }
    }

    if (!config.signer && config.operator && config.key) {
      client.setOperator(config.operator, config.key);
    }

    if (config.maxFee) {
      client.setDefaultMaxTransactionFee(new Hbar(config.maxFee));
    }

    if (config.maxAttempts !== undefined) {
      client.setMaxAttempts(config.maxAttempts);
    }
    if (config.maxNodeAttempts !== undefined) {
      client.setMaxNodeAttempts(config.maxNodeAttempts);
    }
    if (config.requestTimeoutMs !== undefined) {
      client.setRequestTimeout(config.requestTimeoutMs);
    }
    if (config.grpcDeadlineMs !== undefined) {
      client.setGrpcDeadline(config.grpcDeadlineMs);
    }
    if (config.minBackoffMs !== undefined) {
      client.setMinBackoff(config.minBackoffMs);
    }
    if (config.maxBackoffMs !== undefined) {
      client.setMaxBackoff(config.maxBackoffMs);
    }

    return client;
  }

  private warnLegacyLiveHash(): void {
    if (this.legacyLiveHashWarned) return;
    this.legacyLiveHashWarned = true;
    console.warn(
      "[hieco-sdk] legacy.liveHash is deprecated upstream and may be unavailable on your network.",
    );
  }
}
