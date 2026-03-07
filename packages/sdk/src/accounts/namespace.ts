import type { TransactionDescriptor } from "../shared/params.ts";
import type { Result } from "../results/result.ts";
import type {
  AccountInfoData,
  AccountRecordsData,
  CreateAccountResult,
  DeleteAccountResult,
  TransactionReceiptData,
  TransferResult,
  UpdateAccountResult,
} from "../results/shapes.ts";

export interface AccountsNamespace {
  transfer: ((
    params: import("../shared/params.ts").TransferParams,
  ) => Promise<Result<TransferResult>>) & {
    tx: (params: import("../shared/params.ts").TransferParams) => TransactionDescriptor;
  };
  create: ((
    params: import("../shared/params.ts").CreateAccountParams,
  ) => Promise<Result<CreateAccountResult>>) & {
    tx: (params: import("../shared/params.ts").CreateAccountParams) => TransactionDescriptor;
  };
  update: ((
    params: import("../shared/params.ts").UpdateAccountParams,
  ) => Promise<Result<UpdateAccountResult>>) & {
    tx: (params: import("../shared/params.ts").UpdateAccountParams) => TransactionDescriptor;
  };
  delete: ((
    params: import("../shared/params.ts").DeleteAccountParams,
  ) => Promise<Result<DeleteAccountResult>>) & {
    tx: (params: import("../shared/params.ts").DeleteAccountParams) => TransactionDescriptor;
  };
  allowances: ((
    params: import("../shared/params.ts").ApproveAllowanceParams,
  ) => Promise<Result<TransactionReceiptData>>) & {
    tx: (params: import("../shared/params.ts").ApproveAllowanceParams) => TransactionDescriptor;
  };
  allowancesAdjust: ((
    params: import("../shared/params.ts").AdjustAllowanceParams,
  ) => Promise<Result<TransactionReceiptData>>) & {
    tx: (params: import("../shared/params.ts").AdjustAllowanceParams) => TransactionDescriptor;
  };
  allowancesDeleteNft: ((
    params: import("../shared/params.ts").DeleteNftAllowancesParams,
  ) => Promise<Result<TransactionReceiptData>>) & {
    tx: (params: import("../shared/params.ts").DeleteNftAllowancesParams) => TransactionDescriptor;
  };
  allowancesList: (accountId: string) => Promise<
    Result<{
      readonly hbar: ReadonlyArray<import("@hieco/mirror").CryptoAllowance>;
      readonly tokens: ReadonlyArray<import("@hieco/mirror").TokenAllowance>;
      readonly nfts: ReadonlyArray<import("@hieco/mirror").NftAllowance>;
    }>
  >;
  allowancesEnsure: (params: {
    readonly hbar?: ReadonlyArray<import("../shared/params.ts").HbarAllowanceParams>;
    readonly tokens?: ReadonlyArray<import("../shared/params.ts").TokenAllowanceParams>;
    readonly nfts?: ReadonlyArray<import("../shared/params.ts").NftAllowanceParams>;
    readonly memo?: string;
    readonly maxFee?: import("../shared/params.ts").Amount;
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
  balance: (accountId?: string) => Promise<
    Result<{
      readonly hbar: string;
      readonly tokens: ReadonlyArray<{
        readonly tokenId: string;
        readonly balance: string;
        readonly decimals: number;
      }>;
    }>
  >;
  info: (accountId: string) => Promise<Result<AccountInfoData>>;
  records: (accountId?: string) => Promise<Result<AccountRecordsData>>;
}
