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
import { mirrorNodeKeys } from "@hieco/mirror-shared";

type NetworkQueryFnData<T> = ApiResult<T>;
type NetworkQueryError = ApiError;

export interface UseNetworkExchangeRateOptions extends Omit<
  UseQueryOptions<NetworkQueryFnData<ExchangeRate>, NetworkQueryError>,
  "queryKey" | "queryFn"
> {}

export type UseNetworkExchangeRateResult = UseQueryResult<
  NetworkQueryFnData<ExchangeRate>,
  NetworkQueryError
>;

export interface UseNetworkFeesOptions extends Omit<
  UseQueryOptions<NetworkQueryFnData<NetworkFee>, NetworkQueryError>,
  "queryKey" | "queryFn"
> {}

export type UseNetworkFeesResult = UseQueryResult<
  NetworkQueryFnData<NetworkFee>,
  NetworkQueryError
>;

export interface UseNetworkNodesOptions extends Omit<
  UseQueryOptions<NetworkQueryFnData<NetworkNode[]>, NetworkQueryError>,
  "queryKey" | "queryFn"
> {}

export type UseNetworkNodesResult = UseQueryResult<
  NetworkQueryFnData<NetworkNode[]>,
  NetworkQueryError
>;

export interface UseNetworkStakeOptions extends Omit<
  UseQueryOptions<NetworkQueryFnData<NetworkStake>, NetworkQueryError>,
  "queryKey" | "queryFn"
> {}

export type UseNetworkStakeResult = UseQueryResult<
  NetworkQueryFnData<NetworkStake>,
  NetworkQueryError
>;

export interface UseNetworkSupplyOptions extends Omit<
  UseQueryOptions<NetworkQueryFnData<NetworkSupply>, NetworkQueryError>,
  "queryKey" | "queryFn"
> {}

export type UseNetworkSupplyResult = UseQueryResult<
  NetworkQueryFnData<NetworkSupply>,
  NetworkQueryError
>;

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
