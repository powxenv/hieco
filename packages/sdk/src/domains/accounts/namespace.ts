import type { EntityId } from "@hieco/types";
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
