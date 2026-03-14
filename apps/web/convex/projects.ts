import { v } from "convex/values";
import { internalMutation, internalQuery } from "./_generated/server";

export const getChallenge = internalQuery({
  args: {
    challengeId: v.id("walletChallenges"),
  },
  returns: v.union(
    v.object({
      accountId: v.string(),
      action: v.string(),
      expiresAt: v.number(),
      message: v.string(),
      usedAt: v.optional(v.number()),
    }),
    v.null(),
  ),
  handler: async (ctx, args) => {
    const challenge = await ctx.db.get(args.challengeId);

    if (!challenge) {
      return null;
    }

    return {
      accountId: challenge.accountId,
      action: challenge.action,
      expiresAt: challenge.expiresAt,
      message: challenge.message,
      usedAt: challenge.usedAt,
    };
  },
});

export const createProject = internalMutation({
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
  },
  handler: async (ctx, args) => {
    const challenge = await ctx.db.get(args.challengeId);

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

    const existingProject = await ctx.db
      .query("projects")
      .withIndex("by_slug", (query) => query.eq("slug", args.slug))
      .unique();

    if (existingProject) {
      throw new Error("A project with this slug already exists.");
    }

    const status = "pending" as const;

    await ctx.db.patch(args.challengeId, {
      usedAt: Date.now(),
    });

    const projectId = await ctx.db.insert("projects", {
      ownerAccountId: args.accountId,
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
      status,
      updatedAt: Date.now(),
    });

    return { projectId, status };
  },
});
