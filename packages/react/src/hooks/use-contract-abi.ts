import { useMemo } from "react";
import { useHiecoClient } from "./use-hieco-client";

export function useContractAbi(
  abi: Parameters<ReturnType<typeof useHiecoClient>["contract"]["withAbi"]>[0],
) {
  const client = useHiecoClient();

  return useMemo(() => client.contract.withAbi(abi), [abi, client]);
}
