import type {
  ApiResult,
  Key,
  PaginationParams,
  QueryOperator,
  TimestampFilter,
} from "@hieco/utils";
import { QueryBuilder, type CursorPaginator, type PaginatedResponse } from "./shared/builders";
import { BaseApi } from "./shared/base";

export interface AccountListParams extends PaginationParams {
  readonly account?: string | QueryOperator<string>;
  readonly alias?: string;
  readonly balance?: QueryOperator<number>;
  readonly balance_gte?: number;
  readonly balance_lte?: number;
  readonly created_timestamp?: TimestampFilter;
  readonly evm_address?: string;
  readonly key?: string;
  readonly memo?: string;
  readonly public_key?: string;
  readonly smart_contract?: boolean;
  readonly staked_account_id?: string;
  readonly staked_node_id?: number;
}

export interface AccountNftsParams extends PaginationParams {
  readonly "spender.id"?: string;
  readonly "token.id"?: string;
  readonly serial_number?: number;
}

export interface AccountTokenAllowancesParams extends PaginationParams {
  readonly "spender.id"?: string;
  readonly "token.id"?: string;
}

export interface AccountNftAllowancesParams extends PaginationParams {
  readonly "account.id"?: string;
  readonly owner?: boolean;
  readonly "token.id"?: string;
}

export class AccountApi extends BaseApi {
  async getInfo(
    accountId: string,
    params?: { readonly timestamp?: string; readonly transactions?: boolean },
  ): Promise<ApiResult<AccountInfo>> {
    const builder = new QueryBuilder();

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

  async getBalances(accountId: string): Promise<ApiResult<Balance>> {
    return this.getSingle<Balance>(`accounts/${accountId}/balances`);
  }

  async getTokens(
    accountId: string,
    params?: PaginationParams & { "token.id"?: string },
  ): Promise<ApiResult<TokenRelationship[]>> {
    const builder = new QueryBuilder();

    if (params) {
      builder.addPagination(params);
      if (params["token.id"]) {
        builder.add("token.id", params["token.id"]);
      }
    }

    return this.getList<TokenRelationship>(`accounts/${accountId}/tokens`, builder.build());
  }

  async getNfts(
    accountId: string,
    params?: AccountNftsParams,
  ): Promise<ApiResult<TokenRelationship[]>> {
    const builder = new QueryBuilder();

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
    accountId: string,
    params?: PaginationParams & { timestamp?: string },
  ): Promise<ApiResult<StakingReward[]>> {
    const builder = new QueryBuilder();

    if (params) {
      builder.addPagination(params);
      if (params.timestamp) {
        builder.addTimestamp(params.timestamp);
      }
    }

    return this.getList<StakingReward>(`accounts/${accountId}/rewards`, builder.build());
  }

  async getCryptoAllowances(
    accountId: string,
    params?: PaginationParams & { "spender.id"?: string },
  ): Promise<ApiResult<CryptoAllowance[]>> {
    const builder = new QueryBuilder();

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
    accountId: string,
    params?: AccountTokenAllowancesParams,
  ): Promise<ApiResult<TokenAllowance[]>> {
    const builder = new QueryBuilder();

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
    accountId: string,
    params?: AccountNftAllowancesParams,
  ): Promise<ApiResult<NftAllowance[]>> {
    const builder = new QueryBuilder();

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
    accountId: string,
    params?: {
      limit?: number;
      order?: "asc" | "desc";
      "receiver.id"?: string;
      serial_number?: number;
      "token.id"?: string;
    },
  ): Promise<ApiResult<TokenAirdropsResponse>> {
    const builder = new QueryBuilder();

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
    accountId: string,
    params?: {
      limit?: number;
      order?: "asc" | "desc";
      "sender.id"?: string;
      serial_number?: number;
      "token.id"?: string;
    },
  ): Promise<ApiResult<TokenAirdropsResponse>> {
    const builder = new QueryBuilder();

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
    const builder = new QueryBuilder();

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

  async listPaginatedPage(
    params?: AccountListParams,
  ): Promise<ApiResult<PaginatedResponse<AccountInfo>>> {
    return this.getSinglePage<AccountInfo>("accounts", this.buildAccountListParams(params));
  }

  async listPaginatedPageByUrl(url: string): Promise<ApiResult<PaginatedResponse<AccountInfo>>> {
    return this.getSinglePageByUrl<AccountInfo>(url);
  }

  createAccountPaginator(params?: AccountListParams): CursorPaginator<AccountInfo> {
    return super.createPaginator<AccountInfo>("accounts", this.buildAccountListParams(params));
  }
}

export interface AccountInfo {
  readonly account: string;
  readonly alias: string | null;
  readonly auto_renew_period: number | null;
  readonly balance: Balance;
  readonly created_timestamp: string | null;
  readonly decline_reward: boolean;
  readonly deleted: boolean | null;
  readonly ethereum_nonce: number | null;
  readonly evm_address: string | null;
  readonly expiry_timestamp: string | null;
  readonly key: Key | null;
  readonly max_automatic_token_associations: number | null;
  readonly memo: string | null;
  readonly pending_reward: number;
  readonly receiver_sig_required: boolean | null;
  readonly staked_account_id: string | null;
  readonly staked_node_id: number | null;
  readonly stake_period_start: string | null;
}

export interface Balance {
  readonly timestamp: string;
  readonly balance: number | null;
  readonly tokens: readonly TokenBalance[];
}

export interface TokenBalance {
  readonly token_id: string;
  readonly balance: number;
}

export interface TokenRelationship {
  readonly token_id: string;
  readonly balance: number;
  readonly created_timestamp: string;
  readonly decimals: number;
  readonly freeze_status: string;
  readonly kyc_status: string;
  readonly automatic_association: boolean;
}

export interface CryptoAllowance {
  readonly owner: string;
  readonly spender: string;
  readonly amount: number;
  readonly owner_already_approved: boolean;
}

export interface TokenAllowance {
  readonly owner: string;
  readonly spender: string;
  readonly token_id: string;
  readonly amount: number;
  readonly owner_already_approved: boolean;
}

export interface NftAllowance {
  readonly owner: string;
  readonly spender: string;
  readonly token_id: string;
  readonly approved_for_all: boolean;
  readonly serial_numbers: readonly number[];
}

export interface StakingReward {
  readonly account_id: string;
  readonly amount: number;
  readonly account_reward_sum: number;
  readonly calculated_timestamp: string;
  readonly node_id: number;
  readonly reward_sum: number;
}

export interface TokenAirdrop {
  readonly token_id: string;
  readonly serial_numbers: readonly number[];
  readonly sender_account_id: string;
  readonly receiver_account_id: string;
}

export interface TokenAirdropsResponse {
  readonly airdrops: readonly TokenAirdrop[];
  readonly links: {
    readonly next?: string;
  };
}
