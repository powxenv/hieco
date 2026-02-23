import type { ApiResult } from "../../types/rest-api";
import type {
  ExchangeRate,
  NetworkFee,
  NetworkNode,
  NetworkStake,
  NetworkSupply,
} from "../../types/entities/network";
import { BaseApi } from "../base-api";

export class NetworkApi extends BaseApi {
  async getExchangeRate(): Promise<ApiResult<ExchangeRate>> {
    return this.getSingle<ExchangeRate>("network/exchangerate");
  }

  async getFees(): Promise<ApiResult<NetworkFee>> {
    return this.getSingle<NetworkFee>("network/fees");
  }

  async getNodes(): Promise<ApiResult<NetworkNode[]>> {
    return this.getList<NetworkNode>("network/nodes");
  }

  async getStake(): Promise<ApiResult<NetworkStake>> {
    return this.getSingle<NetworkStake>("network/stake");
  }

  async getSupply(): Promise<ApiResult<NetworkSupply>> {
    return this.getSingle<NetworkSupply>("network/supply");
  }
}
