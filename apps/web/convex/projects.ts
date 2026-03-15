import { v } from "convex/values";
import { internalMutation, internalQuery, query } from "./_generated/server";

const useCaseValidator = v.array(
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
);

const packageNameValidator = v.array(
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
);

const projectFilterArgs = {
  q: v.string(),
  openSource: v.boolean(),
  packageNames: packageNameValidator,
  useCases: useCaseValidator,
};

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
    useCases: useCaseValidator,
    packageNames: packageNameValidator,
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

    await ctx.db.patch(args.challengeId, {
      usedAt: Date.now(),
    });

    const status = "pending" as const;
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

export const listApproved = query({
  args: projectFilterArgs,
  handler: async (ctx, args) => {
    const projects = await (
      args.openSource
        ? ctx.db
            .query("projects")
            .withIndex("by_status_and_open_source", (query) =>
              query.eq("status", "approved").eq("isOpenSource", true),
            )
        : ctx.db.query("projects").withIndex("by_status", (query) => query.eq("status", "approved"))
    ).collect();
    const q = args.q.trim().toLowerCase();

    return [...projects]
      .filter((project) => {
        if (
          args.packageNames.length > 0 &&
          !args.packageNames.some((packageName) => project.packageNames.includes(packageName))
        ) {
          return false;
        }

        if (
          args.useCases.length > 0 &&
          !args.useCases.some((useCase) => project.useCases.includes(useCase))
        ) {
          return false;
        }

        if (q.length === 0) {
          return true;
        }

        return [
          project.name,
          project.tagline,
          project.description,
          ...project.packageNames,
          ...project.useCases,
        ]
          .join(" ")
          .toLowerCase()
          .includes(q);
      })
      .sort((left, right) => right.updatedAt - left.updatedAt);
  },
});

export const listByOwner = query({
  args: {
    ownerAccountId: v.string(),
    ...projectFilterArgs,
  },
  handler: async (ctx, args) => {
    const projects = await (
      args.openSource
        ? ctx.db
            .query("projects")
            .withIndex("by_owner_account_id_and_open_source", (query) =>
              query.eq("ownerAccountId", args.ownerAccountId).eq("isOpenSource", true),
            )
        : ctx.db
            .query("projects")
            .withIndex("by_owner_account_id", (query) =>
              query.eq("ownerAccountId", args.ownerAccountId),
            )
    ).collect();
    const q = args.q.trim().toLowerCase();

    return [...projects]
      .filter((project) => {
        if (
          args.packageNames.length > 0 &&
          !args.packageNames.some((packageName) => project.packageNames.includes(packageName))
        ) {
          return false;
        }

        if (
          args.useCases.length > 0 &&
          !args.useCases.some((useCase) => project.useCases.includes(useCase))
        ) {
          return false;
        }

        if (q.length === 0) {
          return true;
        }

        return [
          project.name,
          project.tagline,
          project.description,
          ...project.packageNames,
          ...project.useCases,
        ]
          .join(" ")
          .toLowerCase()
          .includes(q);
      })
      .sort((left, right) => right.updatedAt - left.updatedAt);
  },
});

export const getBySlug = query({
  args: {
    slug: v.string(),
    ownerAccountId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const project = await ctx.db
      .query("projects")
      .withIndex("by_slug", (query) => query.eq("slug", args.slug))
      .unique();

    if (!project) {
      return null;
    }

    if (project.status === "approved") {
      return project;
    }

    if (project.ownerAccountId === args.ownerAccountId) {
      return project;
    }

    return null;
  },
});
