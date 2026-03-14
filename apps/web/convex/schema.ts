import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  projects: defineTable({
    ownerAccountId: v.string(),
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
    status: v.union(
      v.literal("draft"),
      v.literal("pending"),
      v.literal("approved"),
      v.literal("rejected"),
    ),
    updatedAt: v.number(),
  })
    .index("by_slug", ["slug"])
    .index("by_owner_account_id", ["ownerAccountId"])
    .index("by_status", ["status"])
    .index("by_open_source", ["isOpenSource"])
    .index("by_status_and_open_source", ["status", "isOpenSource"]),
  walletChallenges: defineTable({
    accountId: v.string(),
    action: v.string(),
    domain: v.string(),
    statement: v.string(),
    nonce: v.string(),
    message: v.string(),
    issuedAt: v.number(),
    expiresAt: v.number(),
    usedAt: v.optional(v.number()),
  })
    .index("by_account_id", ["accountId"])
    .index("by_expires_at", ["expiresAt"]),
});
