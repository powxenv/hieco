import type { Signer as HieroSigner } from "@hiero-ledger/sdk";
import type { EntityId } from "@hieco/utils";
import type { AccountsNamespace } from "../domains/accounts/namespace.ts";
import type { TokensNamespace } from "../domains/tokens/namespace.ts";
import type { HcsNamespace } from "../domains/hcs/namespace.ts";
import type { ContractsNamespace } from "../domains/contracts/namespace.ts";
import type { FilesNamespace } from "../domains/files/namespace.ts";
import type { SchedulesNamespace } from "../domains/schedules/namespace.ts";
import type { TransactionsNamespace } from "../domains/transactions/namespace.ts";
import type { NetworkNamespace } from "../domains/network/namespace.ts";
import type { ReadsNamespace } from "../domains/reads/namespace.ts";
import type { ClientConfig, TransactionDescriptor } from "../foundation/params.ts";
import type {
  TransferResult,
  CreateAccountResult,
  UpdateAccountResult,
  DeleteAccountResult,
  TransactionReceiptData,
  TokenReceipt,
  MintReceipt,
  TopicReceipt,
  MessageReceipt,
  ContractReceipt,
  ContractExecuteReceipt,
  FileReceipt,
  FileChunkedReceipt,
  ScheduleReceipt,
  TransactionRecordData,
  TransactionReceiptQueryData,
} from "../foundation/results-shapes.ts";
import type { Result } from "../foundation/results.ts";

export interface CapabilityReport {
  readonly ledger: {
    readonly coveredTransactions: ReadonlyArray<string>;
    readonly thinTransactions: ReadonlyArray<string>;
    readonly magicalTransactions: ReadonlyArray<string>;
    readonly coveredQueries: ReadonlyArray<string>;
    readonly coveredIds: ReadonlyArray<string>;
    readonly coveredUtilityTypes: ReadonlyArray<string>;
  };
  readonly compatibility: {
    readonly legacySurfaceRetired: true;
    readonly oneLineFlows: ReadonlyArray<string>;
    readonly preservedUseCases: ReadonlyArray<string>;
    readonly newlyExposedPower: ReadonlyArray<string>;
  };
}

export interface TelepathicClient {
  readonly audit: CapabilityReport;
  readonly tx: {
    readonly submit: (descriptor: TransactionDescriptor) => Promise<Result<TransactionReceiptData>>;
    readonly record: (
      transactionId: string | { readonly transactionId: string },
    ) => Promise<Result<TransactionRecordData>>;
    readonly receipt: (
      transactionId: string | { readonly transactionId: string },
      options?: {
        readonly includeChildren?: boolean;
        readonly includeDuplicates?: boolean;
        readonly validateStatus?: boolean;
      },
    ) => Promise<Result<TransactionReceiptQueryData>>;
  };
  readonly account: Record<string, any>;
  readonly token: Record<string, any>;
  readonly topic: Record<string, any>;
  readonly contract: Record<string, any>;
  readonly file: Record<string, any>;
  readonly schedule: Record<string, any>;
  readonly node: Record<string, any>;
  readonly system: Record<string, any>;
  readonly util: Record<string, any>;
  readonly batch: Record<string, any>;
  readonly net: Record<string, any>;
  readonly accounts: AccountsNamespace;
  readonly tokens: TokensNamespace;
  readonly hcs: HcsNamespace;
  readonly contracts: ContractsNamespace;
  readonly files: FilesNamespace;
  readonly schedules: SchedulesNamespace;
  readonly transactions: TransactionsNamespace;
  readonly network: NetworkNamespace;
  readonly reads: ReadsNamespace;
  readonly mirror: import("@hieco/mirror").MirrorNodeClient;
  readonly networkName: "mainnet" | "testnet" | "previewnet";
  readonly operator: EntityId | undefined;
  readonly as: (signer: HieroSigner) => TelepathicClient;
  readonly with: (input: {
    readonly signer?: HieroSigner;
    readonly operator?: EntityId;
    readonly key?: string;
  }) => TelepathicClient;
  readonly submit: (descriptor: TransactionDescriptor) => Promise<Result<TransactionReceiptData>>;
  readonly destroy: () => void;
}

export type { ClientConfig };
export type {
  Result,
  TransferResult,
  CreateAccountResult,
  UpdateAccountResult,
  DeleteAccountResult,
  TransactionReceiptData,
  TokenReceipt,
  MintReceipt,
  TopicReceipt,
  MessageReceipt,
  ContractReceipt,
  ContractExecuteReceipt,
  FileReceipt,
  FileChunkedReceipt,
  ScheduleReceipt,
};
