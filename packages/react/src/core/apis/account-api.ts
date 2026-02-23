import type { ApiResult, PaginationParams, QueryOperator, Timestamp } from "../../types/rest-api";
import type {
  Balance,
  AccountInfo,
  CryptoAllowance,
  NftAllowance,
  StakingReward,
  TokenRelationship,
  TokenAllowance,
  TokenAirdropsResponse,
} from "../../types/entities/account";
import type { EntityId } from "../../types/rest-api";
import type { CursorPaginator } from "../builders";
import { BaseApi } from "../base-api";

export interface AccountListParams extends PaginationParams {
  readonly account?: EntityId | QueryOperator<EntityId>;
  readonly alias?: string;
  readonly balance?: QueryOperator<number>;
  readonly balance_gte?: number;
  readonly balance_lte?: number;
  readonly created_timestamp?: Timestamp | { readonly from?: Timestamp; readonly to?: Timestamp };
  readonly evm_address?: string;
  readonly key?: string;
  readonly memo?: string;
  readonly public_key?: string;
  readonly smart_contract?: boolean;
  readonly staked_account_id?: EntityId;
  readonly staked_node_id?: number;
}

export interface AccountNftsParams extends PaginationParams {
  readonly "spender.id"?: EntityId;
  readonly "token.id"?: EntityId;
  readonly serial_number?: number;
}

export interface AccountTokenAllowancesParams extends PaginationParams {
  readonly "spender.id"?: EntityId;
  readonly "token.id"?: EntityId;
}

export interface AccountNftAllowancesParams extends PaginationParams {
  readonly "account.id"?: EntityId;
  readonly owner?: boolean;
  readonly "token.id"?: EntityId;
}

export class AccountApi extends BaseApi {
  async getInfo(
    accountId: EntityId,
    params?: { readonly timestamp?: Timestamp; readonly transactions?: boolean },
  ): Promise<ApiResult<AccountInfo>> {
    const builder = this.createQueryBuilder();

    if (params) {
      if (params.timestamp) {
        builder.addTimestamp(params.timestamp);
      }
      if (params.transactions !== undefined) {
        builder.add("transactions", params.transactions);
      }
    }

    return this.getSingle<AccountInfo>(`accounts/${accountId}`, builder.build());
  }

  async getBalances(accountId: EntityId): Promise<ApiResult<Balance>> {
    return this.getSingle<Balance>(`accounts/${accountId}/balances`);
  }

  async getTokens(
    accountId: EntityId,
    params?: PaginationParams & { "token.id"?: EntityId },
  ): Promise<ApiResult<TokenRelationship[]>> {
    const builder = this.createQueryBuilder();

    if (params) {
      builder.addPagination(params);
      if (params["token.id"]) {
        builder.add("token.id", params["token.id"]);
      }
    }

    return this.getList<TokenRelationship>(`accounts/${accountId}/tokens`, builder.build());
  }

  async getNfts(
    accountId: EntityId,
    params?: AccountNftsParams,
  ): Promise<ApiResult<TokenRelationship[]>> {
    const builder = this.createQueryBuilder();

    if (params) {
      builder.addPagination(params);
      if (params["spender.id"]) {
        builder.add("spender.id", params["spender.id"]);
      }
      if (params["token.id"]) {
        builder.add("token.id", params["token.id"]);
      }
      if (params.serial_number !== undefined) {
        builder.add("serialNumber", params.serial_number);
      }
    }

    return this.getList<TokenRelationship>(`accounts/${accountId}/nfts`, builder.build());
  }

  async getStakingRewards(
    accountId: EntityId,
    params?: PaginationParams & { timestamp?: Timestamp },
  ): Promise<ApiResult<StakingReward[]>> {
    const builder = this.createQueryBuilder();

    if (params) {
      builder.addPagination(params);
      if (params.timestamp) {
        builder.addTimestamp(params.timestamp);
      }
    }

    return this.getList<StakingReward>(`accounts/${accountId}/rewards`, builder.build());
  }

  async getCryptoAllowances(
    accountId: EntityId,
    params?: PaginationParams & { "spender.id"?: EntityId },
  ): Promise<ApiResult<CryptoAllowance[]>> {
    const builder = this.createQueryBuilder();

    if (params) {
      builder.addPagination(params);
      if (params["spender.id"]) {
        builder.add("spender.id", params["spender.id"]);
      }
    }

    return this.getList<CryptoAllowance>(
      `accounts/${accountId}/allowances/crypto`,
      builder.build(),
    );
  }

  async getTokenAllowances(
    accountId: EntityId,
    params?: AccountTokenAllowancesParams,
  ): Promise<ApiResult<TokenAllowance[]>> {
    const builder = this.createQueryBuilder();

    if (params) {
      builder.addPagination(params);
      if (params["spender.id"]) {
        builder.add("spender.id", params["spender.id"]);
      }
      if (params["token.id"]) {
        builder.add("token.id", params["token.id"]);
      }
    }

    return this.getList<TokenAllowance>(`accounts/${accountId}/allowances/token`, builder.build());
  }

  async getNftAllowances(
    accountId: EntityId,
    params?: AccountNftAllowancesParams,
  ): Promise<ApiResult<NftAllowance[]>> {
    const builder = this.createQueryBuilder();

    if (params) {
      builder.addPagination(params);
      if (params["account.id"]) {
        builder.add("account.id", params["account.id"]);
      }
      if (params.owner !== undefined) {
        builder.add("owner", params.owner);
      }
      if (params["token.id"]) {
        builder.add("token.id", params["token.id"]);
      }
    }

    return this.getList<NftAllowance>(`accounts/${accountId}/allowances/nft`, builder.build());
  }

  async getOutstandingAirdrops(
    accountId: EntityId,
    params?: {
      limit?: number;
      order?: "asc" | "desc";
      "receiver.id"?: EntityId;
      serial_number?: number;
      "token.id"?: EntityId;
    },
  ): Promise<ApiResult<TokenAirdropsResponse>> {
    const builder = this.createQueryBuilder();

    if (params) {
      builder.addPagination(params);
      if (params["receiver.id"]) {
        builder.add("receiver.id", params["receiver.id"]);
      }
      if (params.serial_number !== undefined) {
        builder.add("serialNumber", params.serial_number);
      }
      if (params["token.id"]) {
        builder.add("token.id", params["token.id"]);
      }
    }

    return this.getSingle<TokenAirdropsResponse>(
      `accounts/${accountId}/airdrops/outstanding`,
      builder.build(),
    );
  }

  async getPendingAirdrops(
    accountId: EntityId,
    params?: {
      limit?: number;
      order?: "asc" | "desc";
      "sender.id"?: EntityId;
      serial_number?: number;
      "token.id"?: EntityId;
    },
  ): Promise<ApiResult<TokenAirdropsResponse>> {
    const builder = this.createQueryBuilder();

    if (params) {
      builder.addPagination(params);
      if (params["sender.id"]) {
        builder.add("sender.id", params["sender.id"]);
      }
      if (params.serial_number !== undefined) {
        builder.add("serialNumber", params.serial_number);
      }
      if (params["token.id"]) {
        builder.add("token.id", params["token.id"]);
      }
    }

    return this.getSingle<TokenAirdropsResponse>(
      `accounts/${accountId}/airdrops/pending`,
      builder.build(),
    );
  }

  private buildAccountListParams(params?: AccountListParams): Record<string, string> {
    const builder = this.createQueryBuilder();

    if (params) {
      builder.addPagination(params);

      if (params.account) {
        builder.add("account", params.account);
      }
      if (params.alias) {
        builder.add("alias", params.alias);
      }
      if (params.balance) {
        builder.add("balance", params.balance);
      }
      if (params.balance_gte !== undefined) {
        builder.add("balance", `gte:${params.balance_gte}`);
      }
      if (params.balance_lte !== undefined) {
        builder.add("balance", `lte:${params.balance_lte}`);
      }
      if (params.created_timestamp) {
        builder.addTimestamp(params.created_timestamp);
      }
      if (params.evm_address) {
        builder.add("evmaddress", params.evm_address);
      }
      if (params.key) {
        builder.add("publickey", params.key);
      }
      if (params.memo) {
        builder.add("memo", params.memo);
      }
      if (params.smart_contract !== undefined) {
        builder.add("smartcontract", params.smart_contract);
      }
      if (params.staked_account_id) {
        builder.add("stakedaccountid", params.staked_account_id);
      }
      if (params.staked_node_id !== undefined) {
        builder.add("stakednodeid", params.staked_node_id);
      }
    }

    return builder.build();
  }

  async listPaginated(params?: AccountListParams): Promise<ApiResult<AccountInfo[]>> {
    return this.getAllPaginated<AccountInfo>("accounts", this.buildAccountListParams(params));
  }

  createAccountPaginator(params?: AccountListParams): CursorPaginator<AccountInfo> {
    return super.createPaginator<AccountInfo>("accounts", this.buildAccountListParams(params));
  }
}
