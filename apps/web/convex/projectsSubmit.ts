"use node";

import { PublicKey } from "@hiero-ledger/sdk";
import { v } from "convex/values";
import type { Id } from "./_generated/dataModel";
import { internal } from "./_generated/api";
import { action } from "./_generated/server";

async function fetchAccountPublicKey(accountId: string): Promise<string> {
  const response = await fetch(
    `https://testnet.mirrornode.hedera.com/api/v1/accounts/${encodeURIComponent(accountId)}`,
  );

  if (!response.ok) {
    throw new Error("Failed to load the account from Hedera Mirror Node.");
  }

  const payload = (await response.json()) as {
    key?: {
      _type?: string;
      key?: string;
    };
  };

  if (!payload.key?.key || !payload.key._type) {
    throw new Error("Mirror Node returned an unexpected account payload.");
  }

  if (payload.key._type !== "ED25519" && payload.key._type !== "ECDSA_SECP256K1") {
    throw new Error("Only single ED25519 and ECDSA account keys are supported for submissions.");
  }

  return payload.key.key;
}

export const submitProject = action({
  args: {
    challengeId: v.id("walletChallenges"),
    accountId: v.string(),
    name: v.string(),
    slug: v.string(),
    projectUrl: v.string(),
    isOpenSource: v.boolean(),
    repositoryUrl: v.optional(v.string()),
    screenshotUrl: v.string(),
    description: v.string(),
    logoUrl: v.optional(v.string()),
    tagline: v.string(),
    useCases: v.array(
      v.union(
        v.literal("Payments"),
        v.literal("Tokenized Loyalty"),
        v.literal("NFT Marketplace"),
        v.literal("Gaming"),
        v.literal("Wallet Infrastructure"),
        v.literal("Onchain Identity"),
        v.literal("DAO Tools"),
        v.literal("DeFi"),
        v.literal("Social"),
        v.literal("Real World Assets"),
        v.literal("Supply Chain"),
        v.literal("Developer Tools"),
      ),
    ),
    packageNames: v.array(
      v.union(
        v.literal("Hieco Mirror"),
        v.literal("Hieco Mirror CLI"),
        v.literal("Hieco Mirror MCP"),
        v.literal("Hieco Mirror Preact"),
        v.literal("Hieco Mirror React"),
        v.literal("Hieco Mirror Solid"),
        v.literal("Hieco React"),
        v.literal("Hieco Realtime"),
        v.literal("Hieco Realtime React"),
        v.literal("Hieco SDK"),
        v.literal("Hieco Wallet"),
        v.literal("Hieco Wallet React"),
        v.literal("Hiero SDK"),
      ),
    ),
    signature: v.string(),
  },
  returns: v.object({
    projectId: v.id("projects"),
    status: v.union(
      v.literal("draft"),
      v.literal("pending"),
      v.literal("approved"),
      v.literal("rejected"),
    ),
  }),
  handler: async (
    ctx,
    args,
  ): Promise<{
    projectId: Id<"projects">;
    status: "draft" | "pending" | "approved" | "rejected";
  }> => {
    const challenge: {
      accountId: string;
      action: string;
      expiresAt: number;
      message: string;
      usedAt?: number;
    } | null = await ctx.runQuery(internal.projects.getChallenge, {
      challengeId: args.challengeId,
    });

    if (!challenge) {
      throw new Error("Challenge not found.");
    }

    if (challenge.accountId !== args.accountId) {
      throw new Error("Challenge account mismatch.");
    }

    if (challenge.action !== "submit_project") {
      throw new Error("Challenge action mismatch.");
    }

    if (challenge.usedAt) {
      throw new Error("Challenge has already been used.");
    }

    if (challenge.expiresAt < Date.now()) {
      throw new Error("Challenge has expired.");
    }

    const publicKey = PublicKey.fromString(await fetchAccountPublicKey(args.accountId));
    const signature = new Uint8Array(Buffer.from(args.signature, "base64"));
    const message = new TextEncoder().encode(
      `\u0019Hedera Signed Message:\n${challenge.message.length}${challenge.message}`,
    );

    if (!publicKey.verify(message, signature)) {
      throw new Error("The wallet signature could not be verified.");
    }

    return await ctx.runMutation(internal.projects.createProject, {
      challengeId: args.challengeId,
      accountId: args.accountId,
      name: args.name,
      slug: args.slug,
      projectUrl: args.projectUrl,
      isOpenSource: args.isOpenSource,
      repositoryUrl: args.repositoryUrl,
      screenshotUrl: args.screenshotUrl,
      description: args.description,
      logoUrl: args.logoUrl,
      tagline: args.tagline,
      useCases: args.useCases,
      packageNames: args.packageNames,
    });
  },
});
