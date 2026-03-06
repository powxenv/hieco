import type { EntityId } from "@hieco/utils";
import type { TransactionDescriptor } from "../../foundation/params.ts";
import type { Result } from "../../foundation/results.ts";
import type {
  AccountInfoData,
  AccountRecordsData,
  CreateAccountResult,
  DeleteAccountResult,
  TransactionReceiptData,
  TransferResult,
  UpdateAccountResult,
} from "../../foundation/results-shapes.ts";

export interface AccountsNamespace {
  transfer: ((
    params: import("../../foundation/params.ts").TransferParams,
  ) => Promise<Result<TransferResult>>) & {
    tx: (params: import("../../foundation/params.ts").TransferParams) => TransactionDescriptor;
  };
  create: ((
    params: import("../../foundation/params.ts").CreateAccountParams,
  ) => Promise<Result<CreateAccountResult>>) & {
    tx: (params: import("../../foundation/params.ts").CreateAccountParams) => TransactionDescriptor;
  };
  update: ((
    params: import("../../foundation/params.ts").UpdateAccountParams,
  ) => Promise<Result<UpdateAccountResult>>) & {
    tx: (params: import("../../foundation/params.ts").UpdateAccountParams) => TransactionDescriptor;
  };
  delete: ((
    params: import("../../foundation/params.ts").DeleteAccountParams,
  ) => Promise<Result<DeleteAccountResult>>) & {
    tx: (params: import("../../foundation/params.ts").DeleteAccountParams) => TransactionDescriptor;
  };
  allowances: ((
    params: import("../../foundation/params.ts").ApproveAllowanceParams,
  ) => Promise<Result<TransactionReceiptData>>) & {
    tx: (
      params: import("../../foundation/params.ts").ApproveAllowanceParams,
    ) => TransactionDescriptor;
  };
  allowancesAdjust: ((
    params: import("../../foundation/params.ts").AdjustAllowanceParams,
  ) => Promise<Result<TransactionReceiptData>>) & {
    tx: (
      params: import("../../foundation/params.ts").AdjustAllowanceParams,
    ) => TransactionDescriptor;
  };
  allowancesDeleteNft: ((
    params: import("../../foundation/params.ts").DeleteNftAllowancesParams,
  ) => Promise<Result<TransactionReceiptData>>) & {
    tx: (
      params: import("../../foundation/params.ts").DeleteNftAllowancesParams,
    ) => TransactionDescriptor;
  };
  allowancesList: (accountId: EntityId) => Promise<
    Result<{
      readonly hbar: ReadonlyArray<import("@hieco/mirror").CryptoAllowance>;
      readonly tokens: ReadonlyArray<import("@hieco/mirror").TokenAllowance>;
      readonly nfts: ReadonlyArray<import("@hieco/mirror").NftAllowance>;
    }>
  >;
  allowancesEnsure: (params: {
    readonly hbar?: ReadonlyArray<import("../../foundation/params.ts").HbarAllowanceParams>;
    readonly tokens?: ReadonlyArray<import("../../foundation/params.ts").TokenAllowanceParams>;
    readonly nfts?: ReadonlyArray<import("../../foundation/params.ts").NftAllowanceParams>;
    readonly memo?: string;
    readonly maxFee?: import("../../foundation/params.ts").Amount;
  }) => Promise<
    Result<
      | {
          readonly status: "skipped";
          readonly reason: "already-approved";
        }
      | {
          readonly status: "submitted";
          readonly receipt: TransactionReceiptData;
        }
    >
  >;
  balance: (accountId?: EntityId) => Promise<
    Result<{
      readonly hbar: string;
      readonly tokens: ReadonlyArray<{
        readonly tokenId: string;
        readonly balance: string;
        readonly decimals: number;
      }>;
    }>
  >;
  info: (accountId: EntityId) => Promise<Result<AccountInfoData>>;
  records: (accountId?: EntityId) => Promise<Result<AccountRecordsData>>;
}
