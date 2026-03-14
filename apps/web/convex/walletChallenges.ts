import { mutation } from "./_generated/server";
import { v } from "convex/values";

const challengeLifetimeMs = 5 * 60 * 1000;

function createNonce(): string {
  return crypto.randomUUID().replaceAll("-", "") + crypto.randomUUID().replaceAll("-", "");
}

function normalizeDomain(domain: string): string {
  return domain.trim().toLowerCase();
}

function buildMessage(input: {
  action: string;
  accountId: string;
  domain: string;
  expiresAt: number;
  issuedAt: number;
  nonce: string;
  statement: string;
}): string {
  return [
    input.domain,
    "",
    input.statement,
    "",
    `Account ID: ${input.accountId}`,
    `Action: ${input.action}`,
    `Nonce: ${input.nonce}`,
    `Issued At: ${new Date(input.issuedAt).toISOString()}`,
    `Expires At: ${new Date(input.expiresAt).toISOString()}`,
  ].join("\n");
}

export const requestChallenge = mutation({
  args: {
    accountId: v.string(),
    action: v.string(),
    domain: v.string(),
  },
  returns: v.object({
    accountId: v.string(),
    action: v.string(),
    challengeId: v.id("walletChallenges"),
    expiresAt: v.number(),
    message: v.string(),
  }),
  handler: async (ctx, args) => {
    const issuedAt = Date.now();
    const expiresAt = issuedAt + challengeLifetimeMs;
    const domain = normalizeDomain(args.domain);
    const statement = "Sign this message to prove you control this wallet before continuing.";
    const nonce = createNonce();
    const message = buildMessage({
      action: args.action,
      accountId: args.accountId,
      domain,
      expiresAt,
      issuedAt,
      nonce,
      statement,
    });

    const challengeId = await ctx.db.insert("walletChallenges", {
      accountId: args.accountId,
      action: args.action,
      domain,
      statement,
      nonce,
      message,
      issuedAt,
      expiresAt,
    });

    return {
      accountId: args.accountId,
      action: args.action,
      challengeId,
      expiresAt,
      message,
    };
  },
});
