import { useHiecoSession } from "./use-hieco-session";

export function useHiecoAccount(): {
  readonly accountId: string | undefined;
  readonly ledgerId: string | undefined;
  readonly isConnected: boolean;
} {
  const session = useHiecoSession();

  return {
    accountId: session.accountId,
    ledgerId: session.ledgerId,
    isConnected: session.status === "connected",
  };
}
