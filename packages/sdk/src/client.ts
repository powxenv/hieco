import { Client, Hbar } from "@hiero-ledger/sdk";
import type { Signer as HieroSigner } from "@hiero-ledger/sdk";
import type { EntityId } from "@hieco/types";
import { createMirrorNodeClient, type MirrorNodeClient } from "@hieco/mirror";
import type { ClientConfig } from "./types/params.ts";
import type { ClientRuntimeConfig } from "./types/client.ts";
import type { TransactionDescriptor } from "./types/params.ts";
import type { Result } from "./types/results.ts";
import { err } from "./types/results.ts";
import { resolveConfig } from "./config.ts";
import { createAccountsNamespace } from "./accounts.ts";
import { createTokensNamespace } from "./tokens.ts";
import { createHcsNamespace } from "./hcs.ts";
import { createContractsNamespace } from "./contracts.ts";
import { createFilesNamespace } from "./files.ts";
import { createSchedulesNamespace } from "./schedules.ts";
import {
  callContract,
  requireSigningContext,
  resolveQueryContext,
  submitTransaction,
} from "./transactions.ts";
import { createError } from "./errors.ts";
import type { TransactionReceiptData } from "./types/results-shapes.ts";

export class HieroClient {
  readonly mirror: MirrorNodeClient;
  readonly accounts: ReturnType<typeof createAccountsNamespace>;
  readonly tokens: ReturnType<typeof createTokensNamespace>;
  readonly hcs: ReturnType<typeof createHcsNamespace>;
  readonly contracts: ReturnType<typeof createContractsNamespace>;
  readonly files: ReturnType<typeof createFilesNamespace>;
  readonly schedules: ReturnType<typeof createSchedulesNamespace>;

  private readonly nativeClient: Client;
  private readonly config: ClientRuntimeConfig;

  constructor(config: ClientConfig = {}) {
    const resolved = resolveConfig(config);
    if (!resolved.ok) {
      throw new Error(resolved.error.message);
    }
    this.config = resolved.value;
    this.nativeClient = this.createNativeClient(this.config);
    this.mirror = createMirrorNodeClient(this.config.network, this.config.mirrorUrl);

    const submit = async (
      descriptor: TransactionDescriptor,
    ): Promise<Result<TransactionReceiptData>> => {
      const signing = requireSigningContext({
        operatorKey: this.config.key,
        signer: this.config.signer,
      });
      if (!signing.ok) return signing;
      return submitTransaction(
        {
          client: this.nativeClient,
          signing: signing.value,
          ...(this.config.operator ? { operator: this.config.operator } : {}),
        },
        descriptor,
      );
    };

    const call = (params: {
      readonly id: EntityId;
      readonly fn: string;
      readonly args?: ReadonlyArray<unknown>;
      readonly gas: number;
      readonly senderAccountId?: EntityId;
    }) => {
      const signing = resolveQueryContext({
        operatorKey: this.config.key,
        signer: this.config.signer,
      });
      if (!signing.ok) return Promise.resolve(err(signing.error));
      const queryContext = {
        client: this.nativeClient,
        signing: signing.value,
        ...(this.config.operator ? { operator: this.config.operator } : {}),
      };
      return callContract(queryContext, params);
    };

    this.accounts = createAccountsNamespace({
      submit,
      ...(this.config.operator ? { operator: this.config.operator } : {}),
      ...(this.config.signer ? { signer: this.config.signer } : {}),
      mirror: this.mirror,
      nativeClient: this.nativeClient,
    });
    this.tokens = createTokensNamespace({
      submit,
      ...(this.config.operator ? { operator: this.config.operator } : {}),
      ...(this.config.signer ? { signer: this.config.signer } : {}),
    });
    this.hcs = createHcsNamespace({ submit, nativeClient: this.nativeClient });
    this.contracts = createContractsNamespace({ submit, call });
    this.files = createFilesNamespace({ submit });
    this.schedules = createSchedulesNamespace({
      submit,
      mirror: this.mirror,
      withSigner: (signer: HieroSigner) => ({
        submit: (descriptor) => this.with({ signer }).submit(descriptor),
      }),
    });
  }

  get network(): ClientRuntimeConfig["network"] {
    return this.config.network;
  }

  get operator(): EntityId | undefined {
    return this.config.operator;
  }

  with(partial: {
    readonly signer?: HieroSigner;
    readonly operator?: EntityId;
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
    });
  }

  as(signer: HieroSigner) {
    return this.with({ signer });
  }

  submit(descriptor: TransactionDescriptor): Promise<Result<TransactionReceiptData>> {
    const signing = requireSigningContext({
      operatorKey: this.config.key,
      signer: this.config.signer,
    });
    if (!signing.ok) return Promise.resolve(err(signing.error));
    return submitTransaction(
      {
        client: this.nativeClient,
        signing: signing.value,
        ...(this.config.operator ? { operator: this.config.operator } : {}),
      },
      descriptor,
    );
  }

  destroy(): void {
    this.nativeClient.close();
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

    return client;
  }
}
