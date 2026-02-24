import { useContext } from "solid-js";
import { MirrorNodeContext } from "./provider";
import type { MirrorNodeClient } from "@hiecom/mirror-node";
import type { MirrorNodeContextValue, NetworkState, AnyNetwork } from "./provider";

export function useMirrorNodeContext(): MirrorNodeContextValue {
  const context = useContext(MirrorNodeContext);

  if (!context) {
    throw new Error("useMirrorNodeContext must be used within a MirrorNodeProvider");
  }

  return context;
}

export function useMirrorNodeClient(): () => MirrorNodeClient {
  const { client } = useMirrorNodeContext();
  return client;
}

export function useNetwork(): NetworkState {
  const { network, mirrorNodeUrl, switchNetwork } = useMirrorNodeContext();

  return {
    network,
    mirrorNodeUrl,
    switchNetwork,
  };
}

export type { AnyNetwork, MirrorNodeContextValue, NetworkState };
