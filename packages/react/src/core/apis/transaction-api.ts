import type { ApiResult, PaginationParams, QueryOperator, Timestamp } from "../../types/rest-api";
import type { Transaction, TransactionDetails } from "../../types/entities/transaction";
import type { EntityId } from "../../types/rest-api";
import type { CursorPaginator } from "../builders";
import { BaseApi } from "../base-api";

export interface TransactionListParams extends PaginationParams {
  account?: EntityId;
  "account.id"?: EntityId | QueryOperator<EntityId> | QueryOperator<EntityId>[];
  result?: string;
  scheduled?: boolean;
  timestamp?: Timestamp | { from?: Timestamp; to?: Timestamp };
  transaction_id?: string;
  transactionhash?: string;
  transactiontype?: string;
  "transfers.account"?: EntityId | QueryOperator<EntityId> | QueryOperator<EntityId>[];
  type?: "credit" | "debit";
}

export interface TransactionsByAccountParams extends PaginationParams {
  result?: string;
  scheduled?: boolean;
  timestamp?: Timestamp | { from?: Timestamp; to?: Timestamp };
  transaction_id?: string;
  transactionhash?: string;
  transactiontype?: string;
  type?: "credit" | "debit";
}

export class TransactionApi extends BaseApi {
  async getById(
    transactionId: string,
    params?: { nonce?: number; scheduled?: boolean },
  ): Promise<ApiResult<TransactionDetails>> {
    const builder = this.createQueryBuilder();

    if (params) {
      if (params.nonce !== undefined) {
        builder.add("nonce", params.nonce);
      }
      if (params.scheduled !== undefined) {
        builder.add("scheduled", params.scheduled);
      }
    }

    return this.getSingle<TransactionDetails>(`transactions/${transactionId}`, builder.build());
  }

  async listByAccount(
    accountId: EntityId,
    params?: TransactionsByAccountParams,
  ): Promise<ApiResult<Transaction[]>> {
    const builder = this.createQueryBuilder();

    if (params) {
      builder.addPagination(params);

      if (params.result) {
        builder.add("result", params.result);
      }
      if (params.scheduled !== undefined) {
        builder.add("scheduled", params.scheduled);
      }
      if (params.timestamp) {
        builder.addTimestamp(params.timestamp);
      }
      if (params.transaction_id) {
        builder.add("transactionid", params.transaction_id);
      }
      if (params.transactionhash) {
        builder.add("transactionhash", params.transactionhash);
      }
      if (params.transactiontype) {
        builder.add("transactiontype", params.transactiontype);
      }
      if (params.type) {
        builder.add("type", params.type);
      }
    }

    return this.getList<Transaction>(`transactions?account.id=${accountId}`, builder.build());
  }

  private buildTransactionListParams(params?: TransactionListParams): Record<string, string> {
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
      if (params.result) {
        builder.add("result", params.result);
      }
      if (params.scheduled !== undefined) {
        builder.add("scheduled", params.scheduled);
      }
      if (params.timestamp) {
        builder.addTimestamp(params.timestamp);
      }
      if (params.transaction_id) {
        builder.add("transactionid", params.transaction_id);
      }
      if (params.transactionhash) {
        builder.add("transactionhash", params.transactionhash);
      }
      if (params.transactiontype) {
        builder.add("transactiontype", params.transactiontype);
      }
      if (params["transfers.account"]) {
        if (Array.isArray(params["transfers.account"])) {
          builder.addIn("transfers.account", params["transfers.account"]);
        } else {
          builder.add("transfers.account", params["transfers.account"]);
        }
      }
      if (params.type) {
        builder.add("type", params.type);
      }
    }

    return builder.build();
  }

  async listPaginated(params?: TransactionListParams): Promise<ApiResult<Transaction[]>> {
    return this.getAllPaginated<Transaction>("transactions", this.buildTransactionListParams(params));
  }

  createTransactionPaginator(params?: TransactionListParams): CursorPaginator<Transaction> {
    return super.createPaginator<Transaction>("transactions", this.buildTransactionListParams(params));
  }
}
