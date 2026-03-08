import { useQuery } from "@tanstack/react-query";
import type { UseQueryOptions, UseQueryResult } from "@tanstack/react-query";
import type { ApiResult, ApiError } from "@hieco/mirror";
import type {
  ExchangeRate,
  NetworkFee,
  NetworkNode,
  NetworkStake,
  NetworkSupply,
} from "@hieco/mirror";
import { useMirrorNodeClient, useNetwork } from "../context-hooks";
import { mirrorNodeKeys } from "@hieco/utils";

export interface UseNetworkExchangeRateOptions extends Omit<
  UseQueryOptions<ApiResult<ExchangeRate>, ApiError>,
  "queryKey" | "queryFn"
> {}

export type UseNetworkExchangeRateResult = UseQueryResult<ApiResult<ExchangeRate>, ApiError>;

export interface UseNetworkFeesOptions extends Omit<
  UseQueryOptions<ApiResult<NetworkFee>, ApiError>,
  "queryKey" | "queryFn"
> {}

export type UseNetworkFeesResult = UseQueryResult<ApiResult<NetworkFee>, ApiError>;

export interface UseNetworkNodesOptions extends Omit<
  UseQueryOptions<ApiResult<NetworkNode[]>, ApiError>,
  "queryKey" | "queryFn"
> {}

export type UseNetworkNodesResult = UseQueryResult<ApiResult<NetworkNode[]>, ApiError>;

export interface UseNetworkStakeOptions extends Omit<
  UseQueryOptions<ApiResult<NetworkStake>, ApiError>,
  "queryKey" | "queryFn"
> {}

export type UseNetworkStakeResult = UseQueryResult<ApiResult<NetworkStake>, ApiError>;

export interface UseNetworkSupplyOptions extends Omit<
  UseQueryOptions<ApiResult<NetworkSupply>, ApiError>,
  "queryKey" | "queryFn"
> {}

export type UseNetworkSupplyResult = UseQueryResult<ApiResult<NetworkSupply>, ApiError>;

export function useNetworkExchangeRate(
  options: UseNetworkExchangeRateOptions = {},
): UseNetworkExchangeRateResult {
  const client = useMirrorNodeClient();
  const { network } = useNetwork();

  return useQuery({
    ...options,
    queryKey: mirrorNodeKeys.network.exchangeRate(network),
    queryFn: async () => {
      return client.network.getExchangeRate();
    },
  });
}

export function useNetworkFees(options: UseNetworkFeesOptions = {}): UseNetworkFeesResult {
  const client = useMirrorNodeClient();
  const { network } = useNetwork();

  return useQuery({
    ...options,
    queryKey: mirrorNodeKeys.network.fees(network),
    queryFn: async () => {
      return client.network.getFees();
    },
  });
}

export function useNetworkNodes(options: UseNetworkNodesOptions = {}): UseNetworkNodesResult {
  const client = useMirrorNodeClient();
  const { network } = useNetwork();

  return useQuery({
    ...options,
    queryKey: mirrorNodeKeys.network.nodes(network),
    queryFn: async () => {
      return client.network.getNodes();
    },
  });
}

export function useNetworkStake(options: UseNetworkStakeOptions = {}): UseNetworkStakeResult {
  const client = useMirrorNodeClient();
  const { network } = useNetwork();

  return useQuery({
    ...options,
    queryKey: mirrorNodeKeys.network.stake(network),
    queryFn: async () => {
      return client.network.getStake();
    },
  });
}

export function useNetworkSupply(options: UseNetworkSupplyOptions = {}): UseNetworkSupplyResult {
  const client = useMirrorNodeClient();
  const { network } = useNetwork();

  return useQuery({
    ...options,
    queryKey: mirrorNodeKeys.network.supply(network),
    queryFn: async () => {
      return client.network.getSupply();
    },
  });
}
