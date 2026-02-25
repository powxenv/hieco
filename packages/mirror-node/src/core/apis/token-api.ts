import type { ApiResult, PaginationParams, QueryOperator, Timestamp } from "../../types/rest-api";
import type { Nft, TokenDistribution, TokenInfo } from "../../types/entities/token";
import type { Transaction } from "../../types/entities/transaction";
import type { EntityId } from "../../types/rest-api";
import type { CursorPaginator, PaginatedResponse } from "../builders";
import { BaseApi } from "../base-api";

export interface TokenListParams extends PaginationParams {
  "account.id"?: EntityId | QueryOperator<EntityId>;
  "token.id"?: EntityId | QueryOperator<EntityId>;
  created_timestamp?: Timestamp | { from?: Timestamp; to?: Timestamp };
  name?: string;
  public_key?: string;
  type?: "FUNGIBLE_COMMON" | "NON_FUNGIBLE_UNIQUE";
}

export interface TokenBalancesParams extends PaginationParams {
  account?: EntityId;
  "account.balance"?: QueryOperator<number>;
  "account.publickey"?: string;
  timestamp?: Timestamp;
}

export interface TokenNftsParams extends PaginationParams {
  "account.id"?: EntityId;
  serial_number?: number;
}

export class TokenApi extends BaseApi {
  async getInfo(
    tokenId: EntityId,
    params?: { timestamp?: Timestamp },
  ): Promise<ApiResult<TokenInfo>> {
    const builder = this.createQueryBuilder();

    if (params?.timestamp) {
      builder.addTimestamp(params.timestamp);
    }

    return this.getSingle<TokenInfo>(`tokens/${tokenId}`, builder.build());
  }

  async getBalances(
    tokenId: EntityId,
    params?: TokenBalancesParams,
  ): Promise<ApiResult<TokenDistribution[]>> {
    const builder = this.createQueryBuilder();

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

  async getNfts(tokenId: EntityId, params?: TokenNftsParams): Promise<ApiResult<Nft[]>> {
    const builder = this.createQueryBuilder();

    if (params) {
      builder.addPagination(params);

      if (params["account.id"]) {
        builder.add("account.id", params["account.id"]);
      }
      if (params.serial_number !== undefined) {
        builder.add("serialNumber", params.serial_number);
      }
    }

    const result = await this.client.get<NftsResponse>(`tokens/${tokenId}/nfts`, builder.build());

    if (!result.success) {
      return { success: false, error: result.error };
    }
    return { success: true, data: result.data.nfts };
  }

  async getNft(tokenId: EntityId, serialNumber: number): Promise<ApiResult<Nft>> {
    return this.getSingle<Nft>(`tokens/${tokenId}/nfts/${serialNumber}`);
  }

  async getNftTransactions(
    tokenId: EntityId,
    serialNumber: number,
    params?: PaginationParams & { timestamp?: Timestamp },
  ): Promise<ApiResult<Transaction[]>> {
    const builder = this.createQueryBuilder();

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
    const builder = this.createQueryBuilder();

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

interface NftsResponse {
  nfts: Nft[];
  links: {
    next?: string;
  };
}
