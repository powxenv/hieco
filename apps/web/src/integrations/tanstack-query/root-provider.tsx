import type { ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ConvexQueryClient } from "@convex-dev/react-query";
import { env } from "../../env";

let context:
  | {
      queryClient: QueryClient;
    }
  | undefined;

export const convexQueryClient = new ConvexQueryClient(env.VITE_CONVEX_URL);

export function getContext() {
  if (context) {
    return context;
  }

  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        queryKeyHashFn: convexQueryClient.hashFn(),
        queryFn: convexQueryClient.queryFn(),
      },
    },
  });

  convexQueryClient?.connect(queryClient);

  context = {
    queryClient,
  };

  return context;
}

export default function TanStackQueryProvider({ children }: { children: ReactNode }) {
  const { queryClient } = getContext();

  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}
