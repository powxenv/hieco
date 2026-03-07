import type { TransactionDescriptor } from "../shared/params.ts";
import type {
  MintReceipt,
  TokenNftInfoData,
  TokenInfoData,
  TokenReceipt,
  TransactionReceiptData,
} from "../results/shapes.ts";
import type { Result } from "../results/result.ts";

export interface TokensNamespace {
  create: ((
    params: import("../shared/params.ts").CreateTokenParams,
  ) => Promise<Result<TokenReceipt>>) & {
    tx: (params: import("../shared/params.ts").CreateTokenParams) => TransactionDescriptor;
  };
  mint: ((
    params: import("../shared/params.ts").MintTokenParams,
  ) => Promise<Result<MintReceipt>>) & {
    tx: (params: import("../shared/params.ts").MintTokenParams) => TransactionDescriptor;
  };
  burn: ((
    params: import("../shared/params.ts").BurnTokenParams,
  ) => Promise<Result<TransactionReceiptData>>) & {
    tx: (params: import("../shared/params.ts").BurnTokenParams) => TransactionDescriptor;
  };
  transfer: ((
    params: import("../shared/params.ts").TransferTokenParams,
  ) => Promise<Result<TransactionReceiptData>>) & {
    tx: (params: import("../shared/params.ts").TransferTokenParams) => TransactionDescriptor;
  };
  transferNft: ((
    params: import("../shared/params.ts").TransferNftParams,
  ) => Promise<Result<TransactionReceiptData>>) & {
    tx: (params: import("../shared/params.ts").TransferNftParams) => TransactionDescriptor;
  };
  associate: ((
    params: import("../shared/params.ts").AssociateTokenParams,
  ) => Promise<Result<TransactionReceiptData>>) & {
    tx: (params: import("../shared/params.ts").AssociateTokenParams) => TransactionDescriptor;
  };
  dissociate: ((
    params: import("../shared/params.ts").DissociateTokenParams,
  ) => Promise<Result<TransactionReceiptData>>) & {
    tx: (params: import("../shared/params.ts").DissociateTokenParams) => TransactionDescriptor;
  };
  freeze: ((
    params: import("../shared/params.ts").FreezeTokenParams,
  ) => Promise<Result<TransactionReceiptData>>) & {
    tx: (params: import("../shared/params.ts").FreezeTokenParams) => TransactionDescriptor;
  };
  unfreeze: ((
    params: import("../shared/params.ts").UnfreezeTokenParams,
  ) => Promise<Result<TransactionReceiptData>>) & {
    tx: (params: import("../shared/params.ts").UnfreezeTokenParams) => TransactionDescriptor;
  };
  grantKyc: ((
    params: import("../shared/params.ts").GrantKycParams,
  ) => Promise<Result<TransactionReceiptData>>) & {
    tx: (params: import("../shared/params.ts").GrantKycParams) => TransactionDescriptor;
  };
  revokeKyc: ((
    params: import("../shared/params.ts").RevokeKycParams,
  ) => Promise<Result<TransactionReceiptData>>) & {
    tx: (params: import("../shared/params.ts").RevokeKycParams) => TransactionDescriptor;
  };
  pause: ((
    params: import("../shared/params.ts").PauseTokenParams,
  ) => Promise<Result<TransactionReceiptData>>) & {
    tx: (params: import("../shared/params.ts").PauseTokenParams) => TransactionDescriptor;
  };
  unpause: ((
    params: import("../shared/params.ts").UnpauseTokenParams,
  ) => Promise<Result<TransactionReceiptData>>) & {
    tx: (params: import("../shared/params.ts").UnpauseTokenParams) => TransactionDescriptor;
  };
  wipe: ((
    params: import("../shared/params.ts").WipeTokenParams,
  ) => Promise<Result<TransactionReceiptData>>) & {
    tx: (params: import("../shared/params.ts").WipeTokenParams) => TransactionDescriptor;
  };
  delete: ((
    params: import("../shared/params.ts").DeleteTokenParams,
  ) => Promise<Result<TransactionReceiptData>>) & {
    tx: (params: import("../shared/params.ts").DeleteTokenParams) => TransactionDescriptor;
  };
  update: ((
    params: import("../shared/params.ts").UpdateTokenParams,
  ) => Promise<Result<TransactionReceiptData>>) & {
    tx: (params: import("../shared/params.ts").UpdateTokenParams) => TransactionDescriptor;
  };
  fees: ((
    params: import("../shared/params.ts").UpdateTokenFeeScheduleParams,
  ) => Promise<Result<TransactionReceiptData>>) & {
    tx: (
      params: import("../shared/params.ts").UpdateTokenFeeScheduleParams,
    ) => TransactionDescriptor;
  };
  info: (tokenId: string) => Promise<Result<TokenInfoData>>;
  nftInfo: (
    nft: string | { readonly tokenId: string; readonly serial: number },
  ) => Promise<Result<TokenNftInfoData>>;
  allowancesList: (
    accountId: string,
    params?: import("../shared/params.ts").TokenAllowancesQueryParams,
  ) => Promise<
    Result<{
      readonly allowances: ReadonlyArray<import("@hieco/mirror").TokenAllowance>;
    }>
  >;
}
