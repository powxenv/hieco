import type { ApiResult, PaginationParams, Timestamp } from "@hieco/utils";
import type { ExchangeRate, NetworkFee, NetworkNode, NetworkStake, NetworkSupply } from "./types";
import type { CursorPaginator, PaginatedResponse } from "../shared/builders";
import { BaseApi } from "../shared/base";

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

  async getFees(
    params?: PaginationParams & { timestamp?: Timestamp },
  ): Promise<ApiResult<NetworkFee>> {
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
    const builder = this.createQueryBuilder();
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
