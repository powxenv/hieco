import type { ApiResult, PaginationParams, QueryOperator, Timestamp } from "../../types/rest-api";
import type {
  ContractCallParams,
  ContractCallResult,
  ContractInfo,
  ContractLog,
  ContractResult,
  ContractState,
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
