import type { ReactNode } from "react";
import { ConvexProvider } from "convex/react";
import { ConvexQueryClient } from "@convex-dev/react-query";
import { env } from "../../env";

const convexUrl = env.VITE_CONVEX_URL;

const convexQueryClient = typeof convexUrl === "string" ? new ConvexQueryClient(convexUrl) : null;

export default function AppConvexProvider({ children }: { children: ReactNode }): ReactNode {
  if (convexQueryClient === null) {
    return children;
  }

  return <ConvexProvider client={convexQueryClient.convexClient}>{children}</ConvexProvider>;
}
