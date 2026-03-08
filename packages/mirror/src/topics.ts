import type { ApiResult, Key, PaginationParams } from "@hieco/utils";
import { QueryBuilder, type CursorPaginator, type PaginatedResponse } from "./shared/builders";
import { BaseApi } from "./shared/base";

export interface TopicMessagesParams extends PaginationParams {
  encoding?: "base64" | "utf-8";
  sequencenumber?: number;
  timestamp?: string;
  transaction_id?: string;
  scheduled?: boolean;
}

export class TopicApi extends BaseApi {
  async getInfo(topicId: string): Promise<ApiResult<Topic>> {
    return this.getSingle<Topic>(`topics/${topicId}`);
  }

  async getMessages(
    topicId: string,
    params?: TopicMessagesParams,
  ): Promise<ApiResult<TopicMessage[]>> {
    const builder = new QueryBuilder();

    if (params) {
      builder.addPagination(params);

      if (params.encoding) {
        builder.add("encoding", params.encoding);
      }
      if (params.sequencenumber !== undefined) {
        builder.add("sequencenumber", params.sequencenumber);
      }
      if (params.timestamp) {
        builder.addTimestamp(params.timestamp);
      }
      if (params.transaction_id) {
        builder.add("transactionId", params.transaction_id);
      }
      if (params.scheduled !== undefined) {
        builder.add("scheduled", params.scheduled);
      }
    }

    return this.getList<TopicMessage>(`topics/${topicId}/messages`, builder.build());
  }

  async getMessage(topicId: string, sequenceNumber: number): Promise<ApiResult<TopicMessage>> {
    return this.getSingle<TopicMessage>(`topics/${topicId}/messages/${sequenceNumber}`);
  }

  async getMessageByTimestamp(timestamp: string): Promise<ApiResult<TopicMessage>> {
    return this.getSingle<TopicMessage>(`topics/messages/${timestamp}`);
  }

  async listPaginated(params?: PaginationParams): Promise<ApiResult<Topic[]>> {
    const builder = new QueryBuilder();

    if (params) {
      builder.addPagination(params);
    }

    return this.getAllPaginated<Topic>("topics", builder.build());
  }

  async listPaginatedPage(params?: PaginationParams): Promise<ApiResult<PaginatedResponse<Topic>>> {
    const builder = new QueryBuilder();

    if (params) {
      builder.addPagination(params);
    }

    return this.getSinglePage<Topic>("topics", builder.build());
  }

  async listPaginatedPageByUrl(url: string): Promise<ApiResult<PaginatedResponse<Topic>>> {
    return this.getSinglePageByUrl<Topic>(url);
  }

  createTopicPaginator(params?: PaginationParams): CursorPaginator<Topic> {
    const builder = new QueryBuilder();

    if (params) {
      builder.addPagination(params);
    }

    return super.createPaginator<Topic>("topics", builder.build());
  }
}

export interface ChunkInfo {
  readonly initial_transaction_id: string;
  readonly nonce: number;
  readonly number: number;
  readonly total: number;
  readonly scheduled: boolean;
}

export interface FixedCustomFee {
  readonly amount: number;
  readonly collector_account_id: string;
  readonly denominating_token_id: string | null;
}

export interface ConsensusCustomFees {
  readonly created_timestamp: string;
  readonly fixed_fees: readonly FixedCustomFee[];
}

export interface Topic {
  readonly admin_key: Key | null;
  readonly auto_renew_account: string | null;
  readonly auto_renew_period: number | null;
  readonly created_timestamp: string | null;
  readonly custom_fees: ConsensusCustomFees;
  readonly deleted: boolean | null;
  readonly fee_exempt_key_list: readonly Key[];
  readonly fee_schedule_key: Key | null;
  readonly memo: string;
  readonly submit_key: Key | null;
  readonly timestamp: string;
  readonly topic_id: string;
}

export interface TopicMessage {
  readonly chunk_info: ChunkInfo | null;
  readonly consensus_timestamp: string;
  readonly message: string;
  readonly payer_account_id: string;
  readonly running_hash: string;
  readonly running_hash_version: number;
  readonly sequence_number: number;
  readonly topic_id: string;
}
