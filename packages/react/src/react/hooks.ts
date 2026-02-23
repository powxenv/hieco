import { useContext } from "react";
import { MirrorNodeContext } from "./provider";
import type { MirrorNodeClient } from "../core/mirror-client";

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

export interface MirrorNodeContextValue {
  client: MirrorNodeClient;
}
