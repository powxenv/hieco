import type { ApiResult, PaginationParams, QueryOperator, Timestamp } from "../../types/rest-api";
import type {
  ContractCallParams,
  ContractCallResult,
  ContractInfo,
  ContractLog,
  ContractResult,
  ContractState,
  ContractResultDetails,
  ContractResultsResponse,
  ContractAction,
  ContractOpcodesResponse,
} from "../../types/entities/contract";
import type { EntityId } from "../../types/rest-api";
import type { CursorPaginator } from "../builders";
import { BaseApi } from "../base-api";

export interface ContractListParams extends PaginationParams {
  address?: string;
  smart_contract_id?: EntityId | QueryOperator<EntityId>;
  created_timestamp?: Timestamp | { from?: Timestamp; to?: Timestamp };
}

export interface ContractResultsParams extends PaginationParams {
  timestamp?: Timestamp;
}

export interface ContractStateParams extends PaginationParams {
  slot?: string;
}

export interface ContractLogsParams extends PaginationParams {
  timestamp?: Timestamp;
  index?: number;
}

export class ContractApi extends BaseApi {
  async getInfo(contractIdOrAddress: EntityId | string): Promise<ApiResult<ContractInfo>> {
    return this.getSingle<ContractInfo>(`contracts/${contractIdOrAddress}`);
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
    const builder = this.createQueryBuilder();

    if (params) {
      builder.addPagination(params);

      if (params.timestamp) {
        builder.add("timestamp", params.timestamp);
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
    const builder = this.createQueryBuilder();

    if (params) {
      builder.addPagination(params);

      if (params.slot) {
        builder.add("slot", params.slot);
      }
    }

    return this.getList<ContractState>(`contracts/${contractId}/state`, builder.build());
  }

  async getLogs(
    contractId: EntityId,
    params?: ContractLogsParams,
  ): Promise<ApiResult<ContractLog[]>> {
    const builder = this.createQueryBuilder();

    if (params) {
      builder.addPagination(params);

      if (params.timestamp) {
        builder.add("timestamp", params.timestamp);
      }
      if (params.index !== undefined) {
        builder.add("index", params.index);
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
    const builder = this.createQueryBuilder();

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
    const builder = this.createQueryBuilder();

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
  ): Promise<ApiResult<{ actions: ContractAction[] }>> {
    return this.getSingle<{ actions: ContractAction[] }>(
      `contracts/results/${transactionIdOrHash}/actions`,
    );
  }

  async getResultOpcodes(transactionIdOrHash: string): Promise<ApiResult<ContractOpcodesResponse>> {
    return this.getSingle<ContractOpcodesResponse>(
      `contracts/results/${transactionIdOrHash}/opcodes`,
    );
  }

  async getAllContractLogs(params?: {
    limit?: number;
    order?: "asc" | "desc";
    timestamp?: Timestamp;
    index?: number;
  }): Promise<ApiResult<{ logs: ContractLog[]; links: { next?: string } }>> {
    const builder = this.createQueryBuilder();

    if (params) {
      builder.addPagination(params);

      if (params.timestamp) {
        builder.addTimestamp(params.timestamp);
      }
      if (params.index !== undefined) {
        builder.add("index", params.index);
      }
    }

    return this.getSingle<{ logs: ContractLog[]; links: { next?: string } }>(
      "contracts/results/logs",
      builder.build(),
    );
  }

  async listPaginated(params?: ContractListParams): Promise<ApiResult<ContractInfo[]>> {
    const builder = this.createQueryBuilder();

    if (params) {
      builder.addPagination(params);

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

    return this.getAllPaginated<ContractInfo>("contracts", builder.build());
  }

  createContractPaginator(params?: ContractListParams): CursorPaginator<ContractInfo> {
    const builder = this.createQueryBuilder();

    if (params) {
      builder.addPagination(params);

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

    return super.createPaginator<ContractInfo>("contracts", builder.build());
  }
}
