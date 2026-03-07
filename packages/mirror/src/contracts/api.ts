import type { ApiResult, EntityId, PaginationParams, QueryOperator, Timestamp } from "@hieco/utils";
import type {
  ContractAction,
  ContractCallParams,
  ContractCallResult,
  ContractInfo,
  ContractLog,
  ContractOpcodesResponse,
  ContractResult,
  ContractResultDetails,
  ContractResultsResponse,
  ContractState,
} from "./types";
import { QueryBuilder, type CursorPaginator, type PaginatedResponse } from "../shared/builders";
import { BaseApi } from "../shared/base";

export interface ContractListParams extends PaginationParams {
  "contract.id"?: EntityId | QueryOperator<EntityId>;
  address?: string;
  smart_contract_id?: EntityId | QueryOperator<EntityId>;
  created_timestamp?: Timestamp | { from?: Timestamp; to?: Timestamp };
}

export interface ContractResultsParams extends PaginationParams {
  "block.hash"?: string;
  block_number?: number;
  from?: string;
  internal?: boolean;
  timestamp?: Timestamp;
  transaction_index?: number;
}

export interface ContractStateParams extends PaginationParams {
  slot?: string;
  timestamp?: Timestamp;
}

export interface ContractLogsParams extends PaginationParams {
  index?: number;
  timestamp?: Timestamp;
  topic0?: string;
  topic1?: string;
  topic2?: string;
  topic3?: string;
  "transaction.hash"?: string;
}

export class ContractApi extends BaseApi {
  async getInfo(
    contractIdOrAddress: EntityId | string,
    params?: { timestamp?: Timestamp },
  ): Promise<ApiResult<ContractInfo>> {
    const builder = new QueryBuilder();

    if (params?.timestamp) {
      builder.addTimestamp(params.timestamp);
    }

    return this.getSingle<ContractInfo>(`contracts/${contractIdOrAddress}`, builder.build());
  }

  async call(params: ContractCallParams): Promise<ApiResult<ContractCallResult>> {
    return this.client.post<ContractCallResult>("contracts/call", {
      to: params.contractId,
      ...(params.from !== undefined && { from: params.from }),
      ...(params.gas !== undefined && { gas: params.gas }),
      ...(params.gasPrice !== undefined && { gasPrice: params.gasPrice }),
      ...(params.data !== undefined && { data: params.data }),
      ...(params.estimate !== undefined && { estimate: params.estimate }),
      ...(params.block !== undefined && { block: params.block }),
      ...(params.value !== undefined && { value: params.value }),
    });
  }

  async getResults(
    contractId: EntityId,
    params?: ContractResultsParams,
  ): Promise<ApiResult<ContractResult[]>> {
    const builder = new QueryBuilder();

    if (params) {
      builder.addPagination(params);

      if (params["block.hash"]) {
        builder.add("block.hash", params["block.hash"]);
      }
      if (params.block_number !== undefined) {
        builder.add("block.number", params.block_number);
      }
      if (params.from) {
        builder.add("from", params.from);
      }
      if (params.internal !== undefined) {
        builder.add("internal", params.internal);
      }
      if (params.timestamp) {
        builder.addTimestamp(params.timestamp);
      }
      if (params.transaction_index !== undefined) {
        builder.add("transaction.index", params.transaction_index);
      }
    }

    return this.getList<ContractResult>(`contracts/${contractId}/results`, builder.build());
  }

  async getResult(contractId: EntityId, timestamp: Timestamp): Promise<ApiResult<ContractResult>> {
    return this.getSingle<ContractResult>(`contracts/${contractId}/results/${timestamp}`);
  }

  async getState(
    contractId: EntityId,
    params?: ContractStateParams,
  ): Promise<ApiResult<ContractState[]>> {
    const builder = new QueryBuilder();

    if (params) {
      builder.addPagination(params);

      if (params.slot) {
        builder.add("slot", params.slot);
      }
      if (params.timestamp) {
        builder.addTimestamp(params.timestamp);
      }
    }

    return this.getList<ContractState>(`contracts/${contractId}/state`, builder.build());
  }

  async getLogs(
    contractId: EntityId,
    params?: ContractLogsParams,
  ): Promise<ApiResult<ContractLog[]>> {
    const builder = new QueryBuilder();

    if (params) {
      builder.addPagination(params);

      if (params.index !== undefined) {
        builder.add("index", params.index);
      }
      if (params.timestamp) {
        builder.addTimestamp(params.timestamp);
      }
      if (params.topic0) {
        builder.add("topic0", params.topic0);
      }
      if (params.topic1) {
        builder.add("topic1", params.topic1);
      }
      if (params.topic2) {
        builder.add("topic2", params.topic2);
      }
      if (params.topic3) {
        builder.add("topic3", params.topic3);
      }
      if (params["transaction.hash"]) {
        builder.add("transaction.hash", params["transaction.hash"]);
      }
    }

    return this.getList<ContractLog>(`contracts/${contractId}/results/logs`, builder.build());
  }

  async getAllResults(params?: {
    limit?: number;
    order?: "asc" | "desc";
    from?: string;
    block_hash?: string;
    block_number?: number;
    internal?: boolean;
    timestamp?: Timestamp;
    transaction_index?: number;
  }): Promise<ApiResult<ContractResultsResponse>> {
    const builder = new QueryBuilder();

    if (params) {
      builder.addPagination(params);

      if (params.from) {
        builder.add("from", params.from);
      }
      if (params.block_hash) {
        builder.add("block.hash", params.block_hash);
      }
      if (params.block_number !== undefined) {
        builder.add("block.number", params.block_number);
      }
      if (params.internal !== undefined) {
        builder.add("internal", params.internal);
      }
      if (params.timestamp) {
        builder.addTimestamp(params.timestamp);
      }
      if (params.transaction_index !== undefined) {
        builder.add("transaction.index", params.transaction_index);
      }
    }

    return this.getSingle<ContractResultsResponse>("contracts/results", builder.build());
  }

  async getResultByTransactionIdOrHash(
    transactionIdOrHash: string,
    params?: { nonce?: number },
  ): Promise<ApiResult<ContractResultDetails>> {
    const builder = new QueryBuilder();

    if (params?.nonce !== undefined) {
      builder.add("nonce", params.nonce);
    }

    return this.getSingle<ContractResultDetails>(
      `contracts/results/${transactionIdOrHash}`,
      builder.build(),
    );
  }

  async getResultActions(
    transactionIdOrHash: string,
    params?: PaginationParams & { index?: number },
  ): Promise<ApiResult<{ actions: ContractAction[] }>> {
    const builder = new QueryBuilder();

    if (params) {
      builder.addPagination(params);
      if (params.index !== undefined) {
        builder.add("index", params.index);
      }
    }

    return this.getSingle<{ actions: ContractAction[] }>(
      `contracts/results/${transactionIdOrHash}/actions`,
      builder.build(),
    );
  }

  async getResultOpcodes(
    transactionIdOrHash: string,
    params?: { stack?: boolean; memory?: boolean; storage?: boolean },
  ): Promise<ApiResult<ContractOpcodesResponse>> {
    const builder = new QueryBuilder();

    if (params) {
      if (params.stack !== undefined) {
        builder.add("stack", params.stack);
      }
      if (params.memory !== undefined) {
        builder.add("memory", params.memory);
      }
      if (params.storage !== undefined) {
        builder.add("storage", params.storage);
      }
    }

    return this.getSingle<ContractOpcodesResponse>(
      `contracts/results/${transactionIdOrHash}/opcodes`,
      builder.build(),
    );
  }

  async getAllContractLogs(
    params?: PaginationParams & {
      index?: number;
      timestamp?: Timestamp;
      topic0?: string;
      topic1?: string;
      topic2?: string;
      topic3?: string;
      "transaction.hash"?: string;
    },
  ): Promise<ApiResult<PaginatedResponse<ContractLog>>> {
    const builder = new QueryBuilder();

    if (params) {
      builder.addPagination(params);

      if (params.index !== undefined) {
        builder.add("index", params.index);
      }
      if (params.timestamp) {
        builder.addTimestamp(params.timestamp);
      }
      if (params.topic0) {
        builder.add("topic0", params.topic0);
      }
      if (params.topic1) {
        builder.add("topic1", params.topic1);
      }
      if (params.topic2) {
        builder.add("topic2", params.topic2);
      }
      if (params.topic3) {
        builder.add("topic3", params.topic3);
      }
      if (params["transaction.hash"]) {
        builder.add("transaction.hash", params["transaction.hash"]);
      }
    }

    return this.getSinglePage<ContractLog>("contracts/results/logs", builder.build());
  }

  private buildContractListParams(params?: ContractListParams): Record<string, string> {
    const builder = new QueryBuilder();

    if (params) {
      builder.addPagination(params);

      if (params["contract.id"]) {
        builder.add("contract.id", params["contract.id"]);
      }
      if (params.address) {
        builder.add("address", params.address);
      }
      if (params.smart_contract_id) {
        builder.add("smartcontractid", params.smart_contract_id);
      }
      if (params.created_timestamp) {
        builder.addTimestamp(params.created_timestamp);
      }
    }

    return builder.build();
  }

  async listPaginated(params?: ContractListParams): Promise<ApiResult<ContractInfo[]>> {
    return this.getAllPaginated<ContractInfo>("contracts", this.buildContractListParams(params));
  }

  async listPaginatedPage(
    params?: ContractListParams,
  ): Promise<ApiResult<PaginatedResponse<ContractInfo>>> {
    return this.getSinglePage<ContractInfo>("contracts", this.buildContractListParams(params));
  }

  async listPaginatedPageByUrl(url: string): Promise<ApiResult<PaginatedResponse<ContractInfo>>> {
    return this.getSinglePageByUrl<ContractInfo>(url);
  }

  createContractPaginator(params?: ContractListParams): CursorPaginator<ContractInfo> {
    return super.createPaginator<ContractInfo>("contracts", this.buildContractListParams(params));
  }
}
