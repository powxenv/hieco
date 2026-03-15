"use node";

import { proto } from "@hiero-ledger/proto";
import { PublicKey } from "@hiero-ledger/sdk";
import { v } from "convex/values";
import type { Id } from "./_generated/dataModel";
import { internal } from "./_generated/api";
import { action } from "./_generated/server";

async function fetchAccountKey(
  accountId: string,
): Promise<{ key: string; type: "ED25519" | "ECDSA_SECP256K1" }> {
  const response = await fetch(
    `https://testnet.mirrornode.hedera.com/api/v1/accounts/${encodeURIComponent(accountId)}`,
  );

  if (!response.ok) {
    throw new Error("Failed to load the account from Hedera Mirror Node.");
  }

  const payload = await response.json();
  const key = typeof payload === "object" && payload !== null ? payload.key : null;

  if (
    typeof key !== "object" ||
    key === null ||
    typeof key.key !== "string" ||
    (key._type !== "ED25519" && key._type !== "ECDSA_SECP256K1")
  ) {
    throw new Error("Only single ED25519 and ECDSA account keys are supported for submissions.");
  }

  return {
    key: key.key,
    type: key._type,
  };
}

function startsWithPrefix(value: Uint8Array, prefix: Uint8Array): boolean {
  if (prefix.length > value.length) {
    return false;
  }

  for (let index = 0; index < prefix.length; index += 1) {
    if (value[index] !== prefix[index]) {
      return false;
    }
  }

  return true;
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
    signatureMap: v.string(),
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
    const challenge = await ctx.runQuery(internal.projects.getChallenge, {
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

    const accountKey = await fetchAccountKey(args.accountId);
    const publicKey = PublicKey.fromString(accountKey.key);
    const signatureMap = proto.SignatureMap.decode(Buffer.from(args.signatureMap, "base64"));
    const accountPublicKeyBytes = publicKey.toBytesRaw();
    const challengeBytes = new TextEncoder().encode(challenge.message);
    const message = new TextEncoder().encode(
      `\u0019Hedera Signed Message:\n${challengeBytes.length}${challenge.message}`,
    );
    const signaturePair =
      signatureMap.sigPair.find((pair) => {
        const publicKeyPrefix = pair.pubKeyPrefix;

        if (!publicKeyPrefix || publicKeyPrefix.length === 0) {
          return signatureMap.sigPair.length === 1;
        }

        return startsWithPrefix(accountPublicKeyBytes, publicKeyPrefix);
      }) ?? null;

    if (!signaturePair) {
      throw new Error("The wallet did not return a signature for this account.");
    }

    const signature =
      accountKey.type === "ED25519" ? signaturePair.ed25519 : signaturePair.ECDSASecp256k1;

    if (!signature) {
      throw new Error("The wallet returned a signature pair with an unexpected key type.");
    }

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
