import type { Signer } from "@hieco/sdk";

export interface HiecoSession {
  readonly status: "connected" | "disconnected";
  readonly signer?: Signer;
  readonly accountId?: string;
  readonly ledgerId?: string;
}

export function createHiecoSession(signer?: Signer): HiecoSession {
  if (!signer) {
    return {
      status: "disconnected",
    };
  }

  const accountId = signer.getAccountId().toString();
  const ledgerId = signer.getLedgerId()?.toString();

  return {
    status: "connected",
    signer,
    accountId,
    ledgerId,
  };
}

export function createHiecoSessionKey(session: HiecoSession): string {
  if (session.status === "disconnected") {
    return "disconnected";
  }

  return [session.ledgerId ?? "unknown", session.accountId ?? "unknown"].join(":");
}
