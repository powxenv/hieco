import type {
  ApiResult,
  Key,
  PaginationParams,
  QueryOperator,
  TimestampFilter,
} from "@hieco/utils";
import { QueryBuilder, type CursorPaginator, type PaginatedResponse } from "./shared/builders";
import { BaseApi } from "./shared/base";

export interface TransactionListParams extends PaginationParams {
  account?: string;
  "account.id"?: string | QueryOperator<string> | QueryOperator<string>[];
  result?: string;
  scheduled?: boolean;
  timestamp?: TimestampFilter;
  transaction_id?: string;
  transactionhash?: string;
  transactiontype?: string;
  "transfers.account"?: string | QueryOperator<string> | QueryOperator<string>[];
  "token.transfers.account"?: string | QueryOperator<string> | QueryOperator<string>[];
  "token.transfers.token"?: string | QueryOperator<string> | QueryOperator<string>[];
  "token.transfers.amount"?: QueryOperator<number>;
  type?: "credit" | "debit";
}

export interface TransactionsByAccountParams extends PaginationParams {
  result?: string;
  scheduled?: boolean;
  timestamp?: TimestampFilter;
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
    const builder = new QueryBuilder();

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
    accountId: string,
    params?: TransactionsByAccountParams,
  ): Promise<ApiResult<Transaction[]>> {
    const builder = new QueryBuilder();

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
    const builder = new QueryBuilder();

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
      if (params["token.transfers.account"]) {
        if (Array.isArray(params["token.transfers.account"])) {
          builder.addIn("token.transfers.account", params["token.transfers.account"]);
        } else {
          builder.add("token.transfers.account", params["token.transfers.account"]);
        }
      }
      if (params["token.transfers.token"]) {
        if (Array.isArray(params["token.transfers.token"])) {
          builder.addIn("token.transfers.token", params["token.transfers.token"]);
        } else {
          builder.add("token.transfers.token", params["token.transfers.token"]);
        }
      }
      if (params["token.transfers.amount"]) {
        builder.add("token.transfers.amount", params["token.transfers.amount"]);
      }
      if (params.type) {
        builder.add("type", params.type);
      }
    }

    return builder.build();
  }

  async listPaginated(params?: TransactionListParams): Promise<ApiResult<Transaction[]>> {
    return this.getAllPaginated<Transaction>(
      "transactions",
      this.buildTransactionListParams(params),
    );
  }

  async listPaginatedPage(
    params?: TransactionListParams,
  ): Promise<ApiResult<PaginatedResponse<Transaction>>> {
    return this.getSinglePage<Transaction>("transactions", this.buildTransactionListParams(params));
  }

  async listPaginatedPageByUrl(url: string): Promise<ApiResult<PaginatedResponse<Transaction>>> {
    return this.getSinglePageByUrl<Transaction>(url);
  }

  createTransactionPaginator(params?: TransactionListParams): CursorPaginator<Transaction> {
    return super.createPaginator<Transaction>(
      "transactions",
      this.buildTransactionListParams(params),
    );
  }
}

export interface Transfer {
  readonly account: string;
  readonly amount: number;
  readonly is_approval: boolean;
}

export interface TokenTransfer {
  readonly token_id: string;
  readonly account: string;
  readonly amount: number;
  readonly is_approval: boolean;
}

export interface NftTransfer {
  readonly is_approval: boolean;
  readonly receiver_account_id: string;
  readonly sender_account_id: string;
  readonly token_id: string;
  readonly serial_number: number;
}

export interface StakingRewardTransfer {
  readonly account: string;
  readonly amount: number;
}

export interface Transaction {
  readonly batch_key: Key | null;
  readonly bytes: string | null;
  readonly charged_tx_fee: number;
  readonly consensus_timestamp: string;
  readonly entity_id: string | null;
  readonly max_fee: string;
  readonly memo_base64: string | null;
  readonly name: TransactionType;
  readonly nft_transfers: readonly NftTransfer[];
  readonly node: string;
  readonly nonce: number | null;
  readonly parent_consensus_timestamp: string | null;
  readonly result: string;
  readonly scheduled: boolean;
  readonly staking_reward_transfers: readonly StakingRewardTransfer[];
  readonly token_transfers: readonly TokenTransfer[];
  readonly transaction_hash: string;
  readonly transaction_id: string;
  readonly transfers: readonly Transfer[];
  readonly valid_duration_seconds: string;
  readonly valid_start_timestamp: string;
}

export interface TransactionDetails extends Transaction {
  readonly assessed_custom_fees: readonly AssessedCustomFee[];
}

export interface AssessedCustomFee {
  readonly amount: number;
  readonly collector_account_id: string;
  readonly effective_payer_account_ids: readonly string[];
  readonly token_id: string | null;
}

export type TransactionType =
  | "ATOMICBATCH"
  | "CONSENSUSCREATETOPIC"
  | "CONSENSUSDELETETOPIC"
  | "CONSENSUSSUBMITMESSAGE"
  | "CONSENSUSUPDATETOPIC"
  | "CONTRACTCALL"
  | "CONTRACTCREATEINSTANCE"
  | "CONTRACTDELETEINSTANCE"
  | "CONTRACTUPDATEINSTANCE"
  | "CRYPTOCREATEACCOUNT"
  | "CRYPTODELETE"
  | "CRYPTODELETEALLOWANCE"
  | "CRYPTOTRANSFER"
  | "CRYPTOUPDATEACCOUNT"
  | "ETHEREUMTRANSACTION"
  | "FILEAPPEND"
  | "FILECREATE"
  | "FILEDELETE"
  | "FILEUPDATE"
  | "FREEZEACCOUNT"
  | "KYCAWARDTOKEN"
  | "KYCBURNTOKEN"
  | "KYCREVOKETOKENKYC"
  | "KYCTOKENASSOCIATE"
  | "KYCTOKENDISSOCIATE"
  | "SCHEDULECREATE"
  | "SCHEDULEDELETE"
  | "SYSTEMDELETE"
  | "SYSTEMUNDELETE"
  | "TOKENASSOCIATE"
  | "TOKENBURN"
  | "TOKENCREATION"
  | "TOKENDELETE"
  | "TOKENDISSOCIATE"
  | "TOKENFREEZEACCOUNT"
  | "TOKENGRANTKYC"
  | "TOKENMINT"
  | "TOKENPAUSE"
  | "TOKENREVOKEKYC"
  | "TOKENSEIZE"
  | "TOKENUNFREEZEACCOUNT"
  | "TOKENUNPAUSE"
  | "TOKENUPDATE"
  | "TOKENWIPE";
