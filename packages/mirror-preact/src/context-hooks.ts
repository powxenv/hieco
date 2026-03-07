import { useContext } from "preact/hooks";
import { MirrorNodeContext } from "./provider";
import type { MirrorNodeClient } from "@hieco/mirror";
import type { MirrorNodeContextValue, AnyNetwork } from "./provider";

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

export function useNetwork(): Pick<
  MirrorNodeContextValue,
  "network" | "mirrorNodeUrl" | "switchNetwork"
> {
  const { network, mirrorNodeUrl, switchNetwork } = useMirrorNodeContext();

  return {
    network,
    mirrorNodeUrl,
    switchNetwork,
  };
}

export type { AnyNetwork, MirrorNodeContextValue };
