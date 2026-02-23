import type { ApiResult, PaginationParams, Timestamp } from "../../types/rest-api";
import type { Topic, TopicMessage } from "../../types/entities/topic";
import type { EntityId } from "../../types/rest-api";
import type { CursorPaginator } from "../builders";
import { BaseApi } from "../base-api";

export interface TopicMessagesParams extends PaginationParams {
  encoding?: "base64" | "utf-8";
  sequencenumber?: number;
  timestamp?: Timestamp;
  transaction_id?: string;
  scheduled?: boolean;
}

export class TopicApi extends BaseApi {
  async getInfo(topicId: EntityId): Promise<ApiResult<Topic>> {
    return this.getSingle<Topic>(`topics/${topicId}`);
  }

  async getMessages(
    topicId: EntityId,
    params?: TopicMessagesParams,
  ): Promise<ApiResult<TopicMessage[]>> {
    const builder = this.createQueryBuilder();

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

  async getMessage(topicId: EntityId, sequenceNumber: number): Promise<ApiResult<TopicMessage>> {
    return this.getSingle<TopicMessage>(`topics/${topicId}/messages/${sequenceNumber}`);
  }

  async getMessageByTimestamp(timestamp: string): Promise<ApiResult<TopicMessage>> {
    return this.getSingle<TopicMessage>(`topics/messages/${timestamp}`);
  }

  async listPaginated(params?: PaginationParams): Promise<ApiResult<Topic[]>> {
    const builder = this.createQueryBuilder();

    if (params) {
      builder.addPagination(params);
    }

    return this.getAllPaginated<Topic>("topics", builder.build());
  }

  createTopicPaginator(params?: PaginationParams): CursorPaginator<Topic> {
    const builder = this.createQueryBuilder();

    if (params) {
      builder.addPagination(params);
    }

    return super.createPaginator<Topic>("topics", builder.build());
  }
}
