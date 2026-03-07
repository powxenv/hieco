import type { TokenInfo } from "@hieco/mirror";
import type { TokenNftInfo } from "@hiero-ledger/sdk";
import type { TransactionReceiptData } from "../results/transaction.ts";

export interface TokenReceipt {
  readonly receipt: TransactionReceiptData;
  readonly transactionId: string;
  readonly tokenId: string;
}

export interface MintReceipt {
  readonly receipt: TransactionReceiptData;
  readonly transactionId: string;
  readonly totalSupply: string;
  readonly serialNumbers?: ReadonlyArray<number>;
}

export interface TokenInfoData {
  readonly tokenId: string;
  readonly token: TokenInfo;
}

export interface TokenNftInfoData {
  readonly nftId: string;
  readonly nfts: ReadonlyArray<TokenNftInfo>;
}
