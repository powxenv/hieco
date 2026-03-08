import type { ApiResult, Key, PaginationParams } from "@hieco/utils";
import { QueryBuilder, type CursorPaginator, type PaginatedResponse } from "./shared/builders";
import { BaseApi } from "./shared/base";
import type { TokenBalance } from "./accounts";

export interface NetworkNodesParams extends PaginationParams {
  "file.id"?: number;
  "node.id"?: number;
}

export class NetworkApi extends BaseApi {
  async getExchangeRate(params?: { timestamp?: string }): Promise<ApiResult<ExchangeRate>> {
    const builder = new QueryBuilder();

    if (params?.timestamp) {
      builder.addTimestamp(params.timestamp);
    }

    return this.getSingle<ExchangeRate>("network/exchangerate", builder.build());
  }

  async getFees(
    params?: PaginationParams & { timestamp?: string },
  ): Promise<ApiResult<NetworkFee>> {
    const builder = new QueryBuilder();

    if (params) {
      builder.addPagination(params);
      if (params.timestamp) {
        builder.addTimestamp(params.timestamp);
      }
    }

    return this.getSingle<NetworkFee>("network/fees", builder.build());
  }

  async getNodes(params?: NetworkNodesParams): Promise<ApiResult<NetworkNode[]>> {
    const builder = new QueryBuilder();

    if (params) {
      builder.addPagination(params);

      if (params["file.id"] !== undefined) {
        builder.add("file.id", params["file.id"]);
      }
      if (params["node.id"] !== undefined) {
        builder.add("node.id", params["node.id"]);
      }
    }

    return this.getList<NetworkNode>("network/nodes", builder.build());
  }

  async listPaginated(params?: NetworkNodesParams): Promise<ApiResult<NetworkNode[]>> {
    return this.getAllPaginated<NetworkNode>("network/nodes", this.buildNetworkNodesParams(params));
  }

  async listPaginatedPage(
    params?: NetworkNodesParams,
  ): Promise<ApiResult<PaginatedResponse<NetworkNode>>> {
    return this.getSinglePage<NetworkNode>("network/nodes", this.buildNetworkNodesParams(params));
  }

  async listPaginatedPageByUrl(url: string): Promise<ApiResult<PaginatedResponse<NetworkNode>>> {
    return this.getSinglePageByUrl<NetworkNode>(url);
  }

  createNetworkNodesPaginator(params?: NetworkNodesParams): CursorPaginator<NetworkNode> {
    return super.createPaginator<NetworkNode>(
      "network/nodes",
      this.buildNetworkNodesParams(params),
    );
  }

  private buildNetworkNodesParams(params?: NetworkNodesParams): Record<string, string> {
    const builder = new QueryBuilder();
    if (params) {
      builder.addPagination(params);
      if (params["file.id"] !== undefined) builder.add("file.id", params["file.id"]);
      if (params["node.id"] !== undefined) builder.add("node.id", params["node.id"]);
    }
    return builder.build();
  }

  async getStake(): Promise<ApiResult<NetworkStake>> {
    return this.getSingle<NetworkStake>("network/stake");
  }

  async getSupply(): Promise<ApiResult<NetworkSupply>> {
    return this.getSingle<NetworkSupply>("network/supply");
  }
}

export interface ExchangeRate {
  readonly current_rate: Rate;
  readonly next_rate: Rate;
  readonly timestamp: string;
}

export interface Rate {
  readonly cent_equality: number;
  readonly expiration_time: string;
  readonly hbar_equality: number;
}

export interface NetworkFee {
  readonly data: readonly FeeData[];
  readonly timestamp: string;
}

export interface FeeData {
  readonly denominator: number;
  readonly gas: number;
  readonly maximum: number;
  readonly minimum: number;
  readonly numerator: number;
  readonly operations: readonly number[];
  readonly rate: number;
}

export interface ServiceEndpoint {
  readonly domain_name?: string;
  readonly ip_address_v4: string;
  readonly port: number;
}

export interface TimestampRange {
  readonly from: string;
  readonly to: string | null;
}

export interface TimestampRangeNullable {
  readonly from: string | null;
  readonly to: string | null;
}

export interface NetworkNode {
  readonly admin_key: Key | null;
  readonly decline_reward: boolean | null;
  readonly description: string | null;
  readonly file_id: string;
  readonly max_stake: number | null;
  readonly memo: string | null;
  readonly min_stake: number | null;
  readonly node_account_id: string;
  readonly node_id: number;
  readonly node_cert_hash: string | null;
  readonly public_key: string | null;
  readonly reward_rate_start: number | null;
  readonly service_endpoints: readonly ServiceEndpoint[];
  readonly stake: number | null;
  readonly stake_not_rewarded: number | null;
  readonly stake_rewarded: number | null;
  readonly staking_period: TimestampRangeNullable;
  readonly timestamp: TimestampRange;
}

export interface NetworkStake {
  readonly max_stake_rewarded: number;
  readonly max_staking_reward_rate_per_hbar: number;
  readonly max_total_reward: number;
  readonly node_reward_fee_fraction: number;
  readonly reserved_staking_rewards: number;
  readonly reward_balance_threshold: number;
  readonly stake_total: number;
  readonly staking_period: TimestampRange;
  readonly staking_period_duration: number;
  readonly staking_periods_stored: number;
  readonly staking_reward_fee_fraction: number;
  readonly staking_reward_rate: number;
  readonly staking_start_threshold: number;
  readonly timestamp: TimestampRange;
  readonly unreserved_staking_reward_balance: number;
}

export interface NetworkSupply {
  readonly timestamp: string;
  readonly total_supply: number;
  readonly released_supply: number;
}

export interface AccountBalance {
  readonly account: string;
  readonly balance: number;
  readonly tokens: readonly TokenBalance[];
}

export interface BalancesResponse {
  readonly timestamp: string | null;
  readonly balances: readonly AccountBalance[];
  readonly links: {
    readonly next?: string;
  };
}

export interface Block {
  readonly hash: string;
  readonly number: number;
  readonly timestamp: {
    readonly from: string;
    readonly to: string;
  };
  readonly gas_used: number;
  readonly record_file_hash: string;
  readonly state_hash: string;
  readonly previous_hash: string;
}

export interface BlocksResponse {
  readonly blocks: readonly Block[];
  readonly links: {
    readonly next?: string;
  };
}
