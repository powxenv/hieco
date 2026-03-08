import type {
  ApiResult,
  Key,
  PaginationParams,
  QueryOperator,
  TimestampFilter,
} from "@hieco/utils";
import type { Transaction } from "./transactions";
import { QueryBuilder, type CursorPaginator, type PaginatedResponse } from "./shared/builders";
import { BaseApi } from "./shared/base";

export interface TokenListParams extends PaginationParams {
  "account.id"?: string | QueryOperator<string>;
  "token.id"?: string | QueryOperator<string>;
  created_timestamp?: TimestampFilter;
  name?: string;
  public_key?: string;
  type?: "FUNGIBLE_COMMON" | "NON_FUNGIBLE_UNIQUE";
}

export interface TokenBalancesParams extends PaginationParams {
  account?: string;
  "account.balance"?: QueryOperator<number>;
  "account.publickey"?: string;
  timestamp?: string;
}

export interface TokenNftsParams extends PaginationParams {
  "account.id"?: string;
  serial_number?: number;
}

export class TokenApi extends BaseApi {
  async getInfo(tokenId: string, params?: { timestamp?: string }): Promise<ApiResult<TokenInfo>> {
    const builder = new QueryBuilder();

    if (params?.timestamp) {
      builder.addTimestamp(params.timestamp);
    }

    return this.getSingle<TokenInfo>(`tokens/${tokenId}`, builder.build());
  }

  async getBalances(
    tokenId: string,
    params?: TokenBalancesParams,
  ): Promise<ApiResult<TokenDistribution[]>> {
    const builder = new QueryBuilder();

    if (params) {
      builder.addPagination(params);

      if (params.account) {
        builder.add("account.id", params.account);
      }
      if (params["account.balance"]) {
        builder.add("account.balance", params["account.balance"]);
      }
      if (params["account.publickey"]) {
        builder.add("account.publickey", params["account.publickey"]);
      }
      if (params.timestamp) {
        builder.addTimestamp(params.timestamp);
      }
    }

    return this.getList<TokenDistribution>(`tokens/${tokenId}/balances`, builder.build());
  }

  async getBalancesSnapshot(
    tokenId: string,
    params?: TokenBalancesParams,
  ): Promise<ApiResult<TokenBalancesResponse>> {
    const builder = new QueryBuilder();

    if (params) {
      builder.addPagination(params);

      if (params.account) {
        builder.add("account.id", params.account);
      }
      if (params["account.balance"]) {
        builder.add("account.balance", params["account.balance"]);
      }
      if (params["account.publickey"]) {
        builder.add("account.publickey", params["account.publickey"]);
      }
      if (params.timestamp) {
        builder.addTimestamp(params.timestamp);
      }
    }

    return this.getSingle<TokenBalancesResponse>(`tokens/${tokenId}/balances`, builder.build());
  }

  async getNfts(
    tokenId: string,
    params?: TokenNftsParams,
  ): Promise<ApiResult<PaginatedResponse<Nft>>> {
    const builder = new QueryBuilder();

    if (params) {
      builder.addPagination(params);

      if (params["account.id"]) {
        builder.add("account.id", params["account.id"]);
      }
      if (params.serial_number !== undefined) {
        builder.add("serialNumber", params.serial_number);
      }
    }

    return this.getSinglePage<Nft>(`tokens/${tokenId}/nfts`, builder.build());
  }

  async getNft(tokenId: string, serialNumber: number): Promise<ApiResult<Nft>> {
    return this.getSingle<Nft>(`tokens/${tokenId}/nfts/${serialNumber}`);
  }

  async getNftTransactions(
    tokenId: string,
    serialNumber: number,
    params?: PaginationParams & { timestamp?: string },
  ): Promise<ApiResult<Transaction[]>> {
    const builder = new QueryBuilder();

    if (params) {
      builder.addPagination(params);
      if (params.timestamp) {
        builder.addTimestamp(params.timestamp);
      }
    }

    return this.getList<Transaction>(
      `tokens/${tokenId}/nfts/${serialNumber}/transactions`,
      builder.build(),
    );
  }

  private buildTokenListParams(params?: TokenListParams): Record<string, string> {
    const builder = new QueryBuilder();

    if (params) {
      builder.addPagination(params);

      if (params["account.id"]) {
        builder.add("account.id", params["account.id"]);
      }
      if (params["token.id"]) {
        builder.add("token.id", params["token.id"]);
      }
      if (params.created_timestamp) {
        builder.addTimestamp(params.created_timestamp);
      }
      if (params.name) {
        builder.add("name", params.name);
      }
      if (params.public_key) {
        builder.add("publickey", params.public_key);
      }
      if (params.type) {
        builder.add("type", params.type);
      }
    }

    return builder.build();
  }

  async listPaginated(params?: TokenListParams): Promise<ApiResult<TokenInfo[]>> {
    return this.getAllPaginated<TokenInfo>("tokens", this.buildTokenListParams(params));
  }

  async listPaginatedPage(
    params?: TokenListParams,
  ): Promise<ApiResult<PaginatedResponse<TokenInfo>>> {
    return this.getSinglePage<TokenInfo>("tokens", this.buildTokenListParams(params));
  }

  async listPaginatedPageByUrl(url: string): Promise<ApiResult<PaginatedResponse<TokenInfo>>> {
    return this.getSinglePageByUrl<TokenInfo>(url);
  }

  createTokenPaginator(params?: TokenListParams): CursorPaginator<TokenInfo> {
    return super.createPaginator<TokenInfo>("tokens", this.buildTokenListParams(params));
  }
}

export interface TokenInfo {
  readonly admin_key: Key | null;
  readonly auto_renew_account: string | null;
  readonly auto_renew_period: number | null;
  readonly created_timestamp: string;
  readonly decimals: number;
  readonly deleted: boolean;
  readonly expiry_timestamp: string | null;
  readonly fee_schedule_key: Key | null;
  readonly freeze_default: boolean;
  readonly freeze_key: Key | null;
  readonly kyc_key: Key | null;
  readonly supply_key: Key | null;
  readonly wipe_key: Key | null;
  readonly pause_key: Key | null;
  readonly metadata_key: Key | null;
  readonly max_supply: number | null;
  readonly modified_timestamp: string;
  readonly name: string;
  readonly memo: string;
  readonly pause_status: string;
  readonly symbol: string;
  readonly supply_type: "FINITE" | "INFINITE";
  readonly token_id: string;
  readonly total_supply: number;
  readonly treasury_account_id: string;
  readonly type: "FUNGIBLE_COMMON" | "NON_FUNGIBLE_UNIQUE";
  readonly custom_fees: CustomFees;
  readonly ipfs_hash?: string;
  readonly metadata?: string;
}

export interface CustomFees {
  readonly created_timestamp: string;
  readonly fixed_fees?: readonly FixedFee[];
  readonly fractional_fees?: readonly FractionalFee[];
  readonly royalty_fees?: readonly RoyaltyFee[];
}

export interface FixedFee {
  readonly all_collectors_are_exempt: boolean;
  readonly amount: number;
  readonly collector_account_id: string;
  readonly denominating_token_id?: string;
}

export interface FractionalFee {
  readonly all_collectors_are_exempt: boolean;
  readonly amount: {
    readonly numerator: number;
    readonly denominator: number;
  };
  readonly collector_account_id: string;
  readonly denominating_token_id?: string;
  readonly maximum?: number;
  readonly minimum?: number;
  readonly net_of_transfers?: boolean;
}

export interface RoyaltyFee {
  readonly all_collectors_are_exempt: boolean;
  readonly amount: {
    readonly numerator: number;
    readonly denominator: number;
  };
  readonly collector_account_id: string;
  readonly fallback_fee?: {
    readonly amount: number;
    readonly denominating_token_id: string;
  };
}

export interface TokenDistribution {
  readonly account: string;
  readonly balance: number;
  readonly decimals: number;
}

export interface TokenBalancesResponse {
  readonly timestamp: string | null;
  readonly balances: readonly TokenDistribution[];
  readonly links: {
    readonly next?: string;
  };
}

export interface Nft {
  readonly account: string;
  readonly created_timestamp: string;
  readonly delegated_account_id?: string;
  readonly deleted: boolean;
  readonly ipfs_hash?: string;
  readonly metadata?: string;
  readonly modified_timestamp: string;
  readonly serial_number: number;
  readonly token_id: string;
  readonly spender?: string;
  readonly symbol?: string;
  readonly name?: string;
  readonly treasury?: boolean;
}
