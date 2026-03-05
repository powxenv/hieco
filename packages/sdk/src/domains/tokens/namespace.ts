import type { EntityId } from "@hieco/utils";
import type { TransactionDescriptor } from "../../foundation/params.ts";
import type {
  MintReceipt,
  TokenNftInfoData,
  TokenInfoData,
  TokenReceipt,
  TransactionReceiptData,
} from "../../foundation/results-shapes.ts";
import type { Result } from "../../foundation/results.ts";

export interface TokensNamespace {
  create: ((
    params: import("../../foundation/params.ts").CreateTokenParams,
  ) => Promise<Result<TokenReceipt>>) & {
    tx: (params: import("../../foundation/params.ts").CreateTokenParams) => TransactionDescriptor;
  };
  mint: ((
    params: import("../../foundation/params.ts").MintTokenParams,
  ) => Promise<Result<MintReceipt>>) & {
    tx: (params: import("../../foundation/params.ts").MintTokenParams) => TransactionDescriptor;
  };
  burn: ((
    params: import("../../foundation/params.ts").BurnTokenParams,
  ) => Promise<Result<TransactionReceiptData>>) & {
    tx: (params: import("../../foundation/params.ts").BurnTokenParams) => TransactionDescriptor;
  };
  transfer: ((
    params: import("../../foundation/params.ts").TransferTokenParams,
  ) => Promise<Result<TransactionReceiptData>>) & {
    tx: (params: import("../../foundation/params.ts").TransferTokenParams) => TransactionDescriptor;
  };
  transferNft: ((
    params: import("../../foundation/params.ts").TransferNftParams,
  ) => Promise<Result<TransactionReceiptData>>) & {
    tx: (params: import("../../foundation/params.ts").TransferNftParams) => TransactionDescriptor;
  };
  associate: ((
    params: import("../../foundation/params.ts").AssociateTokenParams,
  ) => Promise<Result<TransactionReceiptData>>) & {
    tx: (
      params: import("../../foundation/params.ts").AssociateTokenParams,
    ) => TransactionDescriptor;
  };
  dissociate: ((
    params: import("../../foundation/params.ts").DissociateTokenParams,
  ) => Promise<Result<TransactionReceiptData>>) & {
    tx: (
      params: import("../../foundation/params.ts").DissociateTokenParams,
    ) => TransactionDescriptor;
  };
  freeze: ((
    params: import("../../foundation/params.ts").FreezeTokenParams,
  ) => Promise<Result<TransactionReceiptData>>) & {
    tx: (params: import("../../foundation/params.ts").FreezeTokenParams) => TransactionDescriptor;
  };
  unfreeze: ((
    params: import("../../foundation/params.ts").UnfreezeTokenParams,
  ) => Promise<Result<TransactionReceiptData>>) & {
    tx: (params: import("../../foundation/params.ts").UnfreezeTokenParams) => TransactionDescriptor;
  };
  grantKyc: ((
    params: import("../../foundation/params.ts").GrantKycParams,
  ) => Promise<Result<TransactionReceiptData>>) & {
    tx: (params: import("../../foundation/params.ts").GrantKycParams) => TransactionDescriptor;
  };
  revokeKyc: ((
    params: import("../../foundation/params.ts").RevokeKycParams,
  ) => Promise<Result<TransactionReceiptData>>) & {
    tx: (params: import("../../foundation/params.ts").RevokeKycParams) => TransactionDescriptor;
  };
  pause: ((
    params: import("../../foundation/params.ts").PauseTokenParams,
  ) => Promise<Result<TransactionReceiptData>>) & {
    tx: (params: import("../../foundation/params.ts").PauseTokenParams) => TransactionDescriptor;
  };
  unpause: ((
    params: import("../../foundation/params.ts").UnpauseTokenParams,
  ) => Promise<Result<TransactionReceiptData>>) & {
    tx: (params: import("../../foundation/params.ts").UnpauseTokenParams) => TransactionDescriptor;
  };
  wipe: ((
    params: import("../../foundation/params.ts").WipeTokenParams,
  ) => Promise<Result<TransactionReceiptData>>) & {
    tx: (params: import("../../foundation/params.ts").WipeTokenParams) => TransactionDescriptor;
  };
  delete: ((
    params: import("../../foundation/params.ts").DeleteTokenParams,
  ) => Promise<Result<TransactionReceiptData>>) & {
    tx: (params: import("../../foundation/params.ts").DeleteTokenParams) => TransactionDescriptor;
  };
  update: ((
    params: import("../../foundation/params.ts").UpdateTokenParams,
  ) => Promise<Result<TransactionReceiptData>>) & {
    tx: (params: import("../../foundation/params.ts").UpdateTokenParams) => TransactionDescriptor;
  };
  fees: ((
    params: import("../../foundation/params.ts").UpdateTokenFeeScheduleParams,
  ) => Promise<Result<TransactionReceiptData>>) & {
    tx: (
      params: import("../../foundation/params.ts").UpdateTokenFeeScheduleParams,
    ) => TransactionDescriptor;
  };
  info: (tokenId: EntityId) => Promise<Result<TokenInfoData>>;
  nftInfo: (
    nft: string | { readonly tokenId: EntityId; readonly serial: number },
  ) => Promise<Result<TokenNftInfoData>>;
}
