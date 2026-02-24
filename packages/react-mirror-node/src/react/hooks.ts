import { useContext } from "react";
import { MirrorNodeContext } from "./provider";
import type { MirrorNodeClient } from "@hiecom/mirror-node";
import type { MirrorNodeContextValue, NetworkState, AnyNetwork } from "./provider";

export function useMirrorNodeContext(): MirrorNodeContextValue {
  const context = useContext(MirrorNodeContext);

  if (context === null) {
    throw new Error("useMirrorNodeContext must be used within a MirrorNodeProvider");
  }

  return context;
}

export function useMirrorNodeClient(): MirrorNodeClient {
  const { client } = useMirrorNodeContext();

  return client;
}

export function useNetwork<T extends string = AnyNetwork>(): NetworkState<T> {
  const { network, mirrorNodeUrl, switchNetwork } = useMirrorNodeContext();

  return {
    network: network as T,
    mirrorNodeUrl,
    switchNetwork: switchNetwork as (network: T) => void,
  };
}

export type { AnyNetwork, MirrorNodeContextValue, NetworkState };
