import { useQuery, useInfiniteQuery } from "@tanstack/react-query";
import type {
  UseQueryOptions,
  UseInfiniteQueryOptions,
  UseQueryResult,
  UseInfiniteQueryResult,
} from "@tanstack/react-query";
import type {
  ApiResult,
  ApiError,
  EntityId,
  QueryOperator,
  Timestamp,
} from "../../../types/rest-api";
import type {
  ContractCallParams,
  ContractCallResult,
  ContractInfo,
  ContractLog,
  ContractResult,
  ContractState,
} from "../../../types/entities/contract";
import { useMirrorNodeClient } from "../../../react/hooks";
import { mirrorNodeKeys } from "../query-keys";

export type {
  ContractListParams,
  ContractResultsParams,
  ContractStateParams,
  ContractLogsParams,
} from "../../../core/apis/contract-api";

type ContractQueryFnData<T> = ApiResult<T>;
type ContractQueryError = ApiError;

export interface UseContractInfoOptions extends Omit<
  UseQueryOptions<ContractQueryFnData<ContractInfo>, ContractQueryError>,
  "queryKey" | "queryFn"
> {
  contractIdOrAddress: EntityId | string;
}

export type UseContractInfoResult = UseQueryResult<
  ContractQueryFnData<ContractInfo>,
  ContractQueryError
>;

export interface UseContractCallOptions extends Omit<
  UseQueryOptions<ContractQueryFnData<ContractCallResult>, ContractQueryError>,
  "queryKey" | "queryFn"
> {
  params: ContractCallParams;
}

export type UseContractCallResult = UseQueryResult<
  ContractQueryFnData<ContractCallResult>,
  ContractQueryError
>;

export interface UseContractResultsOptions extends Omit<
  UseQueryOptions<ContractQueryFnData<ContractResult[]>, ContractQueryError>,
  "queryKey" | "queryFn"
> {
  contractId: EntityId;
  params?: { limit?: number; order?: "asc" | "desc"; timestamp?: Timestamp };
}

export type UseContractResultsResult = UseQueryResult<
  ContractQueryFnData<ContractResult[]>,
  ContractQueryError
>;

export interface UseContractResultOptions extends Omit<
  UseQueryOptions<ContractQueryFnData<ContractResult>, ContractQueryError>,
  "queryKey" | "queryFn"
> {
  contractId: EntityId;
  timestamp: Timestamp;
}

export type UseContractResultResult = UseQueryResult<
  ContractQueryFnData<ContractResult>,
  ContractQueryError
>;

export interface UseContractStateOptions extends Omit<
  UseQueryOptions<ContractQueryFnData<ContractState[]>, ContractQueryError>,
  "queryKey" | "queryFn"
> {
  contractId: EntityId;
  params?: { limit?: number; order?: "asc" | "desc"; slot?: string };
}

export type UseContractStateResult = UseQueryResult<
  ContractQueryFnData<ContractState[]>,
  ContractQueryError
>;

export interface UseContractLogsOptions extends Omit<
  UseQueryOptions<ContractQueryFnData<ContractLog[]>, ContractQueryError>,
  "queryKey" | "queryFn"
> {
  contractId: EntityId;
  params?: { limit?: number; order?: "asc" | "desc"; timestamp?: Timestamp; index?: number };
}

export type UseContractLogsResult = UseQueryResult<
  ContractQueryFnData<ContractLog[]>,
  ContractQueryError
>;

export interface UseContractsOptions extends Omit<
  UseQueryOptions<ContractQueryFnData<ContractInfo[]>, ContractQueryError>,
  "queryKey" | "queryFn"
> {
  params?: {
    limit?: number;
    order?: "asc" | "desc";
    address?: string;
    smart_contract_id?: EntityId | QueryOperator<EntityId>;
  };
}

export type UseContractsResult = UseQueryResult<
  ContractQueryFnData<ContractInfo[]>,
  ContractQueryError
>;

export interface UseContractsInfiniteOptions extends Omit<
  UseInfiniteQueryOptions<ContractQueryFnData<ContractInfo[]>, ContractQueryError>,
  "queryKey" | "queryFn" | "getNextPageParam"
> {
  params?: { limit?: number; order?: "asc" | "desc" };
}

export type UseContractsInfiniteResult = UseInfiniteQueryResult<
  ContractQueryFnData<ContractInfo[]>,
  ContractQueryError
>;

export function useContractInfo(options: UseContractInfoOptions): UseContractInfoResult {
  const client = useMirrorNodeClient();

  return useQuery({
    ...options,
    queryKey: mirrorNodeKeys.contract.info(options.contractIdOrAddress),
    queryFn: async () => {
      return client.contract.getInfo(options.contractIdOrAddress);
    },
    enabled: options.enabled !== false,
  });
}

export function useContractCall(options: UseContractCallOptions): UseContractCallResult {
  const client = useMirrorNodeClient();

  return useQuery({
    ...options,
    queryKey: ["mirror-node", "contract", "call"],
    queryFn: async () => {
      return client.contract.call(options.params);
    },
    enabled: options.enabled !== false,
  });
}

export function useContractResults(options: UseContractResultsOptions): UseContractResultsResult {
  const client = useMirrorNodeClient();

  return useQuery({
    ...options,
    queryKey: mirrorNodeKeys.contract.results(options.contractId),
    queryFn: async () => {
      return client.contract.getResults(options.contractId, options.params);
    },
    enabled: options.enabled !== false,
  });
}

export function useContractResult(options: UseContractResultOptions): UseContractResultResult {
  const client = useMirrorNodeClient();

  return useQuery({
    ...options,
    queryKey: mirrorNodeKeys.contract.result(options.contractId, options.timestamp),
    queryFn: async () => {
      return client.contract.getResult(options.contractId, options.timestamp);
    },
    enabled: options.enabled !== false,
  });
}

export function useContractState(options: UseContractStateOptions): UseContractStateResult {
  const client = useMirrorNodeClient();

  return useQuery({
    ...options,
    queryKey: mirrorNodeKeys.contract.state(options.contractId),
    queryFn: async () => {
      return client.contract.getState(options.contractId, options.params);
    },
    enabled: options.enabled !== false,
  });
}

export function useContractLogs(options: UseContractLogsOptions): UseContractLogsResult {
  const client = useMirrorNodeClient();

  return useQuery({
    ...options,
    queryKey: mirrorNodeKeys.contract.logs(options.contractId),
    queryFn: async () => {
      return client.contract.getLogs(options.contractId, options.params);
    },
    enabled: options.enabled !== false,
  });
}

export function useContracts(options: UseContractsOptions = {}): UseContractsResult {
  const client = useMirrorNodeClient();

  return useQuery({
    ...options,
    queryKey: mirrorNodeKeys.contract.list(),
    queryFn: async () => {
      return client.contract.listPaginated(options.params);
    },
  });
}

export function useContractsInfinite(
  options: UseContractsInfiniteOptions,
): UseContractsInfiniteResult {
  const client = useMirrorNodeClient();

  return useInfiniteQuery({
    ...options,
    queryKey: mirrorNodeKeys.contract.list(),
    queryFn: async () => {
      const params = {
        ...options.params,
        limit: options.params?.limit ?? 25,
      };

      const result = await client.contract.listPaginated(params);

      return result;
    },
    getNextPageParam: (lastPage) => {
      if (!lastPage.success || lastPage.data.length === 0) {
        return undefined;
      }
      return lastPage.data.length;
    },
    initialPageParam: 0,
  });
}
