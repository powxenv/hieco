import type { ApiResult, PaginationParams, Timestamp } from "../../types/rest-api";
import type {
  ExchangeRate,
  NetworkFee,
  NetworkNode,
  NetworkStake,
  NetworkSupply,
} from "../../types/entities/network";
import { BaseApi } from "../base-api";

export interface NetworkNodesParams extends PaginationParams {
  "file.id"?: number;
  "node.id"?: number;
}

export class NetworkApi extends BaseApi {
  async getExchangeRate(params?: { timestamp?: Timestamp }): Promise<ApiResult<ExchangeRate>> {
    const builder = this.createQueryBuilder();

    if (params?.timestamp) {
      builder.addTimestamp(params.timestamp);
    }

    return this.getSingle<ExchangeRate>("network/exchangerate", builder.build());
  }

  async getFees(params?: PaginationParams & { timestamp?: Timestamp }): Promise<ApiResult<NetworkFee>> {
    const builder = this.createQueryBuilder();

    if (params) {
      builder.addPagination(params);
      if (params.timestamp) {
        builder.addTimestamp(params.timestamp);
      }
    }

    return this.getSingle<NetworkFee>("network/fees", builder.build());
  }

  async getNodes(params?: NetworkNodesParams): Promise<ApiResult<NetworkNode[]>> {
    const builder = this.createQueryBuilder();

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

  async getStake(): Promise<ApiResult<NetworkStake>> {
    return this.getSingle<NetworkStake>("network/stake");
  }

  async getSupply(): Promise<ApiResult<NetworkSupply>> {
    return this.getSingle<NetworkSupply>("network/supply");
  }
}
