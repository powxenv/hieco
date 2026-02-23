import type { ApiResult, PaginationParams, QueryOperator, Timestamp } from "../../types/rest-api";
import type { Transaction, TransactionDetails } from "../../types/entities/transaction";
import type { EntityId } from "../../types/rest-api";
import type { CursorPaginator } from "../builders";
import { BaseApi } from "../base-api";

export interface TransactionListParams extends PaginationParams {
  account?: EntityId;
  "account.id"?: EntityId | QueryOperator<EntityId> | QueryOperator<EntityId>[];
  transaction_id?: string;
  transactionhash?: string;
  result?: string;
  scheduled?: boolean;
  timestamp?: Timestamp | { from?: Timestamp; to?: Timestamp };
  "transfers.account"?: EntityId | QueryOperator<EntityId> | QueryOperator<EntityId>[];
}

export interface TransactionsByAccountParams extends PaginationParams {
  timestamp?: Timestamp | { from?: Timestamp; to?: Timestamp };
  transaction_id?: string;
  transactionhash?: string;
  result?: string;
  scheduled?: boolean;
}

export class TransactionApi extends BaseApi {
  async getById(transactionId: string): Promise<ApiResult<TransactionDetails>> {
    return this.getSingle<TransactionDetails>(`transactions/${transactionId}`);
  }

  async listByAccount(
    accountId: EntityId,
    params?: TransactionsByAccountParams,
  ): Promise<ApiResult<Transaction[]>> {
    const builder = this.createQueryBuilder();

    if (params) {
      builder.addPagination(params);

      if (params.timestamp) {
        builder.addTimestamp(params.timestamp);
      }
      if (params.transaction_id) {
        builder.add("transactionid", params.transaction_id);
      }
      if (params.transactionhash) {
        builder.add("transactionhash", params.transactionhash);
      }
      if (params.result) {
        builder.add("result", params.result);
      }
      if (params.scheduled !== undefined) {
        builder.add("scheduled", params.scheduled);
      }
    }

    return this.getList<Transaction>(`transactions?account.id=${accountId}`, builder.build());
  }

  async listPaginated(params?: TransactionListParams): Promise<ApiResult<Transaction[]>> {
    const builder = this.createQueryBuilder();

    if (params) {
      builder.addPagination(params);

      if (params.account) {
        builder.add("account.id", params.account);
      }
      if (params["account.id"]) {
        if (Array.isArray(params["account.id"])) {
          builder.addIn("account.id", params["account.id"]);
        } else {
          builder.add("account.id", params["account.id"]);
        }
      }
      if (params.transaction_id) {
        builder.add("transactionid", params.transaction_id);
      }
      if (params.transactionhash) {
        builder.add("transactionhash", params.transactionhash);
      }
      if (params.result) {
        builder.add("result", params.result);
      }
      if (params.scheduled !== undefined) {
        builder.add("scheduled", params.scheduled);
      }
      if (params.timestamp) {
        builder.addTimestamp(params.timestamp);
      }
      if (params["transfers.account"]) {
        if (Array.isArray(params["transfers.account"])) {
          builder.addIn("transfers.account", params["transfers.account"]);
        } else {
          builder.add("transfers.account", params["transfers.account"]);
        }
      }
    }

    return this.getAllPaginated<Transaction>("transactions", builder.build());
  }

  createTransactionPaginator(params?: TransactionListParams): CursorPaginator<Transaction> {
    const builder = this.createQueryBuilder();

    if (params) {
      builder.addPagination(params);

      if (params.account) {
        builder.add("account.id", params.account);
      }
      if (params["account.id"]) {
        if (Array.isArray(params["account.id"])) {
          builder.addIn("account.id", params["account.id"]);
        } else {
          builder.add("account.id", params["account.id"]);
        }
      }
      if (params.transaction_id) {
        builder.add("transactionid", params.transaction_id);
      }
      if (params.transactionhash) {
        builder.add("transactionhash", params.transactionhash);
      }
      if (params.result) {
        builder.add("result", params.result);
      }
      if (params.scheduled !== undefined) {
        builder.add("scheduled", params.scheduled);
      }
      if (params.timestamp) {
        builder.addTimestamp(params.timestamp);
      }
      if (params["transfers.account"]) {
        if (Array.isArray(params["transfers.account"])) {
          builder.addIn("transfers.account", params["transfers.account"]);
        } else {
          builder.add("transfers.account", params["transfers.account"]);
        }
      }
    }

    return super.createPaginator<Transaction>("transactions", builder.build());
  }
}
