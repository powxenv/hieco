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
  account?: EntityId | QueryOperator<EntityId>;
  alias?: string;
  balance?: QueryOperator<number>;
  balance_gte?: number;
  balance_lte?: number;
  created_timestamp?: Timestamp | { from?: Timestamp; to?: Timestamp };
  evm_address?: string;
  key?: string;
  memo?: string;
  public_key?: string;
  smart_contract?: boolean;
  staked_account_id?: EntityId;
  staked_node_id?: number;
}

export interface AccountNftsParams extends PaginationParams {
  "spender.id"?: EntityId;
  "token.id"?: EntityId;
  serial_number?: number;
}

export class AccountApi extends BaseApi {
  async getInfo(accountId: EntityId): Promise<ApiResult<AccountInfo>> {
    return this.getSingle<AccountInfo>(`accounts/${accountId}`);
  }

  async getBalances(accountId: EntityId): Promise<ApiResult<Balance>> {
    return this.getSingle<Balance>(`accounts/${accountId}/balances`);
  }

  async getTokens(
    accountId: EntityId,
    params?: PaginationParams,
  ): Promise<ApiResult<TokenRelationship[]>> {
    const builder = this.createQueryBuilder();

    if (params) {
      builder.addPagination(params);
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
    params?: PaginationParams,
  ): Promise<ApiResult<StakingReward[]>> {
    const builder = this.createQueryBuilder();

    if (params) {
      builder.addPagination(params);
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

    return this.getList<CryptoAllowance>(`accounts/${accountId}/allowances/crypto`, builder.build());
  }

  async getTokenAllowances(
    accountId: EntityId,
    params?: { spender?: EntityId; "token.id"?: EntityId },
  ): Promise<ApiResult<TokenAllowance[]>> {
    const builder = this.createQueryBuilder();

    if (params?.spender) {
      builder.add("spender", params.spender);
    }
    if (params?.["token.id"]) {
      builder.add("token.id", params["token.id"]);
    }

    return this.getList<TokenAllowance>(`accounts/${accountId}/allowances/token`, builder.build());
  }

  async getNftAllowances(
    accountId: EntityId,
    params?: PaginationParams & { "account.id"?: EntityId; owner?: EntityId; "token.id"?: EntityId },
  ): Promise<ApiResult<NftAllowance[]>> {
    const builder = this.createQueryBuilder();

    if (params) {
      builder.addPagination(params);
      if (params["account.id"]) {
        builder.add("account.id", params["account.id"]);
      }
      if (params.owner) {
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
      receiver?: EntityId;
      serial_number?: number;
      "token.id"?: EntityId;
    },
  ): Promise<ApiResult<TokenAirdropsResponse>> {
    const builder = this.createQueryBuilder();

    if (params) {
      builder.addPagination(params);
      if (params.receiver) {
        builder.add("receiver", params.receiver);
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
      sender?: EntityId;
      serial_number?: number;
      "token.id"?: EntityId;
    },
  ): Promise<ApiResult<TokenAirdropsResponse>> {
    const builder = this.createQueryBuilder();

    if (params) {
      builder.addPagination(params);
      if (params.sender) {
        builder.add("sender", params.sender);
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

  async listPaginated(params?: AccountListParams): Promise<ApiResult<AccountInfo[]>> {
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

    return this.getAllPaginated<AccountInfo>("accounts", builder.build());
  }

  createAccountPaginator(params?: AccountListParams): CursorPaginator<AccountInfo> {
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

    return super.createPaginator<AccountInfo>("accounts", builder.build());
  }
}
