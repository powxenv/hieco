import type { ApiResult, PaginationParams, QueryOperator, Timestamp } from "@hieco/utils";
import type { AccountBalance, BalancesResponse } from "../network/types";
import type { CursorPaginator, PaginatedResponse } from "../shared/builders";
import { BaseApi } from "../shared/base";

export interface BalancesListParams extends PaginationParams {
  account?: string;
  "account.balance"?: QueryOperator<number>;
  public_key?: string;
  timestamp?: Timestamp;
}

export class BalanceApi extends BaseApi {
  private buildBalancesParams(params?: BalancesListParams): Record<string, string> {
    const builder = this.createQueryBuilder();

    if (params) {
      builder.addPagination(params);

      if (params.account) {
        builder.add("account.id", params.account);
      }
      if (params["account.balance"]) {
        builder.add("account.balance", params["account.balance"]);
      }
      if (params.public_key) {
        builder.add("publickey", params.public_key);
      }
      if (params.timestamp) {
        builder.addTimestamp(params.timestamp);
      }
    }

    return builder.build();
  }

  async getBalances(params?: BalancesListParams): Promise<ApiResult<BalancesResponse>> {
    return this.getSingle<BalancesResponse>("balances", this.buildBalancesParams(params));
  }

  async listPaginated(params?: BalancesListParams): Promise<ApiResult<AccountBalance[]>> {
    return this.getAllPaginated<AccountBalance>("balances", this.buildBalancesParams(params));
  }

  async listPaginatedPage(
    params?: BalancesListParams,
  ): Promise<ApiResult<PaginatedResponse<AccountBalance>>> {
    return this.getSinglePage<AccountBalance>("balances", this.buildBalancesParams(params));
  }

  async listPaginatedPageByUrl(url: string): Promise<ApiResult<PaginatedResponse<AccountBalance>>> {
    return this.getSinglePageByUrl<AccountBalance>(url);
  }

  createBalancesPaginator(params?: BalancesListParams): CursorPaginator<AccountBalance> {
    return super.createPaginator("balances", this.buildBalancesParams(params));
  }
}
