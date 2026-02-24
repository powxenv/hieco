import { createContext, useMemo, type ReactNode } from "react";
import type { MirrorNodeClient } from "@hiecom/mirror-node";
import type { MirrorNodeContextValue } from "./hooks";

export const MirrorNodeContext = createContext<MirrorNodeContextValue | null>(null);

export interface MirrorNodeProviderProps {
  client: MirrorNodeClient;
  children: ReactNode;
}

export function MirrorNodeProvider({ client, children }: MirrorNodeProviderProps) {
  const value = useMemo<MirrorNodeContextValue>(
    () => ({
      client,
    }),
    [client],
  );

  return <MirrorNodeContext.Provider value={value}>{children}</MirrorNodeContext.Provider>;
}
