import type { ReactNode } from "react";
import { ConvexProvider } from "convex/react";
import { convexQueryClient } from "../tanstack-query/root-provider";

export default function AppConvexProvider({ children }: { children: ReactNode }): ReactNode {
  return <ConvexProvider client={convexQueryClient.convexClient}>{children}</ConvexProvider>;
}
